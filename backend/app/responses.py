"""Form responses/submissions routes"""
import re
import json
import secrets
from datetime import datetime
from flask import Blueprint, request, jsonify
from app import db
from app.models import Form, FormResponse, User
from app.utils import validate_session

responses_bp = Blueprint('responses', __name__)


@responses_bp.route("/api/responses", methods=["GET"])
def get_responses():
    """Get all responses for user's forms (grouped by form)"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    rows = db.session.query(FormResponse, Form, User).join(
        Form, FormResponse.form_id == Form.id
    ).outerjoin(
        User, FormResponse.user_id == User.id
    ).filter(Form.user_id == user.id).all()
    
    data = []
    for response, form, user_obj in rows:
        if not response.edit_token:
            response.edit_token = secrets.token_hex(16)
            db.session.commit()

        data.append({
            "id": response.id,
            "formId": form.id,
            "formName": form.name,
            "formSettings": json.loads(form.settings or "{}"),
            "user": {
                "id": user_obj.id if user_obj else None,
                "username": user_obj.username if user_obj else "Anonymous",
                "email": user_obj.email if user_obj else None,
            },
            "answers": json.loads(response.answers),
            "editToken": response.edit_token,
            "submittedAt": response.created_at.isoformat(),
        })
    return jsonify(data)


@responses_bp.route("/api/forms/<int:form_id>/responses", methods=["GET"])
def get_form_responses(form_id):
    """Get all responses for a specific form"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    form = Form.query.filter_by(id=form_id, user_id=user.id).first()
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    responses = FormResponse.query.filter_by(form_id=form.id).all()
    result = []
    for r in responses:
        if not r.edit_token:
            r.edit_token = secrets.token_hex(16)
            db.session.commit()

        user_obj = User.query.get(r.user_id) if r.user_id else None
        result.append({
            "id": r.id,
            "formId": r.form_id,
            "formSettings": json.loads(form.settings or "{}"),
            "user": {
                "id": user_obj.id,
                "username": user_obj.username,
                "email": user_obj.email,
            },
            "answers": json.loads(r.answers),
            "editToken": r.edit_token,
            "submittedAt": r.created_at.isoformat(),
        })
    return jsonify(result)


def _validate_field_value(field: dict, value: str) -> tuple[bool, str]:
    """Validate field value against field type and constraints.
    
    Returns:
        tuple: (is_valid, error_message)
    import secrets
    """
    if not value:
        return True, ""
    
    field_label = field.get('label', 'This field')
    field_type = field.get('type')
    
    if field_type == "number":
        try:
            float(value)
        except ValueError:
            return False, f"{field_label} must be a valid number."
    
    elif field_type == "date":
        try:
            datetime.fromisoformat(value)
        except ValueError:
            return False, f"{field_label} must be a valid date."
    
    elif field_type == "time":
        if not re.match(r"^\d{2}:\d{2}$", value):
            return False, f"{field_label} must be a valid time."
    
    return True, ""

def _validate_required_field(field: dict, answer: dict) -> tuple[bool, str]:
    """Validate that required field is provided.
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not field.get("required"):
        return True, ""
    
    value = ""
    if answer:
        value = str(answer.get("value", "")).strip()
    
    if field.get("type") == "checkbox":
        if not value:
            field_label = field.get('label', 'This field')
            return False, f"{field_label} is required."
    elif not value:
        field_label = field.get('label', 'This field')
        return False, f"{field_label} is required."
    
    return True, ""


@responses_bp.route("/api/forms/<int:form_id>/responses", methods=["POST"])
def submit_form_response(form_id):
    """Submit form response with validation"""
    user = validate_session()
    
    form = Form.query.get(form_id)
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    data = request.get_json()
    if not data or not data.get("answers"):
        return jsonify({"error": "Submission answers required"}), 400
    
    answers = data["answers"]
    if not isinstance(answers, list):
        return jsonify({"error": "Submission answers must be an array"}), 400
    
    # Validate form fields
    try:
        field_defs = json.loads(form.fields)
    except Exception:
        return jsonify({"error": "Invalid form field definition"}), 500
    
    # Validate each field
    for field in field_defs:
        field_id = field.get("id")
        answer = next(
            (item for item in answers if item.get("fieldId") == field_id),
            None
        )
        
        # Check required fields
        is_valid, error_msg = _validate_required_field(field, answer)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
        
        # Validate field value
        value = ""
        if answer:
            value = str(answer.get("value", "")).strip()
        
        is_valid, error_msg = _validate_field_value(field, value)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
    
            edit_token=secrets.token_hex(16),
    # If form owner is submitting, treat as preview (don't persist)
    if user and user.id == form.user_id:
        return jsonify({"status": "preview"}), 200
    
    # Create and save response
    response = FormResponse(
        form_id=form.id,
        user_id=user.id if user else None,
        answers=json.dumps(answers),
        edit_token=secrets.token_hex(16),
    )
    
    db.session.add(response)
    db.session.commit()
    return jsonify({"id": response.id, "status": "ok"}), 201


@responses_bp.route("/api/responses/<int:response_id>", methods=["PUT"])
def update_form_response(response_id):
    """Update a form response"""
    token = None
    if request.is_json:
        token = request.json.get("token")
    user = validate_session()
    
    response = FormResponse.query.get(response_id)
    if not response:
        return jsonify({"error": "Response not found"}), 404
    
    form = Form.query.get(response.form_id)
    if not form:
        return jsonify({"error": "Form not found"}), 404

    if token and response.edit_token == token:
        pass
    elif not user:
        return jsonify({"error": "Unauthorized"}), 401
    elif form.user_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    if not data or not data.get("answers"):
        return jsonify({"error": "Submission answers required"}), 400
    
    answers = data["answers"]
    if not isinstance(answers, list):
        return jsonify({"error": "Submission answers must be an array"}), 400
    
    # Validate form fields
    try:
        field_defs = json.loads(form.fields)
    except Exception:
        return jsonify({"error": "Invalid form field definition"}), 500
    
    # Validate each field
    for field in field_defs:
        field_id = field.get("id")
        answer = next(
            (item for item in answers if item.get("fieldId") == field_id),
            None
        )
        
        is_valid, error_msg = _validate_required_field(field, answer)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
        
        value = ""
        if answer:
            value = str(answer.get("value", "")).strip()
        
        is_valid, error_msg = _validate_field_value(field, value)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
    
    # Update response
    response.answers = json.dumps(answers)
    db.session.commit()
    return jsonify({"id": response.id, "status": "updated"}), 200


@responses_bp.route("/api/responses/<int:response_id>", methods=["GET"])
def get_form_response(response_id):
    """Get a single response by id. Accessible to form owner or with a valid edit token."""
    token = request.args.get("token")
    user = validate_session()

    response = FormResponse.query.get(response_id)
    if not response:
        return jsonify({"error": "Response not found"}), 404

    form = Form.query.get(response.form_id)
    if not form:
        return jsonify({"error": "Form not found"}), 404

    allowed = False
    if token and response.edit_token == token:
        allowed = True
    elif user:
        if form.user_id == user.id:
            allowed = True
        elif response.user_id == user.id:
            allowed = True

    if not allowed:
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify({
        "id": response.id,
        "formId": response.form_id,
        "answers": json.loads(response.answers),
        "submittedAt": response.created_at.isoformat(),
    })


@responses_bp.route("/api/responses/<int:response_id>", methods=["DELETE"])
def delete_form_response(response_id):
    """Delete a form response"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    response = FormResponse.query.get(response_id)
    if not response:
        return jsonify({"error": "Response not found"}), 404
    
    # Check if user owns the form this response is for
    form = Form.query.get(response.form_id)
    if not form or form.user_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403
    
    db.session.delete(response)
    db.session.commit()
    return jsonify({"status": "deleted"}), 200

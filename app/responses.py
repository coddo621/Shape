"""Form responses/submissions routes"""
import re
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from app import db
from app.models import Form, FormResponse, User
from app.utils import validate_session

responses_bp = Blueprint('responses', __name__)


@responses_bp.route("/responses", methods=["GET"])
def get_responses():
    """Get all responses for user's forms (grouped by form)"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    rows = db.session.query(FormResponse, Form, User).join(
        Form, FormResponse.form_id == Form.id
    ).join(
        User, FormResponse.user_id == User.id
    ).filter(Form.user_id == user.id).all()
    
    data = []
    for response, form, user_obj in rows:
        data.append({
            "id": response.id,
            "formId": form.id,
            "formName": form.name,
            "user": {
                "id": user_obj.id,
                "username": user_obj.username,
                "email": user_obj.email,
            },
            "answers": json.loads(response.answers),
            "submittedAt": response.created_at.isoformat(),
        })
    return jsonify(data)


@responses_bp.route("/forms/<int:form_id>/responses", methods=["GET"])
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
        user_obj = User.query.get(r.user_id)
        result.append({
            "id": r.id,
            "formId": r.form_id,
            "user": {
                "id": user_obj.id,
                "username": user_obj.username,
                "email": user_obj.email,
            },
            "answers": json.loads(r.answers),
            "submittedAt": r.created_at.isoformat(),
        })
    return jsonify(result)


def _validate_field_value(field: dict, value: str) -> tuple[bool, str]:
    """Validate field value against field type and constraints.
    
    Returns:
        tuple: (is_valid, error_message)
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


@responses_bp.route("/forms/<int:form_id>/responses", methods=["POST"])
def submit_form_response(form_id):
    """Submit form response with validation"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
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
    
    # If form owner is submitting, treat as preview (don't persist)
    if user.id == form.user_id:
        return jsonify({"status": "preview"}), 200
    
    # Create and save response
    response = FormResponse(
        form_id=form.id,
        user_id=user.id,
        answers=json.dumps(answers)
    )
    
    db.session.add(response)
    db.session.commit()
    return jsonify({"id": response.id, "status": "ok"}), 201

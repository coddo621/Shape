"""Form management routes (CRUD operations)"""
import json
from flask import Blueprint, request, jsonify
from app import db
from app.models import Form, FormResponse
from app.utils import validate_session

forms_bp = Blueprint('forms', __name__)


@forms_bp.route("/api/forms", methods=["GET"])
def get_forms():
    """Get all forms for current user"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    forms = Form.query.filter_by(user_id=user.id).all()
    return jsonify([{
        "id": f.id,
        "name": f.name,
        "description": f.description,
        "fields": json.loads(f.fields),
        "settings": json.loads(f.settings or "{}"),
        "userId": f.user_id,
        "createdAt": f.created_at.isoformat()
    } for f in forms])


@forms_bp.route("/api/forms", methods=["POST"])
def create_form():
    """Create new form"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    if not data or not data.get("name") or not data.get("fields"):
        return jsonify({"error": "Name and fields required"}), 400
    
    form = Form(
        name=data["name"],
        description=data.get("description", ""),
        fields=json.dumps(data["fields"]),
        settings=json.dumps(data.get("settings", {})),
        user_id=user.id,
    )
    db.session.add(form)
    db.session.commit()
    return jsonify({"id": form.id, "status": "ok"}), 201


@forms_bp.route("/api/forms/<int:form_id>", methods=["GET"])
def get_form(form_id):
    """Get form details (requires ownership)"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    form = Form.query.filter_by(id=form_id, user_id=user.id).first()
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    return jsonify({
        "id": form.id,
        "name": form.name,
        "description": form.description,
        "fields": json.loads(form.fields),
        "settings": json.loads(form.settings or "{}"),
        "userId": form.user_id,
        "createdAt": form.created_at.isoformat()
    })


@forms_bp.route("/api/forms/<int:form_id>", methods=["PUT"])
def update_form(form_id):
    """Update form"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    form = Form.query.filter_by(id=form_id, user_id=user.id).first()
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    data = request.get_json()
    if not data or not data.get("name") or not data.get("fields"):
        return jsonify({"error": "Name and fields required"}), 400
    
    form.name = data["name"]
    form.description = data.get("description", "")
    form.fields = json.dumps(data["fields"])
    form.settings = json.dumps(data.get("settings", {}))
    db.session.commit()
    
    return jsonify({"status": "ok"}), 200


@forms_bp.route("/api/forms/<int:form_id>", methods=["DELETE"])
def delete_form(form_id):
    """Delete form and its responses"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    form = Form.query.filter_by(id=form_id, user_id=user.id).first()
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    FormResponse.query.filter_by(form_id=form.id).delete()
    db.session.delete(form)
    db.session.commit()
    return jsonify({"status": "deleted"}), 200


@forms_bp.route("/api/share/<int:form_id>", methods=["GET"])
def share_form(form_id):
    """Get public form for sharing (no auth required)"""
    form = Form.query.get(form_id)
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    return jsonify({
        "id": form.id,
        "name": form.name,
        "description": form.description,
        "fields": json.loads(form.fields),
        "settings": json.loads(form.settings or "{}"),
        "createdAt": form.created_at.isoformat()
    })

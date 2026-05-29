"""User preferences routes (dark mode, default form settings)"""
import json
from flask import Blueprint, request, jsonify
from app import db
from app.utils import validate_session

preferences_bp = Blueprint('preferences', __name__)


@preferences_bp.route("/user/preferences", methods=["GET"])
def get_user_preferences():
    """Get user preferences (dark mode, default form settings)"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({
        "dark_mode": user.dark_mode,
        "defaultFormSettings": json.loads(user.default_form_settings or "{}")
    })


@preferences_bp.route("/user/preferences", methods=["PUT"])
def update_user_preferences():
    """Update user preferences"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    if "dark_mode" in data:
        user.dark_mode = bool(data["dark_mode"])
    
    if "defaultFormSettings" in data:
        user.default_form_settings = json.dumps(data["defaultFormSettings"] or {})
    
    db.session.commit()
    return jsonify({"status": "ok"})

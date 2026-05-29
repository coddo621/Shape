"""Authentication routes (signup, login, logout, me)"""
import secrets
import json
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import User
from app.utils import validate_session

auth_bp = Blueprint('auth', __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """Create new user account"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        if not data.get("email"):
            return jsonify({"error": "Email is required"}), 400
        
        if not data.get("username"):
            return jsonify({"error": "Username is required"}), 400
        
        if not data.get("password"):
            return jsonify({"error": "Password is required"}), 400
        
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email already registered"}), 400
        
        if User.query.filter_by(username=data["username"]).first():
            return jsonify({"error": "Username already taken"}), 400
        
        password_hash = generate_password_hash(data["password"], method="pbkdf2:sha256")
        
        user = User(
            email=data["email"],
            username=data["username"],
            password=password_hash,
        )
        
        db.session.add(user)
        db.session.commit()
        print(f"User created: {user.username}")
        
        return jsonify({"status": "ok"}), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Signup failed: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and create session"""
    try:
        data = request.get_json()
        
        if not data or not data.get("username") or not data.get("password"):
            return jsonify({"error": "Username and password required"}), 400
        
        user = User.query.filter_by(username=data["username"]).first()
        
        if not user or not check_password_hash(user.password, data["password"]):
            return jsonify({"error": "Invalid username or password"}), 401
        
        # Generate new session token and invalidate old one
        new_token = secrets.token_hex(32)
        user.session_token = new_token
        db.session.commit()
        
        session["user_id"] = user.id
        session["session_token"] = new_token
        session.permanent = True
        return jsonify({"status": "ok"}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Login error: {str(e)}")
        return jsonify({"error": "Login failed"}), 500


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Clear user session"""
    user = validate_session()
    if user:
        # Clear session token from database
        user.session_token = None
        db.session.commit()
    
    session.clear()
    return jsonify({"status": "ok"}), 200


@auth_bp.route("/me", methods=["GET"])
def me():
    """Get current user profile"""
    user = validate_session()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "dark_mode": user.dark_mode,
        "defaultFormSettings": json.loads(user.default_form_settings or "{}")
    })

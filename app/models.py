"""Database models for Shape application"""
from datetime import datetime
from app import db

class User(db.Model):
    """User account model"""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    dark_mode = db.Column(db.Boolean, default=False, nullable=False)
    default_form_settings = db.Column(db.Text, nullable=False, default='{}')
    session_token = db.Column(db.String(255), nullable=True, unique=True)


class Form(db.Model):
    """Form definition model"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    fields = db.Column(db.Text, nullable=False)  # JSON string
    settings = db.Column(db.Text, nullable=False, default='{}')  # JSON string
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class FormResponse(db.Model):
    """Form submission/response model"""
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.Integer, db.ForeignKey('form.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    answers = db.Column(db.Text, nullable=False)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

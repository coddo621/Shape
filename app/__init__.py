"""Flask app factory and configuration"""
import os
import secrets
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import timedelta

load_dotenv()

db = SQLAlchemy()

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Import configuration utilities
    from app.utils import resolve_path, resolve_sqlite_url
    
    # CORS Configuration
    allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    CORS(app, supports_credentials=True, origins=allowed_origins)
    
    # Secret key configuration
    flask_secret = os.getenv("FLASK_SECRET_KEY")
    is_production = os.getenv("FLASK_ENV", "development") == "production"
    
    if not flask_secret:
        if is_production:
            raise ValueError(
                "CRITICAL: FLASK_SECRET_KEY not set in production!\n"
                "For deployment, set FLASK_SECRET_KEY via your platform's secret management:\n"
                "  - Cloud platforms (Heroku, AWS, etc.): Use their secrets dashboard\n"
                "  - Docker: Pass as environment variable or use Docker secrets\n"
                "  - Kubernetes: Use Secrets\n"
                "  - CI/CD: Set in your pipeline (GitHub Actions, GitLab CI, etc.)\n"
                "  - Generate locally: python3 -c 'import secrets; print(secrets.token_hex(32))'\n"
            )
        else:
            flask_secret = secrets.token_hex(32)
            print("WARNING: Development mode: Generated temporary secret key.")
            print("   To use a persistent key, create .env.local with: FLASK_SECRET_KEY=<your-key>")
    
    app.secret_key = flask_secret
    
    # Database Configuration
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    raw_instance_dir = os.getenv("INSTANCE_DIR", os.path.join(base_dir, "instance"))
    instance_dir = resolve_path(raw_instance_dir, os.path.join(base_dir, "instance"))
    os.makedirs(instance_dir, exist_ok=True)
    
    db_file = resolve_path(
        os.getenv("DATABASE_FILE", os.path.join(instance_dir, "users.db")),
        os.path.join(instance_dir, "users.db")
    )
    os.makedirs(os.path.dirname(db_file), exist_ok=True)
    
    app.config["SQLALCHEMY_DATABASE_URI"] = resolve_sqlite_url(
        os.getenv("DATABASE_URL", f"sqlite:///{db_file}")
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Session Configuration
    session_lifetime_hours = int(os.getenv("PERMANENT_SESSION_LIFETIME_HOURS", "1"))
    app.permanent_session_lifetime = timedelta(hours=session_lifetime_hours)
    
    app.config.update(
        SESSION_COOKIE_NAME=os.getenv("SESSION_COOKIE_NAME", "shap_sesh"),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SECURE=os.getenv("SESSION_COOKIE_SECURE", "False").strip().lower() in ["1", "true", "yes"],
        SESSION_COOKIE_SAMESITE=os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
    )
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    from app.auth import auth_bp
    from app.forms import forms_bp
    from app.responses import responses_bp
    from app.preferences import preferences_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(forms_bp)
    app.register_blueprint(responses_bp)
    app.register_blueprint(preferences_bp)
    
    return app

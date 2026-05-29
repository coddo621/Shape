"""Main entry point for Shape backend server"""
import os
from app import create_app, db
from app.models import User, Form, FormResponse
from app.utils import ensure_column_exists

app = create_app()


if __name__ == "__main__":
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Ensure all columns exist (for migrations)
        ensure_column_exists("form", "description", "ALTER TABLE form ADD COLUMN description TEXT")
        ensure_column_exists("form", "settings", "ALTER TABLE form ADD COLUMN settings TEXT")
        ensure_column_exists("user", "dark_mode", "ALTER TABLE user ADD COLUMN dark_mode BOOLEAN DEFAULT 0")
        ensure_column_exists("user", "default_form_settings", "ALTER TABLE user ADD COLUMN default_form_settings TEXT DEFAULT '{}' ")
        ensure_column_exists("user", "session_token", "ALTER TABLE user ADD COLUMN session_token VARCHAR(255) UNIQUE")
    
    debug_mode = os.getenv("FLASK_DEBUG", "False").strip().lower() in ["1", "true", "yes"]
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(host=host, port=port, debug=debug_mode)

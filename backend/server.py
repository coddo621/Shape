"""Main entry point for Shape backend server"""
import os
from sqlalchemy import inspect, text
from app import create_app, db
from app.models import User, Form, FormResponse
from app.utils import ensure_column_exists

app = create_app()


def ensure_nullable_column(table_name: str, column_name: str):
    inspector = inspect(db.engine)
    if table_name not in inspector.get_table_names():
        return

    result = db.session.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
    column_info = next((row for row in result if row[1] == column_name), None)
    if not column_info or column_info[3] == 0:
        return

    db.session.execute(text("PRAGMA foreign_keys=off"))
    db.session.execute(text(
        """
        CREATE TABLE form_response_new (
            id INTEGER PRIMARY KEY,
            form_id INTEGER NOT NULL,
            user_id INTEGER,
            answers TEXT NOT NULL,
            edit_token VARCHAR(255) UNIQUE,
            created_at DATETIME,
            FOREIGN KEY(form_id) REFERENCES form(id),
            FOREIGN KEY(user_id) REFERENCES user(id)
        )
        """
    ))
    db.session.execute(text(
        "INSERT INTO form_response_new (id, form_id, user_id, answers, edit_token, created_at) "
        "SELECT id, form_id, user_id, answers, edit_token, created_at FROM form_response"
    ))
    db.session.execute(text("DROP TABLE form_response"))
    db.session.execute(text("ALTER TABLE form_response_new RENAME TO form_response"))
    db.session.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_form_response_edit_token ON form_response(edit_token)"))
    db.session.execute(text("PRAGMA foreign_keys=on"))
    db.session.commit()


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
        ensure_column_exists("form_response", "edit_token", "ALTER TABLE form_response ADD COLUMN edit_token VARCHAR(255)")
        ensure_nullable_column("form_response", "user_id")
        if "form_response" in inspect(db.engine).get_table_names():
            try:
                db.session.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_form_response_edit_token ON form_response(edit_token)"))
                db.session.commit()
            except Exception:
                db.session.rollback()
    
    debug_mode = os.getenv("FLASK_DEBUG", "False").strip().lower() in ["1", "true", "yes"]
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(host=host, port=port, debug=debug_mode)

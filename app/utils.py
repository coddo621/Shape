"""Utility functions"""
import os
from flask import session
from sqlalchemy import inspect, text
from app import db
from app.models import User


def resolve_path(path: str | None, default: str) -> str:
    """Resolve relative path to absolute path"""
    if not path:
        return default
    if os.path.isabs(path):
        return path
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.abspath(os.path.join(base_dir, path))


def resolve_sqlite_url(url: str) -> str:
    """Resolve SQLite URL to absolute path"""
    if not url:
        return url
    if url.startswith("sqlite:///"):
        tail = url[10:]
        if tail == ":memory:":
            return url
        if tail.startswith("/"):
            return url
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return "sqlite:///" + os.path.abspath(os.path.join(base_dir, tail))
    return url


def validate_session():
    """Check if current session token matches user's active token.
    
    Returns:
        User: Current user if session is valid, None otherwise
    """
    user_id = session.get("user_id")
    session_token = session.get("session_token")
    
    if not user_id or not session_token:
        return None
    
    user = User.query.get(user_id)
    if not user or user.session_token != session_token:
        # Session token mismatch - user logged in elsewhere
        session.clear()
        return None
    
    return user


def ensure_column_exists(table_name: str, column_name: str, add_column_sql: str):
    """Ensure a column exists in database table, add if missing"""
    inspector = inspect(db.engine)
    if table_name not in inspector.get_table_names():
        return

    columns = [col["name"] for col in inspector.get_columns(table_name)]
    if column_name not in columns:
        try:
            db.session.execute(text(add_column_sql))
            db.session.commit()
            print(f"Added missing column {column_name} to {table_name}")
        except Exception as e:
            db.session.rollback()
            print(f"Could not add column {column_name} to {table_name}: {e}")

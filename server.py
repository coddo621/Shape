import os
import re
from dotenv import load_dotenv
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import inspect, text
from datetime import timedelta, datetime
import json

load_dotenv()

app = Flask(__name__)

base_dir = os.path.dirname(os.path.abspath(__file__))

def resolve_path(path: str | None, default: str) -> str:
    if not path:
        return default
    if os.path.isabs(path):
        return path
    return os.path.abspath(os.path.join(base_dir, path))


def resolve_sqlite_url(url: str) -> str:
    if not url:
        return url
    if url.startswith("sqlite:///"):
        tail = url[10:]
        if tail == ":memory:":
            return url
        if tail.startswith("/"):
            return url
        return "sqlite:///" + os.path.abspath(os.path.join(base_dir, tail))
    return url

allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
CORS(app, supports_credentials=True, origins=allowed_origins)

app.secret_key = os.getenv("FLASK_SECRET_KEY") or os.urandom(32)

raw_instance_dir = os.getenv("INSTANCE_DIR", os.path.join(base_dir, "instance"))
instance_dir = resolve_path(raw_instance_dir, os.path.join(base_dir, "instance"))
os.makedirs(instance_dir, exist_ok=True)

db_file = resolve_path(os.getenv("DATABASE_FILE", os.path.join(instance_dir, "users.db")), os.path.join(instance_dir, "users.db"))
os.makedirs(os.path.dirname(db_file), exist_ok=True)

app.config["SQLALCHEMY_DATABASE_URI"] = resolve_sqlite_url(os.getenv("DATABASE_URL", f"sqlite:///{db_file}"))
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

session_lifetime_hours = int(os.getenv("PERMANENT_SESSION_LIFETIME_HOURS", "1"))
app.permanent_session_lifetime = timedelta(hours=session_lifetime_hours)

app.config.update(
    SESSION_COOKIE_NAME=os.getenv("SESSION_COOKIE_NAME", "shap_sesh"),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=os.getenv("SESSION_COOKIE_SECURE", "False").strip().lower() in ["1", "true", "yes"],
    SESSION_COOKIE_SAMESITE=os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
)

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(120), unique = True, nullable = False)
    username = db.Column(db.String(120), unique = True, nullable = False)
    password = db.Column(db.String(255), nullable = False)
    dark_mode = db.Column(db.Boolean, default=False, nullable=False)

class Form(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    fields = db.Column(db.Text, nullable=False)  # JSON string
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FormResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.Integer, db.ForeignKey('form.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    answers = db.Column(db.Text, nullable=False)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@app.route("/signup", methods = ["POST"])
def signup():
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        print(f"Content-Type: {request.content_type}")
        
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
        
        password_hash = generate_password_hash(data["password"], method = "pbkdf2:sha256")

        user_instance = User(
            email = data["email"],
            username = data["username"],
            password = password_hash,
        )

        db.session.add(user_instance)
        db.session.commit()
        print(f"User created: {user_instance.username}")

        return jsonify({"status": "ok"}), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Signup failed: {str(e)}"}), 500

@app.route("/login", methods = ["POST"])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get("username") or not data.get("password"):
            return jsonify({"error": "Username and password required"}), 400
        
        user = User.query.filter_by(username = data["username"]).first()
        
        if not user or not check_password_hash(user.password, data["password"]):
            return jsonify({"error": "Invalid username or password"}), 401
        
        session["user_id"] = user.id
        session.permanent = True
        return jsonify({"status": "ok"}), 200
    
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": "Login failed"}), 500

@app.route("/me", methods=["GET"])
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user = User.query.get(user_id)
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "dark_mode": user.dark_mode
    })

@app.route("/user/preferences", methods=["GET"])
def get_user_preferences():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user = User.query.get(user_id)
    return jsonify({
        "dark_mode": user.dark_mode
    })

@app.route("/user/preferences", methods=["PUT"])
def update_user_preferences():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    user = User.query.get(user_id)
    
    if "dark_mode" in data:
        user.dark_mode = bool(data["dark_mode"])
    
    db.session.commit()
    return jsonify({"status": "ok"})

@app.route("/forms", methods=["GET"])
def get_forms():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    forms = Form.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": f.id,
        "name": f.name,
        "description": f.description,
        "fields": json.loads(f.fields),
        "userId": f.user_id,
        "createdAt": f.created_at.isoformat()
    } for f in forms])

@app.route("/forms", methods=["POST"])
def create_form():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    if not data or not data.get("name") or not data.get("fields"):
        return jsonify({"error": "Name and fields required"}), 400
    
    form = Form(
        name=data["name"],
        description=data.get("description", ""),
        fields=json.dumps(data["fields"]),
        user_id=user_id,
    )
    db.session.add(form)
    db.session.commit()
    return jsonify({"id": form.id, "status": "ok"}), 201

@app.route("/forms/<int:form_id>", methods=["GET"])
def get_form(form_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    form = Form.query.filter_by(id=form_id, user_id=user_id).first()
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    return jsonify({
        "id": form.id,
        "name": form.name,
        "description": form.description,
        "fields": json.loads(form.fields),
        "userId": form.user_id,
        "createdAt": form.created_at.isoformat()
    })

@app.route("/share/<int:form_id>", methods=["GET"])
def share_form(form_id):
    form = Form.query.get(form_id)
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    return jsonify({
        "id": form.id,
        "name": form.name,
        "description": form.description,
        "fields": json.loads(form.fields),
        "createdAt": form.created_at.isoformat()
    })

@app.route("/forms/<int:form_id>/responses", methods=["GET"])
def get_form_responses(form_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    form = Form.query.filter_by(id=form_id, user_id=user_id).first()
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    responses = FormResponse.query.filter_by(form_id=form.id).all()
    result = []
    for r in responses:
        user = User.query.get(r.user_id)
        result.append({
            "id": r.id,
            "formId": r.form_id,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "answers": json.loads(r.answers),
            "submittedAt": r.created_at.isoformat(),
        })
    return jsonify(result)

@app.route("/forms/<int:form_id>/responses", methods=["POST"])
def submit_form_response(form_id):
    user_id = session.get("user_id")
    if not user_id:
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

    try:
        field_defs = json.loads(form.fields)
    except Exception:
        return jsonify({"error": "Invalid form field definition"}), 500

    for field in field_defs:
        answer = next((item for item in answers if item.get("fieldId") == field.get("id")), None)
        value = ""
        if answer:
            value = str(answer.get("value", "")).strip()

        if field.get("required"):
            if field.get("type") == "checkbox":
                if not value:
                    return jsonify({"error": f"{field.get('label', 'This field')} is required."}), 400
            elif not value:
                return jsonify({"error": f"{field.get('label', 'This field')} is required."}), 400

        if value:
            if field.get("type") == "number":
                try:
                    float(value)
                except ValueError:
                    return jsonify({"error": f"{field.get('label', 'This field')} must be a valid number."}), 400
            if field.get("type") == "date":
                try:
                    datetime.fromisoformat(value)
                except ValueError:
                    return jsonify({"error": f"{field.get('label', 'This field')} must be a valid date."}), 400
            if field.get("type") == "time":
                if not re.match(r"^\d{2}:\d{2}$", value):
                    return jsonify({"error": f"{field.get('label', 'This field')} must be a valid time."}), 400

    response = FormResponse(
        form_id=form.id,
        user_id=user_id,
        answers=json.dumps(answers)
    )
    db.session.add(response)
    db.session.commit()
    return jsonify({"id": response.id, "status": "ok"}), 201

@app.route("/forms/<int:form_id>", methods=["DELETE"])
def delete_form(form_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    form = Form.query.filter_by(id=form_id, user_id=user_id).first()
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    FormResponse.query.filter_by(form_id=form.id).delete()
    db.session.delete(form)
    db.session.commit()
    return jsonify({"status": "deleted"}), 200

@app.route("/responses", methods=["GET"])
def get_responses():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    rows = db.session.query(FormResponse, Form, User).join(Form, FormResponse.form_id == Form.id).join(User, FormResponse.user_id == User.id).filter(Form.user_id == user_id).all()
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

@app.route("/forms/<int:form_id>", methods=["PUT"])
def update_form(form_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    form = Form.query.filter_by(id=form_id, user_id=user_id).first()
    if not form:
        return jsonify({"error": "Form not found"}), 404
    
    data = request.get_json()
    if not data or not data.get("name") or not data.get("fields"):
        return jsonify({"error": "Name and fields required"}), 400
    
    form.name = data["name"]
    form.description = data.get("description", "")
    form.fields = json.dumps(data["fields"])
    db.session.commit()
    
    return jsonify({"status": "ok"}), 200


def ensure_column_exists(table_name: str, column_name: str, add_column_sql: str):
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

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        ensure_column_exists("form", "description", "ALTER TABLE form ADD COLUMN description TEXT")
        ensure_column_exists("user", "dark_mode", "ALTER TABLE user ADD COLUMN dark_mode BOOLEAN DEFAULT 0")

    debug_mode = os.getenv("FLASK_DEBUG", "False").strip().lower() in ["1", "true", "yes"]
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(host=host, port=port, debug=debug_mode)
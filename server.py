from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

app.secret_key = "16f5d4ab741cc83dcb39fdb43ff59e9a31b1ee0c8cd386dfa62f47bde80790c6"

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.permanent_session_lifetime = timedelta(hours=1)

app.config.update(
    SESSION_COOKIE_NAME="shap_sesh",
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=False,  
    SESSION_COOKIE_SAMESITE="Lax"
)

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(120), unique = True, nullable = False)
    username = db.Column(db.String(120), unique = True, nullable = False)
    password = db.Column(db.String(255), nullable = False)

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
        "email": user.email
    })

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
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

app.permanent_session_lifetime = timedelta(seconds = 30)

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
    data = request.get_json()
    
    password_hash = generate_password_hash(data["password"], method = "pbkdf2:sha256")

    user_instance = User(
        email = data["email"],
        username = data["username"],
        password = password_hash,
    )

    db.session.add(user_instance)
    db.session.commit()

    return jsonify({"status": "ok"}), 201

@app.route("/login", methods = ["POST"])
def login():
    data = request.get_json()
    
    user = User.query.filter_by(username = data["username"]).first()
    
    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
    session["user_id"] = user.id
    session.permanent = True
    return jsonify({"status": "ok"}), 200

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

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
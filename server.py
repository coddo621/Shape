from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

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
    
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
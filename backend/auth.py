import jwt
from functools import wraps
from datetime import datetime, timedelta
from flask import request, jsonify, current_app
from models import User

def create_token(user):
    payload = {"sub": str(user.id), "username": user.username, "exp": datetime.utcnow() + timedelta(days=7)}
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        try:
            data = jwt.decode(auth[7:], current_app.config["SECRET_KEY"], algorithms=["HS256"])
            request.current_user = User.query.get(int(data["sub"]))
            if not request.current_user:
                return jsonify({"error": "Unauthorized"}), 401
        except jwt.PyJWTError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated

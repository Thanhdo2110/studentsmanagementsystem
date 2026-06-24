from datetime import datetime, date
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100))
    role = db.Column(db.String(20), default="admin")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, p): self.password_hash = generate_password_hash(p)
    def check_password(self, p): return check_password_hash(self.password_hash, p)
    def to_dict(self): return {"id": self.id, "username": self.username, "full_name": self.full_name, "role": self.role}

class Classroom(db.Model):
    __tablename__ = "classrooms"
    id = db.Column(db.Integer, primary_key=True)
    class_code = db.Column(db.String(20), unique=True, nullable=False)
    class_name = db.Column(db.String(50), nullable=False)
    grade = db.Column(db.String(20))
    teacher_name = db.Column(db.String(100))
    capacity = db.Column(db.Integer, default=40)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        count = Student.query.filter_by(class_name=self.class_name, owner_id=self.owner_id).count()
        return {**{c.name: getattr(self, c.name) for c in self.__table__.columns},
                "student_count": count, "created_at": self.created_at.isoformat() if self.created_at else None}

class Student(db.Model):
    __tablename__ = "students"
    id = db.Column(db.Integer, primary_key=True)
    student_code = db.Column(db.String(20), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(10))
    class_name = db.Column(db.String(50))
    address = db.Column(db.String(255))
    status = db.Column(db.String(20), default="active")
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id, "student_code": self.student_code, "full_name": self.full_name,
            "email": self.email, "phone": self.phone,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "gender": self.gender, "class_name": self.class_name, "address": self.address,
            "status": self.status, "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class ActivityLog(db.Model):
    __tablename__ = "activity_logs"
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(50), nullable=False)
    detail = db.Column(db.String(255))
    username = db.Column(db.String(50))
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {"id": self.id, "action": self.action, "detail": self.detail,
                "username": self.username, "created_at": self.created_at.isoformat() if self.created_at else None}

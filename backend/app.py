import csv, io, jwt
from datetime import datetime
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from sqlalchemy import func, or_, inspect, text
from config import Config
from models import db, User, Student, Classroom, ActivityLog
from auth import create_token, token_required

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)

def log_action(action, detail="", username="system", owner_id=1):
    db.session.add(ActivityLog(action=action, detail=detail, username=username, owner_id=owner_id))
    db.session.commit()

def ensure_owner_columns():
    inspector = inspect(db.engine)
    checks = {
        "students": "owner_id",
        "classrooms": "owner_id",
        "activity_logs": "owner_id",
    }
    for table, col in checks.items():
        cols = {c["name"] for c in inspector.get_columns(table)}
        if col not in cols:
            db.session.execute(text(f"ALTER TABLE {table} ADD COLUMN owner_id INT NOT NULL DEFAULT 1"))
            db.session.commit()

def seed():
    if not User.query.filter_by(username="admin").first():
        u = User(username="admin", full_name="Administrator", role="admin")
        u.set_password("admin123")
        db.session.add(u)
        db.session.commit()

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(username=data.get("username", "")).first()
    if not user or not user.check_password(data.get("password", "")):
        return jsonify({"error": "Sai tài khoản hoặc mật khẩu"}), 401
    token = create_token(user)
    log_action("login", f"Đăng nhập: {user.username}", user.username, user.id)
    return jsonify({"token": token, "user": user.to_dict()})

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username, password, full_name = data.get("username", "").strip(), data.get("password", ""), data.get("full_name", "").strip()
    if not username or not password or not full_name:
        return jsonify({"error": "Vui lòng điền đầy đủ thông tin"}), 400
    if len(password) < 6:
        return jsonify({"error": "Mật khẩu tối thiểu 6 ký tự"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Tài khoản đã tồn tại"}), 400
    user = User(username=username, full_name=full_name, role="user")
    user.set_password(password)
    db.session.add(user); db.session.commit()
    log_action("register", full_name, username, user.id)
    return jsonify({"message": "Đăng ký thành công, vui lòng đăng nhập"}), 201

@app.route("/api/auth/me")
@token_required
def me():
    return jsonify(request.current_user.to_dict())

# --- Students ---
@app.route("/api/students", methods=["GET"])
@token_required
def list_students():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", "").strip()
    status = request.args.get("status", "").strip()
    class_name = request.args.get("class_name", "").strip()
    query = Student.query.filter_by(owner_id=request.current_user.id)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Student.full_name.like(like), Student.student_code.like(like), Student.email.like(like)))
    if status: query = query.filter(Student.status == status)
    if class_name: query = query.filter(Student.class_name == class_name)
    p = query.order_by(Student.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({"students": [s.to_dict() for s in p.items], "total": p.total, "page": page, "per_page": per_page, "pages": p.pages})

@app.route("/api/students/<int:sid>", methods=["GET"])
@token_required
def get_student(sid):
    return jsonify(Student.query.filter_by(id=sid, owner_id=request.current_user.id).first_or_404().to_dict())

@app.route("/api/students", methods=["POST"])
@token_required
def create_student():
    data = request.get_json() or {}
    for f in ["student_code", "full_name", "email"]:
        if not data.get(f): return jsonify({"error": f"{f} is required"}), 400
    if Student.query.filter_by(student_code=data["student_code"], owner_id=request.current_user.id).first(): return jsonify({"error": "Mã HS đã tồn tại"}), 400
    if Student.query.filter_by(email=data["email"], owner_id=request.current_user.id).first(): return jsonify({"error": "Email đã tồn tại"}), 400
    s = Student(**{k: data.get(k) for k in ["student_code","full_name","email","phone","date_of_birth","gender","class_name","address"]}, status=data.get("status","active"))
    s.owner_id = request.current_user.id
    db.session.add(s); db.session.commit()
    log_action("create_student", s.full_name, request.current_user.username, request.current_user.id)
    return jsonify(s.to_dict()), 201

@app.route("/api/students/<int:sid>", methods=["PUT"])
@token_required
def update_student(sid):
    s = Student.query.filter_by(id=sid, owner_id=request.current_user.id).first_or_404()
    data = request.get_json() or {}
    for f in ["student_code","full_name","email","phone","date_of_birth","gender","class_name","address","status"]:
        if f in data: setattr(s, f, data[f])
    db.session.commit()
    log_action("update_student", s.full_name, request.current_user.username, request.current_user.id)
    return jsonify(s.to_dict())

@app.route("/api/students/<int:sid>", methods=["DELETE"])
@token_required
def delete_student(sid):
    s = Student.query.filter_by(id=sid, owner_id=request.current_user.id).first_or_404()
    name = s.full_name
    db.session.delete(s); db.session.commit()
    log_action("delete_student", name, request.current_user.username, request.current_user.id)
    return jsonify({"message": "Deleted"})

@app.route("/api/students/export")
@token_required
def export_students():
    students = Student.query.filter_by(owner_id=request.current_user.id).order_by(Student.id).all()
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["student_code","full_name","email","phone","date_of_birth","gender","class_name","address","status"])
    for s in students:
        w.writerow([s.student_code,s.full_name,s.email,s.phone,s.date_of_birth,s.gender,s.class_name,s.address,s.status])
    log_action("export_csv", f"{len(students)} học sinh", request.current_user.username, request.current_user.id)
    return Response(out.getvalue(), mimetype="text/csv", headers={"Content-Disposition": "attachment;filename=students.csv"})

@app.route("/api/students/import", methods=["POST"])
@token_required
def import_students():
    f = request.files.get("file")
    if not f: return jsonify({"error": "No file"}), 400
    reader = csv.DictReader(io.StringIO(f.read().decode("utf-8-sig")))
    ok, err = 0, []
    for i, row in enumerate(reader, 2):
        code, name, email = row.get("student_code","").strip(), row.get("full_name","").strip(), row.get("email","").strip()
        if not code or not name or not email: err.append(f"Dòng {i}: thiếu dữ liệu"); continue
        if Student.query.filter(
            Student.owner_id == request.current_user.id,
            (Student.student_code == code) | (Student.email == email)
        ).first(): err.append(f"Dòng {i}: trùng mã/email"); continue
        db.session.add(Student(student_code=code, full_name=name, email=email, phone=row.get("phone"), gender=row.get("gender"),
            class_name=row.get("class_name"), address=row.get("address"), status=row.get("status","active"), owner_id=request.current_user.id))
        ok += 1
    db.session.commit()
    log_action("import_csv", f"{ok} học sinh", request.current_user.username, request.current_user.id)
    return jsonify({"imported": ok, "errors": err})

# --- Classrooms ---
@app.route("/api/classrooms", methods=["GET"])
@token_required
def list_classrooms():
    return jsonify([c.to_dict() for c in Classroom.query.filter_by(owner_id=request.current_user.id).order_by(Classroom.id.desc()).all()])

@app.route("/api/classrooms", methods=["POST"])
@token_required
def create_classroom():
    data = request.get_json() or {}
    if not data.get("class_code") or not data.get("class_name"): return jsonify({"error": "Thiếu thông tin"}), 400
    if Classroom.query.filter_by(class_code=data["class_code"], owner_id=request.current_user.id).first(): return jsonify({"error": "Mã lớp đã tồn tại"}), 400
    c = Classroom(class_code=data["class_code"], class_name=data["class_name"], grade=data.get("grade"),
        teacher_name=data.get("teacher_name"), capacity=data.get("capacity", 40), owner_id=request.current_user.id)
    db.session.add(c); db.session.commit()
    log_action("create_class", c.class_name, request.current_user.username, request.current_user.id)
    return jsonify(c.to_dict()), 201

@app.route("/api/classrooms/<int:cid>", methods=["PUT"])
@token_required
def update_classroom(cid):
    c = Classroom.query.filter_by(id=cid, owner_id=request.current_user.id).first_or_404()
    data = request.get_json() or {}
    for f in ["class_code","class_name","grade","teacher_name","capacity"]:
        if f in data: setattr(c, f, data[f])
    db.session.commit()
    log_action("update_class", c.class_name, request.current_user.username, request.current_user.id)
    return jsonify(c.to_dict())

@app.route("/api/classrooms/<int:cid>", methods=["DELETE"])
@token_required
def delete_classroom(cid):
    c = Classroom.query.filter_by(id=cid, owner_id=request.current_user.id).first_or_404()
    name = c.class_name
    db.session.delete(c); db.session.commit()
    log_action("delete_class", name, request.current_user.username, request.current_user.id)
    return jsonify({"message": "Deleted"})

@app.route("/api/classes")
@token_required
def classes():
    rows = Classroom.query.with_entities(Classroom.class_name).filter_by(owner_id=request.current_user.id).all()
    extra = db.session.query(Student.class_name).filter(
        Student.owner_id == request.current_user.id,
        Student.class_name.isnot(None),
        Student.class_name != ""
    ).distinct().all()
    names = list({r[0] for r in rows + extra if r[0]})
    return jsonify(sorted(names))

# --- Stats & Activity ---
@app.route("/api/stats")
@token_required
def stats():
    total = Student.query.filter_by(owner_id=request.current_user.id).count()
    active = Student.query.filter_by(owner_id=request.current_user.id, status="active").count()
    inactive = Student.query.filter_by(owner_id=request.current_user.id, status="inactive").count()
    classes_data = db.session.query(Student.class_name, func.count(Student.id)).filter(
        Student.owner_id == request.current_user.id,
        Student.class_name.isnot(None),
        Student.class_name != ""
    ).group_by(Student.class_name).all()
    recent = Student.query.filter_by(owner_id=request.current_user.id).order_by(Student.created_at.desc()).limit(5).all()
    return jsonify({
        "total": total, "active": active, "inactive": inactive,
        "classroom_count": Classroom.query.filter_by(owner_id=request.current_user.id).count(),
        "classes": [{"name": c[0], "count": c[1]} for c in classes_data],
        "recent_students": [s.to_dict() for s in recent],
    })

@app.route("/api/activities")
@token_required
def activities():
    logs = ActivityLog.query.filter_by(owner_id=request.current_user.id).order_by(ActivityLog.id.desc()).limit(20).all()
    return jsonify([l.to_dict() for l in logs])

with app.app_context():
    db.create_all()
    ensure_owner_columns()
    seed()




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

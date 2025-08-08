from flask import Flask, make_response, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime, timedelta, date, time, timezone
from sqlalchemy.exc import IntegrityError
from fpdf import FPDF

app = Flask(__name__)
# --- CONFIGURATION ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:salha@localhost:3306/lecturer_class_attendance_tracking_system'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key_here'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1) 
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- INITIALIZATIONS ---
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# --- MODELS ---
class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    users = db.relationship('User', backref='department', lazy=True, cascade="all, delete-orphan")
    programs = db.relationship('Program', backref='department', lazy=True, cascade="all, delete-orphan")
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=True)
class Semester(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    semester_number = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    is_active = db.Column(db.Boolean, default=False, nullable=False)
    __table_args__ = (db.UniqueConstraint('year', 'semester_number', name='_year_semester_uc'),)
class Program(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    level = db.Column(db.String(50), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    duration_in_years = db.Column(db.Integer, nullable=False)
class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('program.id'), nullable=False)
    program = db.relationship('Program', backref='subjects')
    year_of_study = db.Column(db.Integer, nullable=False, default=1)
class ClassSchedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    lecturer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semester.id'), nullable=False)
    day_of_week = db.Column(db.String(15), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    subject = db.relationship('Subject')
    lecturer = db.relationship('User')
    semester = db.relationship('Semester')
class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    class_schedule_id = db.Column(db.Integer, db.ForeignKey('class_schedule.id'), nullable=False)
    cr_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    present = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    verified = db.Column(db.Boolean, default=False)
    excuse_comment = db.Column(db.Text)
    excuse_file = db.Column(db.String(300))
    excuse_uploaded_at = db.Column(db.DateTime)
    schedule = db.relationship('ClassSchedule', backref='attendances')

# --- AUTHENTICATION & PUBLIC ROUTES ---
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    if not all(k in data for k in ['full_name', 'email', 'password', 'role', 'department_id']):
        return jsonify({'msg': 'Missing required fields'}), 400
    email = data.get('email')
    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'Email already exists'}), 400
    hashed_password = generate_password_hash(data.get('password'))
    new_user = User(full_name=data.get('full_name'), email=email, password=hashed_password, role=data.get('role'), department_id=data.get('department_id'))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'msg': 'User registered successfully'}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if email == 'admin@example.com' and password == 'admin123':
        additional_claims = {"role": "Admin", "full_name": "Admin User"}
        access_token = create_access_token(identity=email, additional_claims=additional_claims)
        return jsonify(token=access_token)
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'msg': 'Bad credentials'}), 401
    additional_claims = {"role": user.role, "id": user.id, "full_name": user.full_name, "department_id": user.department_id}
    access_token = create_access_token(identity=user.email, additional_claims=additional_claims)
    return jsonify(token=access_token)

@app.route('/api/departments', methods=['GET'])
def get_public_departments():
    try:
        departments = Department.query.order_by(Department.name).all()
        return jsonify([{'id': d.id, 'name': d.name} for d in departments])
    except Exception as e:
        return jsonify({'msg': 'Failed to retrieve departments', 'error': str(e)}), 500

# --- ADMIN MANAGEMENT ROUTES ---
@app.route('/api/admin/departments', methods=['POST'])
@jwt_required()
def create_department():
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    data = request.json
    new_department = Department(name=data['name'])
    db.session.add(new_department)
    db.session.commit()
    return jsonify({'id': new_department.id, 'name': new_department.name}), 201

@app.route('/api/admin/departments/<int:department_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_single_department(department_id):
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    department = db.session.get(Department, department_id)
    if not department: return jsonify({'msg': 'Department not found'}), 404
    if request.method == 'PUT':
        data = request.json
        department.name = data.get('name', department.name)
        db.session.commit()
        return jsonify({'msg': 'Department updated'})
    if request.method == 'DELETE':
        if department.programs or department.users:
            return jsonify({'msg': 'Cannot delete: Department has programs or users'}), 400
        db.session.delete(department)
        db.session.commit()
        return jsonify({'msg': 'Department deleted'})

@app.route('/api/semesters', methods=['GET', 'POST'])
@jwt_required()
def manage_semesters():
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    if request.method == 'GET':
        semesters = Semester.query.order_by(Semester.year.desc(), Semester.semester_number.desc()).all()
        return jsonify([{'id': s.id, 'year': s.year, 'semester_number': s.semester_number, 'start_date': s.start_date.isoformat(), 'end_date': s.end_date.isoformat(), 'is_active': s.is_active} for s in semesters])
    if request.method == 'POST':
        data = request.json
        new_semester = Semester(year=int(data['year']), semester_number=int(data['semester_number']), start_date=date.fromisoformat(data['start_date']), end_date=date.fromisoformat(data['end_date']))
        db.session.add(new_semester)
        db.session.commit()
        return jsonify({'msg': 'Semester created', 'id': new_semester.id}), 201

@app.route('/api/admin/semesters/<int:semester_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_single_semester(semester_id):
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    semester = db.session.get(Semester, semester_id)
    if not semester: return jsonify({'msg': 'Semester not found'}), 404
    if request.method == 'PUT':
        data = request.json
        semester.year = data.get('year', semester.year)
        semester.semester_number = data.get('semester_number', semester.semester_number)
        semester.start_date = date.fromisoformat(data.get('start_date', semester.start_date.isoformat()))
        semester.end_date = date.fromisoformat(data.get('end_date', semester.end_date.isoformat()))
        db.session.commit()
        return jsonify({'msg': 'Semester updated'})
    if request.method == 'DELETE':
        if ClassSchedule.query.filter_by(semester_id=semester.id).first():
            return jsonify({'msg': 'Cannot delete: Semester is used in a timetable'}), 400
        db.session.delete(semester)
        db.session.commit()
        return jsonify({'msg': 'Semester deleted'})

@app.route('/api/semesters/activate/<int:semester_id>', methods=['POST'])
@jwt_required()
def activate_semester(semester_id):
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    Semester.query.filter_by(is_active=True).update({'is_active': False})
    target_semester = db.session.get(Semester, semester_id)
    if not target_semester: return jsonify({'msg': 'Semester not found'}), 404
    target_semester.is_active = True
    db.session.commit()
    return jsonify({'msg': f"Semester {target_semester.year} - {target_semester.semester_number} has been activated."})

@app.route('/api/semesters/deactivate', methods=['POST'])
@jwt_required()
def deactivate_semester():
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    active_semester = Semester.query.filter_by(is_active=True).first()
    if active_semester:
        active_semester.is_active = False
        db.session.commit()
        return jsonify({'msg': 'Semester deactivated successfully.'})
    return jsonify({'msg': 'No active semester to deactivate.'})

@app.route('/api/programs', methods=['GET', 'POST'])
@jwt_required()
def manage_programs():
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    if request.method == 'GET':
        programs = Program.query.join(Department).order_by(Program.name).all()
        return jsonify([{'id': p.id, 'name': p.name, 'level': p.level, 'department_id': p.department_id, 'department_name': p.department.name} for p in programs])
    if request.method == 'POST':
        data = request.json
        if not all(k in data for k in ['name', 'level', 'department_id', 'duration_in_years']):
            return jsonify({'msg': 'Missing required fields'}), 400
        
        new_program = Program(
            name=data['name'],
            level=data['level'],
            department_id=data['department_id'],
            duration_in_years=data['duration_in_years']
        )
        db.session.add(new_program)
        db.session.commit()
        return jsonify({'msg': 'Program created successfully', 'id': new_program.id}), 201
    

@app.route('/api/admin/programs/<int:program_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_single_program(program_id):
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    program = db.session.get(Program, program_id)
    if not program: return jsonify({'msg': 'Program not found'}), 404
    if request.method == 'PUT':
        data = request.json
        program.name = data.get('name', program.name)
        program.level = data.get('level', program.level)
        program.department_id = data.get('department_id', program.department_id)
        program.duration_in_years = data.get('duration_in_years', program.duration_in_years)
        db.session.commit()
        return jsonify({'msg': 'Program updated'})
    if request.method == 'DELETE':
        if program.subjects:
            return jsonify({'msg': 'Cannot delete: Program has assigned subjects'}), 400
        db.session.delete(program)
        db.session.commit()
        return jsonify({'msg': 'Program deleted'})

@app.route('/api/subjects', methods=['GET', 'POST'])
@jwt_required()
def manage_subjects():
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    if request.method == 'GET':
        subjects = Subject.query.join(Program).order_by(Subject.name).all()
        return jsonify([{'id': s.id, 'name': s.name, 'code': s.code, 'program_id': s.program_id, 'program_name': s.program.name} for s in subjects])
    if request.method == 'POST':
        data = request.json
        if not all(k in data for k in ['name', 'code', 'program_id', 'year_of_study']):
            return jsonify({'msg': 'Missing required fields'}), 400
        
        new_subject = Subject(
            name=data['name'],
            code=data['code'],
            program_id=data['program_id'],
            year_of_study=data['year_of_study']
        )
        db.session.add(new_subject)
        db.session.commit()
        return jsonify({'msg': 'Subject created successfully', 'id': new_subject.id}), 201

@app.route('/api/admin/subjects/<int:subject_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_single_subject(subject_id):
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    subject = db.session.get(Subject, subject_id)
    if not subject: return jsonify({'msg': 'Subject not found'}), 404
    if request.method == 'PUT':
        data = request.json
        subject.name = data.get('name', subject.name)
        subject.code = data.get('code', subject.code)
        subject.program_id = data.get('program_id', subject.program_id)
        subject.year_of_study = data.get('year_of_study', subject.year_of_study)
        db.session.commit()
        return jsonify({'msg': 'Subject updated'})
    if request.method == 'DELETE':
        if ClassSchedule.query.filter_by(subject_id=subject.id).first():
            return jsonify({'msg': 'Cannot delete: Subject is used in a timetable'}), 400
        db.session.delete(subject)
        db.session.commit()
        return jsonify({'msg': 'Subject deleted'})

@app.route('/admin/users', methods=['GET', 'POST'])
@jwt_required()
def manage_users():
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    if request.method == 'GET':
        users = User.query.order_by(User.id).all()
        return jsonify([{'id': u.id, 'full_name': u.full_name, 'email': u.email, 'role': u.role, 'department_name': u.department.name if u.department else 'N/A'} for u in users])
    if request.method == 'POST':
        data = request.json
        new_user = User(full_name=data.get('full_name'), email=data.get('email'), password=generate_password_hash(data.get('password')), role=data.get('role'), department_id=data.get('department_id'))
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'msg': 'User added successfully'}), 201

@app.route('/api/admin/users/<int:user_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_single_user(user_id):
    claims = get_jwt()
    if claims.get('role') != 'Admin': return jsonify({'msg': 'Forbidden'}), 403
    user = db.session.get(User, user_id)
    if not user: return jsonify({'msg': 'User not found'}), 404
    if request.method == 'PUT':
        data = request.json
        user.full_name = data.get('full_name', user.full_name)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        user.department_id = data.get('department_id', user.department_id)
        db.session.commit()
        return jsonify({'msg': 'User updated'})
    if request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return jsonify({'msg': 'User deleted'})

# --- HOD DASHBOARD ROUTES ---
def get_hod_department_id_from_token():
    claims = get_jwt()
    if claims.get('role') != 'HOD': return None
    return claims.get('department_id')

@app.route('/api/hod/data-for-timetable', methods=['GET'])
@jwt_required()
def get_hod_timetable_data():
    department_id = get_hod_department_id_from_token()
    if department_id is None: return jsonify({'msg': 'Forbidden'}), 403
    lecturers = User.query.filter_by(role='Lecturer', department_id=department_id).all()
    programs_in_dept = Program.query.filter_by(department_id=department_id).all()
    program_ids = [p.id for p in programs_in_dept]
    subjects = Subject.query.filter(Subject.program_id.in_(program_ids)).all()
    return jsonify({'lecturers': [{'id': l.id, 'full_name': l.full_name} for l in lecturers], 'subjects': [{'id': s.id, 'name': f"{s.code} - {s.name}"} for s in subjects]})

@app.route('/api/hod/schedules', methods=['GET', 'POST'])
@jwt_required()
def manage_hod_schedules():
    department_id = get_hod_department_id_from_token()
    if department_id is None: return jsonify({'msg': 'Forbidden'}), 403
    active_semester = Semester.query.filter_by(is_active=True).first()
    if not active_semester: return jsonify({'msg': 'No active semester set'}), 404
    if request.method == 'GET':
        schedules = ClassSchedule.query.join(Subject).join(Program).filter(Program.department_id == department_id, ClassSchedule.semester_id == active_semester.id).all()
        return jsonify([{'id': s.id, 'subject_name': s.subject.name, 'lecturer_name': s.lecturer.full_name, 'day_of_week': s.day_of_week, 'start_time': s.start_time.strftime('%H:%M'), 'end_time': s.end_time.strftime('%H:%M')} for s in schedules])
    if request.method == 'POST':
        data = request.json
        new_schedule = ClassSchedule(subject_id=data['subject_id'], lecturer_id=data['lecturer_id'], day_of_week=data['day_of_week'], start_time=time.fromisoformat(data['start_time']), end_time=time.fromisoformat(data['end_time']), semester_id=active_semester.id)
        db.session.add(new_schedule)
        db.session.commit()
        return jsonify({'msg': 'Class scheduled successfully'}), 201

@app.route('/api/hod/schedules/<int:schedule_id>', methods=['DELETE'])
@jwt_required()
def delete_hod_schedule(schedule_id):
    department_id = get_hod_department_id_from_token()
    if department_id is None: return jsonify({'msg': 'Forbidden: Only HODs can access this'}), 403
    schedule_item = db.session.get(ClassSchedule, schedule_id)
    if not schedule_item: return jsonify({'msg': 'Schedule not found'}), 404
    if schedule_item.subject.program.department_id != department_id:
        return jsonify({'msg': 'Forbidden: Cannot delete schedule from another department'}), 403
    db.session.delete(schedule_item)
    db.session.commit()
    return jsonify({'msg': 'Scheduled class deleted successfully'})

@app.route('/hod/attendance/pending', methods=['GET'])
@jwt_required()
def hod_pending_attendance():
    department_id = get_hod_department_id_from_token()
    if department_id is None: return jsonify({'msg': 'Forbidden'}), 403
    attendances = Attendance.query.join(ClassSchedule).join(Subject).join(Program).filter(Attendance.verified == False, Program.department_id == department_id).order_by(Attendance.timestamp.desc()).all()
    result = []
    for att in attendances:
        cr_user = db.session.get(User, att.cr_id)
        result.append({'id': att.id, 'lecturer_name': att.schedule.lecturer.full_name, 'cr_name': cr_user.full_name if cr_user else 'N/A', 'course': att.schedule.subject.name, 'present': att.present, 'timestamp': att.timestamp.isoformat(), 'excuse_comment': att.excuse_comment, 'excuse_file': att.excuse_file})
    return jsonify(result)

@app.route('/hod/attendance/verify/<int:attendance_id>', methods=['POST'])
@jwt_required()
def verify_attendance(attendance_id):
    department_id = get_hod_department_id_from_token()
    if department_id is None: return jsonify({'msg': 'Forbidden'}), 403
    attendance = db.session.get(Attendance, attendance_id)
    if not attendance: return jsonify({'msg': 'Attendance record not found'}), 404
    if attendance.schedule.subject.program.department_id != department_id: return jsonify({'msg': 'Forbidden'}), 403
    attendance.verified = True
    db.session.commit()
    return jsonify({'msg': 'Attendance verified'})

# --- LECTURER DASHBOARD ROUTES ---
@app.route('/api/lecturer/dashboard-data', methods=['GET'])
@jwt_required()
def get_lecturer_dashboard_data():
    claims = get_jwt()
    if claims.get('role') != 'Lecturer': return jsonify({'msg': 'Forbidden'}), 403
    lecturer_id = claims.get('id')
    active_semester = Semester.query.filter_by(is_active=True).first()
    if not active_semester: return jsonify({'schedule': []}), 200
    schedules = ClassSchedule.query.filter_by(lecturer_id=lecturer_id, semester_id=active_semester.id).order_by(ClassSchedule.day_of_week, ClassSchedule.start_time).all()
    schedule_ids = [s.id for s in schedules]
    all_attendances = Attendance.query.filter(Attendance.class_schedule_id.in_(schedule_ids)).all()
    attendance_map = {}
    for att in all_attendances:
        if att.class_schedule_id not in attendance_map: attendance_map[att.class_schedule_id] = []
        cr = db.session.get(User, att.cr_id)
        attendance_map[att.class_schedule_id].append({'id': att.id, 'present': att.present, 'timestamp': att.timestamp.isoformat(), 'verified': att.verified, 'cr_name': cr.full_name if cr else 'N/A', 'excuse_file': att.excuse_file, 'excuse_comment': att.excuse_comment})
    schedule_data = []
    for s in schedules:
        schedule_data.append({'id': s.id, 'subject_name': s.subject.name, 'day_of_week': s.day_of_week, 'start_time': s.start_time.strftime('%H:%M'), 'end_time': s.end_time.strftime('%H:%M'), 'attendance_history': attendance_map.get(s.id, [])})
    return jsonify({'schedule': schedule_data})

@app.route('/api/lecturer/attendance/<int:attendance_id>/excuse', methods=['POST'])
@jwt_required()
def upload_excuse(attendance_id):
    claims = get_jwt()
    if claims.get('role') != 'Lecturer': return jsonify({'msg': 'Forbidden'}), 403
    attendance = db.session.get(Attendance, attendance_id)
    if not attendance: return jsonify({'msg': 'Attendance record not found'}), 404
    if attendance.schedule.lecturer_id != claims.get('id'): return jsonify({'msg': 'Unauthorized'}), 403
    if attendance.timestamp + timedelta(hours=24) < datetime.now(timezone.utc): return jsonify({'msg': 'Excuse submission window has expired (24 hours)'}), 400
    file = request.files['file']
    filename = secure_filename(f"excuse_{attendance_id}_{file.filename}")
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    attendance.excuse_file = filename
    attendance.excuse_comment = request.form.get('comment')
    attendance.excuse_uploaded_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({'msg': 'Excuse uploaded successfully'})

# --- CR DASHBOARD ROUTES ---
@app.route('/api/cr/todays-schedule', methods=['GET'])
@jwt_required()
def get_cr_todays_schedule():
    claims = get_jwt()
    if claims.get('role') != 'CR': return jsonify({'msg': 'Forbidden'}), 403
    cr_user = db.session.get(User, claims.get('id'))
    active_semester = Semester.query.filter_by(is_active=True).first()
    if not active_semester: return jsonify([]), 200
    today_str = datetime.now(timezone.utc).strftime('%A')
    todays_classes = ClassSchedule.query.join(Subject).join(Program).filter(Program.department_id == cr_user.department_id, ClassSchedule.semester_id == active_semester.id, ClassSchedule.day_of_week == today_str).order_by(ClassSchedule.start_time).all()
    today_start = datetime.combine(date.today(), time.min)
    today_end = datetime.combine(date.today(), time.max)
    submitted_today_ids = db.session.query(Attendance.class_schedule_id).filter(Attendance.timestamp.between(today_start, today_end)).all()
    submitted_ids = {item[0] for item in submitted_today_ids}
    result = []
    for schedule in todays_classes:
        result.append({'schedule_id': schedule.id, 'subject_name': schedule.subject.name, 'lecturer_name': schedule.lecturer.full_name, 'start_time': schedule.start_time.strftime('%H:%M'), 'end_time': schedule.end_time.strftime('%H:%M'), 'submitted': schedule.id in submitted_ids})
    return jsonify(result)

# --- SHARED ROUTES ---
@app.route('/api/attendance', methods=['POST'])
@jwt_required()
def submit_attendance():
    claims = get_jwt()
    if claims.get('role') != 'CR': return jsonify({'msg': 'Only CR can submit attendance'}), 403
    data = request.json
    class_schedule_id = data.get('class_schedule_id')
    present = data.get('present')
    today_start = datetime.combine(date.today(), time.min)
    today_end = datetime.combine(date.today(), time.max)
    existing_attendance = Attendance.query.filter(Attendance.class_schedule_id == class_schedule_id, Attendance.timestamp.between(today_start, today_end)).first()
    if existing_attendance: return jsonify({'msg': 'Attendance for this class has already been submitted today'}), 409
    new_attendance = Attendance(class_schedule_id=class_schedule_id, cr_id=claims.get('id'), present=present)
    db.session.add(new_attendance)
    db.session.commit()
    return jsonify({'msg': 'Attendance recorded successfully'}), 201

@app.route('/uploads/<filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)

@app.route('/api/reports/generate', methods=['POST'])
@jwt_required()
def generate_report():
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({'msg': 'Forbidden'}), 403

    data = request.json
    start_date_str = data.get('start_date')
    end_date_str = data.get('end_date')
    department_id = data.get('department_id')

    if not all([start_date_str, end_date_str, department_id]):
        return jsonify({'msg': 'Missing required report filters'}), 400

    start_date = date.fromisoformat(start_date_str)
    end_date = date.fromisoformat(end_date_str)

    # Base query for verified attendance within the date range
    query = db.session.query(Attendance).join(ClassSchedule).filter(
        Attendance.verified == True,
        Attendance.timestamp.between(start_date, datetime.combine(end_date, time.max))
    )

    # Join with User (Lecturer) and Program to filter by department
    query = query.join(User, User.id == ClassSchedule.lecturer_id)\
                 .join(Subject, Subject.id == ClassSchedule.subject_id)\
                 .join(Program, Program.id == Subject.program_id)\
                 .filter(Program.department_id == department_id)

    records = query.all()

    # --- Process the data for the report ---
    report_data = {}
    total_classes = len(records)
    total_present = 0

    for record in records:
        lecturer = record.schedule.lecturer
        if lecturer.id not in report_data:
            report_data[lecturer.id] = {
                'lecturer_name': lecturer.full_name,
                'total_classes': 0,
                'classes_attended': 0,
            }
        
        report_data[lecturer.id]['total_classes'] += 1
        if record.present:
            report_data[lecturer.id]['classes_attended'] += 1
            total_present += 1
    
    overall_attendance_rate = (total_present / total_classes * 100) if total_classes > 0 else 0
    
    detailed_breakdown = []
    for lec_id, data in report_data.items():
        rate = (data['classes_attended'] / data['total_classes'] * 100) if data['total_classes'] > 0 else 0
        detailed_breakdown.append({
            'lecturer_name': data['lecturer_name'],
            'total_classes': data['total_classes'],
            'classes_attended': data['classes_attended'],
            'classes_missed': data['total_classes'] - data['classes_attended'],
            'attendance_rate': round(rate, 2)
        })
    
    department_name = db.session.get(Department, department_id).name if department_id else "All Departments"

    final_report = {
        'summary': {
            'department_name': department_name,
            'period': f"{start_date_str} to {end_date_str}",
            'total_classes_recorded': total_classes,
            'overall_attendance_rate': round(overall_attendance_rate, 2)
        },
        'breakdown': sorted(detailed_breakdown, key=lambda x: x['lecturer_name'])
    }
    return jsonify(final_report)

# --- REPORT GENERATION ROUTE (FOR ADMIN) ---

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Lecturer Attendance Report', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

@app.route('/api/reports/generate-pdf', methods=['POST'])
@jwt_required()
def generate_report_pdf():
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({'msg': 'Forbidden'}), 403

    data = request.json
    start_date_str = data.get('start_date')
    end_date_str = data.get('end_date')
    department_id = data.get('department_id')

    if not all([start_date_str, end_date_str, department_id]):
        return jsonify({'msg': 'Missing required report filters'}), 400
    
    start_date = date.fromisoformat(start_date_str)
    end_date = date.fromisoformat(end_date_str)

    query = db.session.query(Attendance).join(ClassSchedule).filter(
        Attendance.verified == True,
        Attendance.timestamp.between(start_date, datetime.combine(end_date, time.max))
    ).join(User, User.id == ClassSchedule.lecturer_id)\
     .join(Subject, Subject.id == ClassSchedule.subject_id)\
     .join(Program, Program.id == Subject.program_id)\
     .filter(Program.department_id == department_id)

    records = query.all()

    report_data = {}
    total_classes = len(records)
    total_present = 0

    for record in records:
        lecturer = record.schedule.lecturer
        if lecturer.id not in report_data:
            report_data[lecturer.id] = {'lecturer_name': lecturer.full_name, 'total_classes': 0, 'classes_attended': 0}
        report_data[lecturer.id]['total_classes'] += 1
        if record.present:
            report_data[lecturer.id]['classes_attended'] += 1
            total_present += 1
    
    detailed_breakdown = []
    for lec_id, data in report_data.items():
        rate = (data['classes_attended'] / data['total_classes'] * 100) if data['total_classes'] > 0 else 0
        detailed_breakdown.append({
            'lecturer_name': data['lecturer_name'],
            'total_classes': data['total_classes'],
            'classes_attended': data['classes_attended'],
            'classes_missed': data['total_classes'] - data['classes_attended'],
            'attendance_rate': round(rate, 2)
        })
    
    detailed_breakdown = sorted(detailed_breakdown, key=lambda x: x['lecturer_name'])
    department_name = db.session.get(Department, department_id).name if department_id else "All Departments"

    # --- PDF GENERATION ---
    pdf = PDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, f'Attendance Report for {department_name}', 0, 1, 'L')
    pdf.set_font('Arial', '', 11)
    pdf.cell(0, 8, f"Period: {start_date_str} to {end_date_str}", 0, 1, 'L')
    pdf.ln(5)
    
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(80, 10, 'Lecturer Name', 1, 0, 'C')
    pdf.cell(25, 10, 'Attended', 1, 0, 'C')
    pdf.cell(25, 10, 'Missed', 1, 0, 'C')
    pdf.cell(25, 10, 'Total', 1, 0, 'C')
    pdf.cell(35, 10, 'Attendance Rate', 1, 1, 'C')

    pdf.set_font('Arial', '', 10)
    for item in detailed_breakdown:
        pdf.cell(80, 10, item['lecturer_name'], 1)
        pdf.cell(25, 10, str(item['classes_attended']), 1, 0, 'C')
        pdf.cell(25, 10, str(item['classes_missed']), 1, 0, 'C')
        pdf.cell(25, 10, str(item['total_classes']), 1, 0, 'C')
        pdf.cell(35, 10, f"{item['attendance_rate']}%", 1, 1, 'C')
    
    response = make_response(pdf.output())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=attendance_report_{department_name.replace(" ", "_")}_{date.today()}.pdf'
    return response

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    print("--- Attempting to start Flask server... ---")
    app.run(debug=True)
    
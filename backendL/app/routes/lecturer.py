# app/routes/lecturer.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta, timezone
import os

from flask import Blueprint, request, jsonify, current_app
from ..models import db, User, Semester, ClassSchedule, Attendance

lecturer_bp = Blueprint('lecturer', __name__, url_prefix='/api/lecturer')

@lecturer_bp.route('/dashboard-data', methods=['GET'])
@jwt_required()
def get_lecturer_dashboard_data():
    claims = get_jwt()
    if claims.get('role') != 'Lecturer': 
        return jsonify({'msg': 'Forbidden'}), 403
        
    lecturer_id = claims.get('id')
    active_semester = Semester.query.filter_by(is_active=True).first()
    if not active_semester: 
        return jsonify({'schedule': []}), 200

    schedules = ClassSchedule.query.filter_by(
        lecturer_id=lecturer_id, 
        semester_id=active_semester.id
    ).order_by(ClassSchedule.day_of_week, ClassSchedule.start_time).all()

    schedule_ids = [s.id for s in schedules]
    all_attendances = Attendance.query.filter(Attendance.class_schedule_id.in_(schedule_ids)).all()
    
    attendance_map = {}
    for att in all_attendances:
        if att.class_schedule_id not in attendance_map: 
            attendance_map[att.class_schedule_id] = []
        cr = db.session.get(User, att.cr_id)
        attendance_map[att.class_schedule_id].append({
            'id': att.id, 'present': att.present, 'timestamp': att.timestamp.isoformat(), 
            'verified': att.verified, 'cr_name': cr.full_name if cr else 'N/A', 
            'excuse_file': att.excuse_file, 'excuse_comment': att.excuse_comment
        })

    schedule_data = []
    for s in schedules:
        schedule_data.append({
            'id': s.id, 'subject_name': s.subject.name, 'day_of_week': s.day_of_week, 
            'start_time': s.start_time.strftime('%H:%M'), 'end_time': s.end_time.strftime('%H:%M'), 
            'attendance_history': attendance_map.get(s.id, [])
        })
        
    return jsonify({'schedule': schedule_data})

@lecturer_bp.route('/attendance/<int:attendance_id>/excuse', methods=['POST'])
@jwt_required()
def upload_excuse(attendance_id):
    claims = get_jwt()
    if claims.get('role') != 'Lecturer': 
        return jsonify({'msg': 'Forbidden'}), 403
        
    attendance = db.session.get(Attendance, attendance_id)
    if not attendance: 
        return jsonify({'msg': 'Attendance record not found'}), 404
    if attendance.schedule.lecturer_id != claims.get('id'): 
        return jsonify({'msg': 'Unauthorized'}), 403
    if attendance.timestamp + timedelta(hours=24) < datetime.utcnow(): 
        return jsonify({'msg': 'Excuse submission window has expired (24 hours)'}), 400
        
    file = request.files.get('file')
    if not file or file.filename == '':
        return jsonify({'msg': 'No file selected'}), 400
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'msg': 'Only PDF files are allowed'}), 400

    filename = secure_filename(f"excuse_{attendance_id}_{file.filename}")
    file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
    
    attendance.excuse_file = filename
    attendance.excuse_comment = request.form.get('comment')
    attendance.excuse_uploaded_at = datetime.now(timezone.utc)
    db.session.commit()
    
    return jsonify({'msg': 'Excuse uploaded successfully'})
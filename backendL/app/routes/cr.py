# app/routes/cr.py

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime, date, time, timezone

from ..models import db, User, Semester, Program, Subject, ClassSchedule, Attendance

cr_bp = Blueprint('cr', __name__, url_prefix='/api/cr')

@cr_bp.route('/todays-schedule', methods=['GET'])
@jwt_required()
def get_cr_todays_schedule():
    claims = get_jwt()
    if claims.get('role') != 'CR': 
        return jsonify({'msg': 'Forbidden'}), 403

    cr_user = db.session.get(User, claims.get('id'))
    if not cr_user or not cr_user.department_id:
        return jsonify({'msg': 'CR is not associated with a department'}), 400
        
    active_semester = Semester.query.filter_by(is_active=True).first()
    if not active_semester: 
        return jsonify([]), 200

    today_str = datetime.now(timezone.utc).strftime('%A')

    todays_classes = ClassSchedule.query.join(Subject).join(Program).filter(
        Program.department_id == cr_user.department_id,
        ClassSchedule.semester_id == active_semester.id,
        ClassSchedule.day_of_week == today_str
    ).order_by(ClassSchedule.start_time).all()

    today_start = datetime.combine(date.today(), time.min)
    today_end = datetime.combine(date.today(), time.max)
    
    submitted_today_ids = db.session.query(Attendance.class_schedule_id).filter(
        Attendance.timestamp.between(today_start, today_end)
    ).all()
    submitted_ids = {item[0] for item in submitted_today_ids}

    result = []
    for schedule in todays_classes:
        result.append({
            'schedule_id': schedule.id,
            'subject_name': schedule.subject.name,
            'lecturer_name': schedule.lecturer.full_name,
            'start_time': schedule.start_time.strftime('%H:%M'),
            'end_time': schedule.end_time.strftime('%H:%M'),
            'submitted': schedule.id in submitted_ids
        })

    return jsonify(result)
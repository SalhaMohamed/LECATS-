# app/routes/subjects.py
from flask import Blueprint, jsonify
from flask_cors import cross_origin
from ..models import Subject

subjects_bp = Blueprint('subjects', __name__)

@subjects_bp.route('/api/subjects', methods=['GET'])
@cross_origin()
def get_subjects():
    subjects = Subject.query.all()
    return jsonify([s.to_dict() for s in subjects])
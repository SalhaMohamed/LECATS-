# app/routes/semesters.py
from flask import Blueprint, jsonify
from flask_cors import cross_origin
from ..models import Semester

semesters_bp = Blueprint('semesters', __name__)

@semesters_bp.route('/api/semesters', methods=['GET'])
@cross_origin()
def get_semesters():
    semesters = Semester.query.all()
    return jsonify([s.to_dict() for s in semesters])
# app/routes/programs.py
from flask import Blueprint, jsonify
from flask_cors import cross_origin
from ..models import Program

programs_bp = Blueprint('programs', __name__)

@programs_bp.route('/api/programs', methods=['GET'])
@cross_origin()
def get_programs():
    programs = Program.query.all()
    return jsonify([p.to_dict() for p in programs])
# app/routes/departments.py

from flask import Blueprint, jsonify
from flask_cors import cross_origin  # Correct import
from ..models import Department

departments_bp = Blueprint('departments', __name__)

@departments_bp.route('/api/departments', methods=['GET'])
@cross_origin()  # Decorator to allow cross-origin requests
def get_departments():
    """
    Fetches all department records from the database.
    
    This route now correctly handles CORS preflight requests and
    serializes Department objects using a to_dict() method.
    """
    departments = Department.query.all()
    # Return a list of dictionaries by calling to_dict() on each object
    return jsonify([d.to_dict() for d in departments])
# backend/api/reports.py
from flask import Blueprint, jsonify, current_app, request
from services import get_professors_with_loans, get_professor_report

reports_bp = Blueprint('reports', __name__)


@reports_bp.route('/reports/professors-with-loans', methods=['GET'])
def professors_with_loans():
    try:
        data = get_professors_with_loans(current_app)
        return jsonify(data), 200
    except Exception as e:
        current_app.logger.exception("Error al obtener profesores con préstamos")
        return jsonify({"ok": False, "message": str(e)}), 500

@reports_bp.route('/reports/professors/<int:prof_id>', methods=['GET'])
def professor_detail(prof_id):
    try:
        prof, detalle = get_professor_report(current_app, prof_id)
        return jsonify({"profesor": prof, "detalle": detalle}), 200
    except Exception as e:
        current_app.logger.exception("Error al obtener detalle de profesor")
        return jsonify({"ok": False, "message": str(e)}), 500

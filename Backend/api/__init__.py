# backend/api/__init__.py
from api.reports import reports_bp

def register_blueprints(app):
    app.register_blueprint(reports_bp, url_prefix="/api")

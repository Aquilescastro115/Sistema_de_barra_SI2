# Este archivo utiliza los siguientes patrones de diseño de manera implícita:
#
# 1) Patrón Factory Method (Creacional)
#    La función get_db_connection() actúa como una fábrica de conexiones a la
#    base de datos. En lugar de que cada módulo cree su propio objeto conexión,
#    este método centraliza la creación y configuración, devolviendo siempre
#    instancias listas para usar.
#
# 2) Patrón Facade (Fachada)
#    El archivo app.py expone rutas REST que funcionan como una fachada del
#    sistema. Cada endpoint (/, /api/equipos, /api/profesores, etc.) oculta la
#    lógica interna, la estructura SQL y el manejo de conexiones. Desde fuera,
#    solo se ve una capa sencilla de interacción HTTP.
#
# 3) Patrón Service Layer (Capa de Servicios)
#    Aunque este archivo define rutas, delega parte del trabajo a servicios
#    externos mediante blueprints (ej. reports_bp). Esto separa claramente la
#    lógica de negocio de la comunicación HTTP, cumpliendo el rol de una capa de
#    servicios encima de los controladores.
#
# 4) Patrón Transaction Script (Comportamiento)
#    Cada ruta implementa un flujo secuencial simple para cumplir una tarea:
#    obtener conexión → ejecutar consulta → devolver datos. Este estilo procedural
#    encaja con el patrón Transaction Script, donde cada endpoint representa un
#    “script” transaccional independiente.
#
# 5) Patrón Dependency Injection (leve)
#    Las credenciales de conexión y parámetros del entorno se inyectan usando
#    variables de entorno (os.getenv). Esto desacopla el código del entorno real
#    y permite mover la aplicación entre Docker, local, o producción sin cambiar
#    el código.
#
# En conjunto, estos patrones hacen que el backend sea modular, escalable,
# mantenible y fácil de integrar con otros módulos como servicios, validaciones
# y reportes.

# ---------------------------------------------------------------


import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import pymysql.cursors

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN DB ---
DB_HOST = os.getenv('DATABASE_HOST', 'db')
DB_USER = os.getenv('DATABASE_USER', 'user_app')
DB_PASSWORD = os.getenv('DATABASE_PASSWORD', 'app_user_password_999')
DB_NAME = os.getenv('DATABASE_NAME', 'sistema_db')

def get_db_connection():
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn
    except Exception as e:
        print(f"Error conectando a MySQL: {e}")
        return None

# --- RUTA 1: RAIZ (Para ver si vive) ---
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "mensaje": "Bienvenido al Backend", 
        "rutas_disponibles": ["/api/equipos", "/"]
    })

# --- RUTA 2: EQUIPOS (La que buscas) ---
@app.route('/api/equipos', methods=['GET'])
def get_equipos():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falló conexión DB"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM Equipo;") # Trae todo lo de la tabla Equipo
            equipos = cursor.fetchall()
        conn.close()
        return jsonify(equipos), 200
    except Exception as e:
        if conn: conn.close()
        return jsonify({"error": str(e)}), 500
@app.route('/api/profesores', methods=['GET'])
def get_profesores():
    """Obtiene todos los profesores de la base de datos."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falló conexión DB"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM Profesor;")
            profesores = cursor.fetchall()
        conn.close()
        return jsonify(profesores), 200
    except Exception as e:
        if conn: conn.close()
        return jsonify({"error": str(e)}), 500

@app.route('/api/profesores', methods=['POST'])
def add_profesor():
    """Inserta un nuevo profesor en la base de datos."""
    data = request.get_json()
    
    # Validamos los campos EXACTOS de tu tabla SQL
    # Nota: 'Activo' tiene default 1, así que no es obligatorio enviarlo.
    if not data or 'Rut' not in data or 'Nombre' not in data or 'Email_institucional' not in data or 'Password' not in data:
        return jsonify({"error": "Faltan campos obligatorios (Rut, Nombre, Email_institucional, Password)"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falló conexión DB"}), 500

    try:
        with conn.cursor() as cursor:
            # SQL actualizado con las columnas correctas
            sql = "INSERT INTO Profesor (Rut, Nombre, Email_institucional, Password) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (data['Rut'], data['Nombre'], data['Email_institucional'], data['Password']))
            
            conn.commit()
            new_id = cursor.lastrowid
            
        conn.close()
        return jsonify({"mensaje": "Profesor creado exitosamente", "id": new_id}), 201
        
    except pymysql.err.IntegrityError as e:
        if conn: conn.close()
        return jsonify({"error": "El Rut, Email o Password ya existen (Violación de unicidad)."}), 409
    except Exception as e:
        if conn: conn.close()
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

from api.reports import reports_bp
app.register_blueprint(reports_bp, url_prefix="/api")



if __name__ == '__main__':
    # Esto imprime las rutas al iniciar
    print(app.url_map)
    app.run(host='0.0.0.0', port=5000, debug=True)

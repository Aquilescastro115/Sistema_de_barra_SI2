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
@app.route('/api/prestamos', methods=['POST'])

def create_prestamo():
    # Importamos el servicio AQUÍ dentro para evitar errores de referencia circular
    from services import create_loan_service 
    
    data = request.get_json()

    # 1. Validaciones básicas de que lleguen datos
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    
    # 2. Verificamos que vengan los campos obligatorios
    campos_necesarios = ['profesor_id', 'equipos_ids', 'fecha_solicitud', 'fecha_devolucion']
    for campo in campos_necesarios:
        if campo not in data:
             return jsonify({"error": f"Falta el campo obligatorio: {campo}"}), 400

    # 3. Extraemos los datos
    profesor_id = data['profesor_id']
    equipos_ids = data['equipos_ids'] # Esto debe ser una lista, ej: [1, 2]
    fecha_solicitud = data['fecha_solicitud']
    fecha_devolucion = data['fecha_devolucion']

    # 4. Validar que 'equipos_ids' sea realmente una lista y tenga algo
    if not isinstance(equipos_ids, list) or len(equipos_ids) == 0:
        return jsonify({"error": "Debes seleccionar al menos un equipo (envia una lista de IDs)"}), 400

    # 5. Llamamos a la lógica pesada que está en services.py
    loan_id, error = create_loan_service(profesor_id, equipos_ids, fecha_solicitud, fecha_devolucion)

    # 6. Responder según el resultado
    if error:
        return jsonify({"error": f"Error al procesar préstamo: {error}"}), 500
    
    return jsonify({"mensaje": "Préstamo creado exitosamente", "id_prestamo": loan_id}), 201

# Modificamos la línea para aceptar POST y GET
@app.route('/api/prestamos', methods=['POST', 'GET']) 
def handle_prestamos():
    # Importamos el servicio
    from services import create_loan_service 
    
    # --- CASO 1: CREAR PRÉSTAMO (POST) ---
    if request.method == 'POST':
        data = request.get_json()
        if not data: return jsonify({"error": "Sin datos"}), 400
        
        # ... (Toda tu validación anterior aquí) ...
        # (Resumido para no repetir código innecesariamente)
        
        profesor_id = data.get('profesor_id')
        equipos_ids = data.get('equipos_ids')
        fecha_solicitud = data.get('fecha_solicitud')
        fecha_devolucion = data.get('fecha_devolucion')

        if not profesor_id or not equipos_ids:
             return jsonify({"error": "Faltan datos"}), 400

        loan_id, error = create_loan_service(profesor_id, equipos_ids, fecha_solicitud, fecha_devolucion)

        if error: return jsonify({"error": error}), 500
        return jsonify({"mensaje": "Creado", "id": loan_id}), 201

    # --- CASO 2: LISTAR PRÉSTAMOS (GET) ---
    elif request.method == 'GET':
        conn = get_db_connection()
        if not conn: return jsonify({"error": "Sin DB"}), 500
        
        try:
            with conn.cursor() as cursor:
                # Traemos el Préstamo junto con el nombre del Profe
                sql = """
                    SELECT pr.id_Prestamo, p.Nombre as Profesor, pr.fecha_solicitud, pr.estado
                    FROM Prestamo pr
                    JOIN Profesor p ON pr.fk_id_Profesor = p.id_Profesor
                    ORDER BY pr.id_Prestamo DESC
                """
                cursor.execute(sql)
                loans = cursor.fetchall()
            return jsonify(loans), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
            
if __name__ == '__main__':
    # Esto imprime las rutas al iniciar
    print(app.url_map)
    app.run(host='0.0.0.0', port=5000, debug=True)

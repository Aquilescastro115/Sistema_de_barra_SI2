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
from datetime import datetime, timedelta
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

# --- RUTA 1: RAIZ ---
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "mensaje": "Bienvenido al Backend", 
        "rutas_disponibles": ["/api/equipos", "/"]
    })

# --- RUTA 2: EQUIPOS ---
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

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    usuario_recibido = data.get('usuario')
    password_recibido = data.get('password')

    if not usuario_recibido or not password_recibido:
        return jsonify({"error": "Faltan datos"}), 400

    usuario_en_bd = buscar_usuario_por_rut(usuario_recibido)

    if not usuario_en_bd:
        return jsonify({"error": "Credenciales invalidas"}), 404

    # Comparación directa (sin hash)
    if usuario_en_bd["Password"] != password_recibido:
        return jsonify({"error": "Contraseña incorrecta"}), 401
    
    return jsonify({
        "mensaje": "Login exitoso",
        "id_Profesor": usuario_en_bd["id_Profesor"],   # <- id
        "Rut": usuario_en_bd.get("Rut"),              # <- rut
        "nombre": usuario_en_bd["Nombre"],
        "rol": "profesor",
        "email": usuario_en_bd["Email_institucional"]
    }), 200


def buscar_usuario_por_rut(rut):
    conn = get_db_connection()
    if conn is None:
        return None

    try:
        with conn.cursor() as cursor:
            sql = "SELECT * FROM Profesor WHERE Rut = %s AND Activo = 1"
            cursor.execute(sql, (rut,))
            usuario = cursor.fetchone()
        conn.close()
        return usuario
    except Exception as e:
        if conn: conn.close()
        print("Error en buscar_usuario_por_rut:", e)
        return None
    


@app.route('/api/equipos', methods=['POST'])
def add_equipo():
    data = request.get_json()

    # Validar campos del frontend (sin id_equipo)
    required_fields = ['Codigo_qr', 'Tipo_equipo', 'Estado']

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Falta el campo obligatorio: {field}"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falló conexión DB"}), 500

    try:
        with conn.cursor() as cursor:

            # 1. Obtener el último ID existente
            cursor.execute("SELECT COALESCE(MAX(id_equipo), 0) AS max_id FROM Equipo")
            ultimo_id = cursor.fetchone()['max_id']
            nuevo_id = ultimo_id + 1

            # 2. Insertar con el nuevo ID
            sql = """
                INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                nuevo_id,
                data['Codigo_qr'],
                data['Tipo_equipo'],
                data.get('Descripcion', None),
                data['Estado']
            ))

            conn.commit()

        conn.close()
        return jsonify({
            "mensaje": "Equipo creado exitosamente",
            "id_generado": nuevo_id
        }), 201

    except pymysql.err.IntegrityError as e:
        if conn: conn.close()
        return jsonify({"error": "Codigo_qr ya existe."}), 409
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
from api.loans import loans_bp  

app.register_blueprint(reports_bp, url_prefix="/api")
app.register_blueprint(loans_bp, url_prefix="/api")   

# --- RUTA RECUPERADA: CREAR PRÉSTAMO RÁPIDO ---
@app.route('/api/prestamos', methods=['POST'])
def crear_prestamo_rapido():
    data = request.get_json()
    # Esperamos recibir: { "rut": "12345678-9", "codigo_equipo": "2002" }
    rut_profe = data.get('rut')
    codigo_equipo = data.get('codigo_equipo')
    
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Sin conexión a DB"}), 500

    try:
        with conn.cursor() as cursor:
            # 1. Buscar Profesor
            cursor.execute("SELECT id_Profesor FROM Profesor WHERE Rut = %s", (rut_profe,))
            profe = cursor.fetchone()
            if not profe: return jsonify({"error": "Profesor no encontrado"}), 404

            # 2. Buscar Equipo
            cursor.execute("SELECT id_equipo, Estado FROM Equipo WHERE Codigo_qr = %s", (codigo_equipo,))
            equipo = cursor.fetchone()
            if not equipo: return jsonify({"error": "Equipo no encontrado"}), 404
            
            if equipo['Estado'] == 'Prestado':
                return jsonify({"error": "Este equipo ya está prestado"}), 400

            # 3. Guardar Préstamo (Fecha dev: mañana)
            fecha_dev = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            
            # Insertar Encabezado
            sql_p = "INSERT INTO Prestamo (fk_id_Profesor, fecha_solicitud, estado, fecha_devolucion) VALUES (%s, NOW(), 'Activo', %s)"
            cursor.execute(sql_p, (profe['id_Profesor'], fecha_dev))
            id_prestamo = cursor.lastrowid

            # Insertar Detalle
            sql_d = "INSERT INTO Detalle_prestamo (fk_id_equipo, fk_id_Prestamo, fecha_entrega, fecha_devolucion, estado) VALUES (%s, %s, NOW(), %s, 'Prestado')"
            cursor.execute(sql_d, (equipo['id_equipo'], id_prestamo, fecha_dev))

            # Actualizar Equipo
            cursor.execute("UPDATE Equipo SET Estado = 'Prestado' WHERE id_equipo = %s", (equipo['id_equipo'],))
            
            conn.commit()
        
        conn.close()
        return jsonify({"mensaje": "Préstamo Guardado OK"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Esto imprime las rutas al iniciar
    print(app.url_map)
    app.run(host='0.0.0.0', port=5000, debug=True)

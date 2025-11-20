import os
from flask import Flask, jsonify
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

if __name__ == '__main__':
    # Esto imprime las rutas al iniciar
    print(app.url_map)
    app.run(host='0.0.0.0', port=5000, debug=True)

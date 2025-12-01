import time
import pymysql
import smtplib
import schedule
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from twilio.rest import Client

# ================= CONFIGURACIÓN DE BASE DE DATOS =================
# Usamos el puerto 3307 porque es el que Docker expone hacia Windows
DB_HOST = 'localhost'
DB_PORT = 3307
DB_USER = 'user_app'
DB_PASS = 'app_user_password_999'
DB_NAME = 'sistema_db'

# ================= CONFIGURACIÓN DE CORREO =================
EMAIL_ORIGEN = "crsandovalmardones@gmail.com"  # <--- PON TU GMAIL AQUÍ
EMAIL_PASSWORD = "abcd efgh ijkl mnop" # <--- TU CONTRASEÑA DE APLICACIÓN DE GMAIL

# ================= CONFIGURACIÓN DE WHATSAPP (TWILIO) =================
# Ya puse tus datos reales aquí:
TWILIO_SID = "AC456b1e58479c9d0cf865cbd1528b1736"
TWILIO_TOKEN = "dfd18efc57097839388628b2bca13c5c"
TWILIO_NUMBER = "whatsapp:+14155238886"

# ================= MEMORIA DEL ESPÍA =================
ultimo_prestamo_id = 0
prestamos_activos_memoria = set()

# ================= FUNCIONES =================
def conectar_db():
    return pymysql.connect(
        host=DB_HOST, 
        port=DB_PORT, 
        user=DB_USER, 
        password=DB_PASS, 
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )

def enviar_notificacion(email, telefono, asunto, mensaje):
    # 1. ENVIAR CORREO
    if email and EMAIL_ORIGEN != "crsandovalmardones@gmail.com":
        try:
            msg = MIMEMultipart()
            msg['From'] = EMAIL_ORIGEN
            msg['To'] = email
            msg['Subject'] = asunto
            msg.attach(MIMEText(mensaje, 'plain'))
            
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(EMAIL_ORIGEN, EMAIL_PASSWORD)
            server.send_message(msg)
            server.quit()
            print(f"📧 Correo enviado a {email}")
        except Exception as e:
            print(f"❌ Error enviando correo: {e}")
    else:
        print("⚠️ Correo no configurado, saltando envío de email.")

    # 2. ENVIAR WHATSAPP
    if telefono:
        try:
            # Twilio necesita el formato whatsapp:+569...
            if not telefono.startswith("whatsapp:"):
                telefono = f"whatsapp:{telefono}"
            
            client = Client(TWILIO_SID, TWILIO_TOKEN)
            client.messages.create(body=mensaje, from_=TWILIO_NUMBER, to=telefono)
            print(f"📱 WhatsApp enviado a {telefono}")
        except Exception as e:
            print(f"❌ Error enviando WhatsApp: {e}")

# ================= TAREA PROGRAMADA (00:00 AM) =================
def revisar_atrasos_nocturnos():
    print("🌙 00:00 AM - Buscando equipos atrasados...")
    try:
        conn = conectar_db()
        with conn.cursor() as cursor:
            # Buscar equipos prestados cuya fecha de devolución ya pasó
            sql = """
                SELECT p.Nombre, p.Email_institucional, p.numero_telefono, e.Descripcion, dp.fecha_devolucion
                FROM Detalle_prestamo dp
                JOIN Prestamo pr ON dp.fk_id_Prestamo = pr.id_Prestamo
                JOIN Profesor p ON pr.fk_id_Profesor = p.id_Profesor
                JOIN Equipo e ON dp.fk_id_equipo = e.id_equipo
                WHERE dp.estado = 'Prestado' 
                AND dp.fecha_devolucion < CURDATE()
            """
            cursor.execute(sql)
            atrasados = cursor.fetchall()

            for row in atrasados:
                print(f"⚠️ Atraso encontrado: {row['Nombre']}")
                msg = f"Hola {row['Nombre']}, el plazo para devolver '{row['Descripcion']}' venció el {row['fecha_devolucion']}. Por favor regularizar."
                enviar_notificacion(row['Email_institucional'], row['numero_telefono'], "ALERTA: Equipo Atrasado", msg)
        conn.close()
    except Exception as e:
        print(f"Error en revisión nocturna: {e}")

# ================= INICIALIZACIÓN =================
def inicializar():
    global ultimo_prestamo_id
    print(f"⚙️  Conectando a BD en puerto {DB_PORT}...")
    try:
        conn = conectar_db()
        with conn.cursor() as cursor:
            # Memorizar estado actual para no repetir avisos antiguos
            cursor.execute("SELECT MAX(id_Prestamo) as max_id FROM Prestamo")
            row = cursor.fetchone()
            if row and row['max_id']:
                ultimo_prestamo_id = row['max_id']
            
            cursor.execute("SELECT id_Detalle_prestamo FROM Detalle_prestamo WHERE estado = 'Prestado'")
            rows = cursor.fetchall()
            for r in rows:
                prestamos_activos_memoria.add(r['id_Detalle_prestamo'])
        conn.close()
        print(f"👀 Espía listo. Vigilo desde préstamo ID: {ultimo_prestamo_id}")
    except Exception as e:
        print(f"❌ Error crítico de conexión: {e}")
        print("💡 PISTA: Asegúrate de que Docker esté corriendo.")

    # Programar la revisión nocturna
    schedule.every().day.at("00:00").do(revisar_atrasos_nocturnos)

# ================= BUCLE PRINCIPAL (VIGILANCIA) =================
def vigilar():
    global ultimo_prestamo_id
    
    while True:
        schedule.run_pending() # Revisa el reloj por si son las 00:00

        try:
            conn = conectar_db()
            with conn.cursor() as cursor:
                
                # --- A) DETECTAR NUEVOS PRÉSTAMOS ---
                sql_nuevos = """
                    SELECT pr.id_Prestamo, p.Nombre, p.Email_institucional, p.numero_telefono, e.Descripcion
                    FROM Prestamo pr
                    JOIN Profesor p ON pr.fk_id_Profesor = p.id_Profesor
                    JOIN Detalle_prestamo dp ON dp.fk_id_Prestamo = pr.id_Prestamo
                    JOIN Equipo e ON dp.fk_id_equipo = e.id_equipo
                    WHERE pr.id_Prestamo > %s
                """
                cursor.execute(sql_nuevos, (ultimo_prestamo_id,))
                nuevos = cursor.fetchall()

                for row in nuevos:
                    print(f"🚨 Nuevo préstamo detectado: {row['Nombre']} retiró {row['Descripcion']}")
                    msg = f"Hola {row['Nombre']}, has registrado el préstamo de: {row['Descripcion']}."
                    enviar_notificacion(row['Email_institucional'], row['numero_telefono'], "Comprobante de Préstamo", msg)
                    
                    if row['id_Prestamo'] > ultimo_prestamo_id:
                        ultimo_prestamo_id = row['id_Prestamo']
                    
                    # Añadir a vigilancia de devoluciones
                    cursor.execute("SELECT id_Detalle_prestamo FROM Detalle_prestamo WHERE fk_id_Prestamo = %s", (row['id_Prestamo'],))
                    detalles = cursor.fetchall()
                    for d in detalles:
                        prestamos_activos_memoria.add(d['id_Detalle_prestamo'])

                # --- B) DETECTAR DEVOLUCIONES ---
                if prestamos_activos_memoria:
                    ids_str = ','.join(str(id) for id in prestamos_activos_memoria)
                    sql_check = f"""
                        SELECT dp.id_Detalle_prestamo, dp.estado, p.Nombre, p.Email_institucional, p.numero_telefono, e.Descripcion
                        FROM Detalle_prestamo dp
                        JOIN Prestamo pr ON dp.fk_id_Prestamo = pr.id_Prestamo
                        JOIN Profesor p ON pr.fk_id_Profesor = p.id_Profesor
                        JOIN Equipo e ON dp.fk_id_equipo = e.id_equipo
                        WHERE dp.id_Detalle_prestamo IN ({ids_str})
                    """
                    cursor.execute(sql_check)
                    revisados = cursor.fetchall()

                    for row in revisados:
                        if row['estado'] == 'Devuelto':
                            print(f"✅ Devolución detectada: {row['Nombre']} entregó {row['Descripcion']}")
                            msg = f"Hola {row['Nombre']}, gracias por devolver el equipo: {row['Descripcion']}."
                            enviar_notificacion(row['Email_institucional'], row['numero_telefono'], "Equipo Devuelto", msg)
                            
                            prestamos_activos_memoria.remove(row['id_Detalle_prestamo'])

            conn.close()
        except Exception as e:
            # Si se cae la conexión momentáneamente, solo esperamos
            pass
        
        time.sleep(5) # Descansar 5 segundos

if __name__ == "__main__":
    inicializar()
    vigilar()
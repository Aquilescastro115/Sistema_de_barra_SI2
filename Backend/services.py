# backend/services.py
from app import get_db_connection


def get_professors_with_loans():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
            SELECT p.id_Profesor, p.Nombre, p.Email_institucional, p.Rut, p.Activo,
                   COUNT(pr.id_Prestamo) AS total_prestamos
            FROM Profesor p
            JOIN Prestamo pr ON pr.fk_id_Profesor = p.id_Profesor
            GROUP BY p.id_Profesor, p.Nombre, p.Email_institucional, p.Rut, p.Activo
            HAVING COUNT(pr.id_Prestamo) >= 1
            ORDER BY total_prestamos DESC, p.Nombre;
            """
            cursor.execute(sql)
            rows = cursor.fetchall()
            return rows
    finally:
        conn.close()


def get_professor_report(prof_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:

            # Profesor
            prof_q = """
            SELECT id_Profesor, Nombre, Email_institucional, Rut, Activo 
            FROM Profesor 
            WHERE id_Profesor = %s
            """
            cursor.execute(prof_q, (prof_id,))
            prof = cursor.fetchone()

            if not prof:
                raise Exception("Profesor no encontrado")

            # Detalle
            detalle_q = """
            SELECT dp.id_Detalle_prestamo, dp.fk_id_equipo, dp.fk_id_Prestamo,
                DATE_FORMAT(dp.fecha_entrega, '%Y-%m-%d') AS fecha_entrega,
                DATE_FORMAT(dp.fecha_devolucion, '%Y-%m-%d') AS fecha_devolucion,
                dp.estado,
                e.Tipo_equipo, e.Descripcion
            FROM Detalle_prestamo dp
            JOIN Equipo e ON e.id_equipo = dp.fk_id_equipo
            JOIN Prestamo pr ON pr.id_Prestamo = dp.fk_id_Prestamo
            WHERE pr.fk_id_Profesor = %s
            ORDER BY dp.fecha_entrega DESC;
            """
            cursor.execute(detalle_q, (prof_id,))
            detalle = cursor.fetchall()

            return prof, detalle

    finally:
        conn.close()

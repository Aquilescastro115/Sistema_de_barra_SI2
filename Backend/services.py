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
def create_loan_service(profesor_id, equipos_ids, fecha_solicitud, fecha_devolucion):
    """
    Crea un préstamo, sus detalles y actualiza el estado de los equipos.
    Retorna: (loan_id, error_message)
    """
    conn = get_db_connection()
    if not conn:
        return None, "No hay conexión a la base de datos"

    try:
        with conn.cursor() as cursor:
            # 1. Validar disponibilidad (Opcional pero recomendado)
            # Podríamos chequear aquí si los equipos ya están prestados, 
            # pero por ahora asumiremos que el frontend filtra bien.

            # 2. Insertar CABECERA (Tabla Prestamo)
            sql_prestamo = """
                INSERT INTO Prestamo (fk_id_Profesor, fecha_solicitud, estado, fecha_devolucion)
                VALUES (%s, %s, %s, %s)
            """
            # Estado inicial 'Activo'
            cursor.execute(sql_prestamo, (profesor_id, fecha_solicitud, 'Activo', fecha_devolucion))
            
            # Obtener el ID generado automáticamente
            loan_id = cursor.lastrowid

            # 3. Insertar DETALLES y ACTUALIZAR EQUIPOS (Bucle)
            sql_detalle = """
                INSERT INTO Detalle_prestamo (fk_id_equipo, fk_id_Prestamo, fecha_entrega, fecha_devolucion, estado)
                VALUES (%s, %s, %s, %s, %s)
            """
            sql_update_equipo = "UPDATE Equipo SET Estado = 'Prestado' WHERE id_equipo = %s"

            for equipo_id in equipos_ids:
                # Insertamos el detalle vinculando el equipo al prestamo (loan_id)
                cursor.execute(sql_detalle, (equipo_id, loan_id, fecha_solicitud, fecha_devolucion, 'Entregado'))
                
                # Marcamos el equipo como 'Prestado' en la tabla de inventario
                cursor.execute(sql_update_equipo, (equipo_id,))

            # 4. Confirmar cambios (Commit)
            # Si llegamos aquí, todo salió bien. Guardamos permanentemente.
            conn.commit()
            return loan_id, None

    except Exception as e:
        # 5. Revertir cambios (Rollback)
        # Si algo falló en medio del bucle, deshacemos TODO para no dejar datos corruptos.
        conn.rollback()
        return None, str(e)

    finally:
        conn.close()
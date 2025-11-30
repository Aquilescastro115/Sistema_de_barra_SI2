# backend/validaciones.py
from app import get_db_connection

# =============================
# VALIDAR CAMPOS GENERALES
# =============================
def validar_campos(data, campos_obligatorios):
    if not data:
        return "No se enviaron datos."

    for campo in campos_obligatorios:
        if campo not in data:
            return f"Falta el campo obligatorio: {campo}"

        if str(data[campo]).strip() == "":
            return f"El campo '{campo}' no puede estar vacío."

    return True


# =============================
# VALIDAR PRÉSTAMO (POST /prestamos)
# =============================
def validar_prestamo(data):
    campos = ["fk_id_Profesor", "fecha_solicitud", "estado", "fecha_devolucion"]
    validar = validar_campos(data, campos)

    if validar is not True:
        return validar

    # Validar ID Profesor
    try:
        id_prof = int(data["fk_id_Profesor"])
    except:
        return "El ID del profesor debe ser numérico."

    conn = get_db_connection()
    if conn is None:
        return "Error conectando a la base de datos."

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM Profesor WHERE id_Profesor = %s",
                (id_prof,)
            )
            profesor = cursor.fetchone()
    finally:
        conn.close()

    if not profesor:
        return "El profesor ingresado no existe."

    return True


# =============================
# VALIDAR DETALLE DE PRÉSTAMO
# =============================
def validar_detalle_prestamo(data):
    campos = ["fk_id_equipo", "fk_id_Prestamo", "fecha_entrega", "estado"]
    validar = validar_campos(data, campos)

    if validar is not True:
        return validar

    try:
        id_equipo = int(data["fk_id_equipo"])
        id_prestamo = int(data["fk_id_Prestamo"])
    except:
        return "Los IDs deben ser valores numéricos."

    conn = get_db_connection()
    if conn is None:
        return "Error conectando a la base de datos."

    try:
        with conn.cursor() as cursor:
            # Validar préstamo
            cursor.execute(
                "SELECT * FROM Prestamo WHERE id_Prestamo = %s",
                (id_prestamo,)
            )
            prestamo = cursor.fetchone()

            if not prestamo:
                return "El préstamo no existe."

            # Validar equipo
            cursor.execute(
                "SELECT * FROM Equipo WHERE id_equipo = %s",
                (id_equipo,)
            )
            equipo = cursor.fetchone()

            if not equipo:
                return "El equipo no existe."

            # Estado del equipo
            if equipo.get("Estado") == "Prestado":
                return "El equipo ya está prestado."
    finally:
        conn.close()

    return True


# =============================
# VALIDAR DEVOLUCIÓN
# PUT /detalle-prestamo/<id>/devolver
# =============================
def validar_devolucion(id_detalle):
    conn = get_db_connection()
    if conn is None:
        return "Error conectando a la base de datos."

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM Detalle_prestamo WHERE id_Detalle_prestamo = %s",
                (id_detalle,)
            )
            detalle = cursor.fetchone()
    finally:
        conn.close()

    if not detalle:
        return "El detalle de préstamo no existe."

    if detalle["estado"] == "Devuelto":
        return "El equipo ya fue devuelto."

    return True


# =============================
# VALIDAR ELIMINACIÓN DE PRÉSTAMO
# DELETE /prestamos/<id>
# =============================
def validar_eliminar_prestamo(id_prestamo):
    conn = get_db_connection()
    if conn is None:
        return "Error conectando a la base de datos."

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT COUNT(*) AS total FROM Detalle_prestamo WHERE fk_id_Prestamo = %s",
                (id_prestamo,)
            )
            detalles = cursor.fetchone()["total"]
    finally:
        conn.close()

    if detalles > 0:
        return "No se puede eliminar: el préstamo tiene detalles asociados."

    return True

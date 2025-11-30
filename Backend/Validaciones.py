from flask import jsonify
from database import get_db

# VALIDAR DATOS GENERALES (campos faltantes)
def validar_campos(data, campos_obligatorios):
    if not data:
        return "No se enviaron datos."

    for campo in campos_obligatorios:
        if campo not in data:
            return f"Falta el campo obligatorio: {campo}"

        if str(data[campo]).strip() == "":
            return f"El campo '{campo}' no puede estar vacío."

    return True

# VALIDAR PRESTAMO (POST /prestamos)
def validar_prestamo(data):
    """
    Valida los campos necesarios para crear un préstamo.
    """

    campos = ["fk_id_Profesor", "fecha_solicitud", "estado", "fecha_devolucion"]
    validar = validar_campos(data, campos)

    if validar is not True:
        return validar

    # Validar ID profesor
    try:
        id_prof = int(data["fk_id_Profesor"])
    except:
        return "El ID del profesor debe ser numérico."

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM Profesor WHERE id_Profesor = %s", (id_prof,))
    profesor = cursor.fetchone()

    cursor.close()

    if not profesor:
        return "El profesor ingresado no existe."

    return True

# VALIDAR DETALLE DE PRÉSTAMO (POST /detalle-prestamo)
def validar_detalle_prestamo(data):
    """
    Valida la creación de un detalle de préstamo.
    """

    campos = ["fk_id_equipo", "fk_id_Prestamo", "fecha_entrega", "estado"]
    validar = validar_campos(data, campos)

    if validar is not True:
        return validar

    # Validación numérica
    try:
        id_equipo = int(data["fk_id_equipo"])
        id_prestamo = int(data["fk_id_Prestamo"])
    except:
        return "Los IDs deben ser valores numéricos."

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Validar préstamo
    cursor.execute("SELECT * FROM Prestamo WHERE id_Prestamo = %s", (id_prestamo,))
    prestamo = cursor.fetchone()

    if not prestamo:
        cursor.close()
        return "El préstamo no existe."

    # Validar equipo
    cursor.execute("SELECT * FROM Equipo WHERE id_equipo = %s", (id_equipo,))
    equipo = cursor.fetchone()

    if not equipo:
        cursor.close()
        return "El equipo no existe."

    # Validar que el equipo no esté prestado
    if equipo["Estado"] == "Prestado":
        cursor.close()
        return "El equipo ya está prestado."

    cursor.close()
    return True

# VALIDAR DEVOLUCIÓN (PUT /detalle-prestamo/<id>/devolver)
def validar_devolucion(id_detalle):
    """
    Evita devolver un equipo ya devuelto o inexistente.
    """

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM Detalle_prestamo WHERE id_Detalle_prestamo = %s",
        (id_detalle,)
    )
    detalle = cursor.fetchone()

    if not detalle:
        cursor.close()
        return "El detalle de préstamo no existe."

    if detalle["estado"] == "Devuelto":
        cursor.close()
        return "El equipo ya fue devuelto."

    cursor.close()
    return True

# VALIDAR ELIMINACIÓN DE PRÉSTAMO (DELETE /prestamos/<id>)
def validar_eliminar_prestamo(id_prestamo):
    """
    Impide eliminar préstamos si tienen detalles asociados.
    """

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT COUNT(*) AS total FROM Detalle_prestamo WHERE fk_id_Prestamo = %s",
        (id_prestamo,)
    )
    detalles = cursor.fetchone()["total"]

    cursor.close()

    if detalles > 0:
        return "No se puede eliminar: el préstamo tiene detalles asociados."

    return True
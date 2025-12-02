# backend/api/loans.py
from flask import Blueprint, request, jsonify, current_app
import pymysql

loans_bp = Blueprint('loans', __name__)

@loans_bp.route('/loans/request', methods=['POST'])
def request_loan():
    """
    POST /api/loans/request
    body JSON esperado:
    {
      "fk_id_Profesor_solicitante": 1,
      "fk_id_Profesor_beneficiario": 4,
      "fk_id_equipo": 1,
      "fecha_devolucion": "2025-12-05"   # opcional
    }
    """
    # Importar la función de conexión aquí para evitar circular imports
    from app import get_db_connection

    data = request.get_json() or {}
    solicitante = data.get('fk_id_Profesor_solicitante')  # puede ser None
    beneficiario = data.get('fk_id_Profesor_beneficiario')
    equipo_id = data.get('fk_id_equipo')
    fecha_devolucion = data.get('fecha_devolucion')  # opcional
    solicitante_rut = data.get('solicitante_Rut')  # opcional

    if not solicitante and solicitante_rut:
        with get_db_connection().cursor() as c:
            c.execute("SELECT id_Profesor FROM Profesor WHERE Rut = %s AND Activo = 1", (solicitante_rut,))
            row = c.fetchone()
            if row:
                solicitante = row.get('id_Profesor')

    conn = get_db_connection()
    if conn is None:
        return jsonify({"ok": False, "message": "Error de conexión DB"}), 500

    try:
        with conn.cursor() as cursor:
            # 1) Verificar equipo existe y esté disponible
            cursor.execute("SELECT Estado FROM Equipo WHERE id_equipo = %s FOR UPDATE", (equipo_id,))
            row = cursor.fetchone()
            if not row:
                return jsonify({"ok": False, "message": "Equipo no encontrado"}), 404
            if str(row.get('Estado', '')).lower() not in ('disponible', 'libre', '0', '') and str(row.get('Estado','')).lower() != 'disponible':
                return jsonify({"ok": False, "message": "Equipo no disponible", "estado_actual": row.get('Estado')}), 400

            # 2) Validar beneficiario existe y activo
            cursor.execute("SELECT Activo FROM Profesor WHERE id_Profesor = %s", (beneficiario,))
            prof = cursor.fetchone()
            if not prof or int(prof.get('Activo', 0)) != 1:
                return jsonify({"ok": False, "message": "Beneficiario no válido o no activo"}), 400

            # Si fecha_devolucion no viene, añadir 7 días por defecto
            if not fecha_devolucion:
                cursor.execute("SELECT DATE_ADD(CURDATE(), INTERVAL 7 DAY) AS fd")
                fecha_devolucion = cursor.fetchone()['fd']

            # Insert Prestamo
            cursor.execute(
                "INSERT INTO Prestamo (fk_id_Profesor, fecha_solicitud, estado, fecha_devolucion) "
                "VALUES (%s, CURDATE(), %s, %s)",
                (beneficiario, 'Activo', fecha_devolucion)
            )
            id_prestamo = cursor.lastrowid

            # Insert Detalle_prestamo
            cursor.execute(
                "INSERT INTO Detalle_prestamo (fk_id_equipo, fk_id_Prestamo, fecha_entrega, fecha_devolucion, estado) "
                "VALUES (%s, %s, CURDATE(), %s, %s)",
                (equipo_id, id_prestamo, fecha_devolucion, 'Entregado')
            )
            id_detalle = cursor.lastrowid

            # Update Equipo estado
            cursor.execute("UPDATE Equipo SET Estado = %s WHERE id_equipo = %s", ('Prestado', equipo_id))

            # commit
            conn.commit()

        return jsonify({"ok": True, "id_Prestamo": id_prestamo, "id_Detalle": id_detalle, "message": "Préstamo creado"}), 201

    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        current_app.logger.exception("Error creando préstamo")
        return jsonify({"ok": False, "message": str(e)}), 500
    finally:
        try:
            conn.close()
        except Exception:
            pass
@loans_bp.route('/loans/return', methods=['POST'])
def return_loan():
    """
    POST /api/loans/return
    body JSON esperado:
    { "fk_id_equipo": 1 }    # o puedes enviar {"id_Detalle_prestamo": 123}
    """
    from app import get_db_connection

    data = request.get_json() or {}
    equipo_id = data.get('fk_id_equipo')
    id_detalle = data.get('id_Detalle_prestamo')

    if not equipo_id and not id_detalle:
        return jsonify({"ok": False, "message": "Falta fk_id_equipo o id_Detalle_prestamo"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"ok": False, "message": "Error de conexión DB"}), 500

    try:
        with conn.cursor() as cursor:
            # Si recibimos id_detalle, usamos ese; si no, buscamos el detalle activo por equipo
            if id_detalle:
                cursor.execute("SELECT fk_id_Prestamo, fecha_entrega, estado FROM Detalle_prestamo WHERE id_Detalle_prestamo = %s FOR UPDATE", (id_detalle,))
                detalle = cursor.fetchone()
                if not detalle:
                    return jsonify({"ok": False, "message": "Detalle no encontrado"}), 404
                # obtener fk_id_Prestamo desde detalle
                fk_prestamo = detalle['fk_id_Prestamo']
                cursor.execute("UPDATE Detalle_prestamo SET fecha_devolucion = CURDATE(), estado = %s WHERE id_Detalle_prestamo = %s", ('Devuelto', id_detalle))
            else:
                # buscar el detalle más reciente/activo para ese equipo
                cursor.execute("""
                    SELECT dp.id_Detalle_prestamo, dp.fk_id_Prestamo, dp.estado
                    FROM Detalle_prestamo dp
                    WHERE dp.fk_id_equipo = %s AND dp.estado IN ('Entregado', 'Prestado')
                    ORDER BY dp.id_Detalle_prestamo DESC
                    LIMIT 1
                """, (equipo_id,))
                detalle = cursor.fetchone()
                if not detalle:
                    return jsonify({"ok": False, "message": "No se encontró préstamo activo para este equipo"}), 404
                id_detalle = detalle['id_Detalle_prestamo']
                fk_prestamo = detalle['fk_id_Prestamo']
                cursor.execute("UPDATE Detalle_prestamo SET fecha_devolucion = CURDATE(), estado = %s WHERE id_Detalle_prestamo = %s", ('Devuelto', id_detalle))

            # Marcar equipo como disponible
            target_equipo_id = equipo_id if equipo_id else None
            if not target_equipo_id:
                # si no nos dieron equipo_id, obtener desde detalle (join)
                cursor.execute("SELECT fk_id_equipo FROM Detalle_prestamo WHERE id_Detalle_prestamo = %s", (id_detalle,))
                row = cursor.fetchone()
                target_equipo_id = row['fk_id_equipo']

            cursor.execute("UPDATE Equipo SET Estado = %s WHERE id_equipo = %s", ('Disponible', target_equipo_id))

            # Revisar si el prestamo padre tiene más detalles aún 'Entregado' o 'Prestado'
            cursor.execute("""
                SELECT COUNT(*) AS pendientes
                FROM Detalle_prestamo
                WHERE fk_id_Prestamo = %s AND estado IN ('Entregado', 'Prestado')
            """, (fk_prestamo,))
            pendientes = cursor.fetchone()['pendientes']
            if pendientes == 0:
                # cerrar el prestamo
                cursor.execute("UPDATE Prestamo SET estado = %s WHERE id_Prestamo = %s", ('Cerrado', fk_prestamo))

            conn.commit()

        return jsonify({"ok": True, "message": "Devolución procesada", "id_Detalle": id_detalle, "id_Prestamo": fk_prestamo, "id_equipo": target_equipo_id}), 200

    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        current_app.logger.exception("Error procesando devolución")
        return jsonify({"ok": False, "message": str(e)}), 500
    finally:
        try:
            conn.close()
        except Exception:
            pass


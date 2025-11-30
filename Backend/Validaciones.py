# Validación: Evitar prestar un equipo ya prestado
@app.route("/prestamos", methods=["POST"])
def crear_prestamo():
    data = request.json

    # Validación: formato de los datos
    try:
        equipo_id = int(data.get("equipo_id"))
        usuario_id = int(data.get("usuario_id"))
    except:
        return jsonify({"error": "Los ID deben ser numéricos"}), 400

    # Validación: campos obligatorios
    if not equipo_id or not usuario_id:
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    # Validación: evitar duplicar préstamo del mismo usuario
    prestamo_existente = db.session.execute(
        db.select(Prestamo).filter_by(
            id_equipo=equipo_id,
            id_usuario=usuario_id,
            fecha_devolucion=None
        )
    ).scalar_one_or_none()

    if prestamo_existente:
        return jsonify({"error": "Este usuario ya tiene este equipo prestado"}), 400

    # Validación: equipo existe
    equipo = db.session.execute(
        db.select(Equipo).filter_by(id=equipo_id)
    ).scalar_one_or_none()

    if not equipo:
        return jsonify({"error": "El equipo no existe"}), 404

    # Validación: equipo disponible
    if equipo.estado != "disponible":
        return jsonify({"error": "El equipo ya está prestado"}), 400

    # Crear préstamo
    nuevo = Prestamo(
        id_equipo=equipo_id,
        id_usuario=usuario_id,
        fecha_prestamo=datetime.now()
    )

    # Cambiar estado del equipo
    equipo.estado = "prestado"

    db.session.add(nuevo)
    db.session.commit()

    return jsonify({"message": "Préstamo registrado correctamente"})

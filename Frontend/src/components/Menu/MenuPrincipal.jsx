// src/components/MenuPrincipal.jsx
import { useNavigate } from 'react-router-dom';
import React from 'react';
import API from '../../api'; // ajusta si tu path es diferente

function MenuPrincipal({ scannedData, removeScannedItem, updateScannedItem, usuario, onLogout, onLoanCreated }) {
  const navigate = useNavigate();

  const handleNavigateReports = () => navigate('/reportes');
  const handleNavigation = () => navigate('/scanner');
  const handleNavigationQR = () => navigate('/scanner-qr');

  // Helper: intenta convertir personaCodigo a number (id_Profesor)
  const parseProfesorId = (personaCodigo) => {
    if (!personaCodigo) return null;
    const n = Number(String(personaCodigo).replace(/\D/g, ''));
    return Number.isInteger(n) && n > 0 ? n : null;
  };

  // Procesar todos los items escaneados: crea prestamos uno-a-uno (puedes adaptarlo a batch)
  const handleRegisterLoans = async () => {
    if (!scannedData || scannedData.length === 0) {
      alert('No hay datos escaneados para registrar.');
      return;
    }

    if (!confirm(`Confirmar registro de ${scannedData.length} préstamo(s)?`)) return;

    // iterar y enviar uno por uno; en producción podrías enviar en batch
    for (let i = 0; i < scannedData.length; i++) {
      const item = scannedData[i];
      try {
        // Asumimos que personaCodigo contiene id_Profesor.
        const profesorId = parseProfesorId(item.personaCodigo);

        // Si no es id, intentamos buscar por rut/email (opcional)
        let fk_id_Profesor = profesorId;
        if (!fk_id_Profesor) {
          // Si tu backend tiene endpoint para buscar profesor por Rut/Email, llama aquí.
          // Example: GET /api/profesores?rut=...
          // Para no bloquear, mostramos error instructivo:
          alert(`El código de persona "${item.personaCodigo}" no parece un ID válido. Asegúrate que el código corresponda al id_Profesor o implementa búsqueda por RUT/email.`);
          continue;
        }

        const payload = {
          fk_id_Profesor_solicitante: fk_id_Profesor,    // quien realiza la petición (puede ser el profesor logueado)
          fk_id_Profesor_beneficiario: fk_id_Profesor,   // si se presta al mismo profesor; ajustar si diferente
          fk_id_equipo: Number(item.equipoCodigo) || Number(item.equipoId) || null,
          fecha_devolucion: null // opcional: backend puede calcular fecha por defecto
        };

        if (!payload.fk_id_equipo) {
          alert(`El item ${i+1} no contiene código de equipo válido: ${item.equipoCodigo}`);
          continue;
        }

        // Llamada al backend: POST /api/loans/request
        const res = await API.post('/loans/request', payload);
        if (res.data && res.data.ok) {
          // El préstamo se creó. Opcional: notificar usuario y borrar item local
          alert(`Préstamo creado (ID: ${res.data.id_Prestamo}) para equipo ${payload.fk_id_equipo}`);
          // Remover item de la lista UI (usa la función que ya tienes)
          // Busca el index actual (i) — aquí asumimos removeScannedItem usa el index actual
          removeScannedItem(i); // si tu removeScannedItem elimina por index, ok. Si no, adáptalo.
          // Llamada opcional al callback padre para refrescar reportes/inventario
          if (typeof onLoanCreated === 'function') onLoanCreated(res.data);
        } else {
          const msg = res.data?.message || 'Error al crear préstamo';
          alert(`No se pudo crear préstamo para equipo ${payload.fk_id_equipo}: ${msg}`);
        }
      } catch (err) {
        console.error('Error al registrar préstamo', err);
        alert(`Error al registrar préstamo: ${err.response?.data?.message || err.message}`);
      }
    }

    // después de procesar todo, navega a reportes para ver cambios
    navigate('/reportes');
  };


  return (
    <div className="container">
      <header style={{ marginBottom: '20px', color: 'white', textAlign: 'center' }}>
        <h1>Préstamo de Equipos</h1>
      </header>

      <div className='user-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: 'white' }}>
        <h2>Hola, {usuario}</h2>
      </div>

      <div className="data-container">
        {scannedData.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Código persona</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Código equipo</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Hora de escaneo</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Estado</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {scannedData.map((data, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{data.personaCodigo || 'No registrado'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{data.equipoCodigo || 'No registrado'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{data.hora}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                    <select
                      value={data.estado}
                      onChange={(e) => updateScannedItem(index, e.target.value)}
                    >
                      <option value="Dentro de plazo">Dentro de plazo</option>
                      <option value="Fuera de plazo">Fuera de plazo</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                    <button onClick={() => removeScannedItem(index)}>Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'white' }}>No se han escaneado datos.</p>
        )}
      </div>

      <div className="button-container" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
        <div className="card">
          <button onClick={handleNavigation}>Escanear persona y equipo (Barras)</button>
        </div>
        <div className="card">
          <button onClick={handleNavigationQR}>Escanear persona y equipo (QR)</button>
        </div>
        <div className="card">
          <button onClick={handleNavigateReports}>Ir a Reportes</button>
        </div>

        {/* Nuevo botón: registrar préstamos */}
        <div className="card">
          <button onClick={handleRegisterLoans} style={{ backgroundColor: '#2a9d8f', color: 'white' }}>
            Registrar préstamo(s)
          </button>
        </div>

function MenuPrincipal({ scannedData, removeScannedItem, updateScannedItem, usuario, onLogout }) {
    const navigate = useNavigate();

    const handleNavigateReports = () => navigate('/reportes');
    const handleNavigation = () => navigate('/scanner');
    const handleNavigationQR = () => navigate('/scanner-qr');
    const handleNavigateGenerarCodigo = () => navigate('/generar-codigo');



    return (
        <div className="container">
            <header style={{ marginBottom: '20px', color: 'white', textAlign: 'center' }}>
                <h1>Préstamo de Equipos</h1>
            </header>

            <div className='user-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: 'white' }}>
                <h2>Hola, {usuario}</h2>

            </div>

            <div className="data-container">
                {scannedData.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Código persona</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Código equipo</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Hora de escaneo</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Estado</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scannedData.map((data, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{data.personaCodigo || 'No registrado'}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{data.equipoCodigo || 'No registrado'}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{data.hora}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                                        <select
                                            value={data.estado}
                                            onChange={(e) => updateScannedItem(index, e.target.value)}
                                        >
                                            <option value="Dentro de plazo">Dentro de plazo</option>
                                            <option value="Fuera de plazo">Fuera de plazo</option>
                                            <option value="Pendiente">Pendiente</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                                        <button onClick={() => removeScannedItem(index)}>Borrar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: 'white' }}>No se han escaneado datos.</p>
                )}
            </div>

            <div className="button-container" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                <div className="card">
                    <button onClick={handleNavigation}>
                        Escanear persona y equipo (Barras)
                    </button>
                </div>
                <div className="card">
                    <button onClick={handleNavigationQR}>
                        Escanear persona y equipo (QR)
                    </button>
                </div>
                <div className="card">
                    <button onClick={handleNavigateReports}>Ir a Reportes</button>
                </div>
                <div className="card">  
                    <button onClick={onLogout} style={{ backgroundColor: '#C82909', padding: '5px 15px' }}>
                    Salir
                    </button>
                </div>
                <div className="card">
                    <button onClick={handleNavigateGenerarCodigo} style={{ backgroundColor: '#C82909', padding: '5px 15px' }}>
                        Generar QR / Código de Barras
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default MenuPrincipal;

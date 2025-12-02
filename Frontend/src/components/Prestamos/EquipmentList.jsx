// frontend/src/components/EquipmentList.jsx
import React, { useEffect, useState } from 'react';
import API from '../../api';
import LoanModal from './LoanModal'; // ajusta la ruta si tu LoanModal está en otra carpeta
import ExportPdfButton from '../Reportes/ExportPdfButton';

export default function EquipmentList({ currentUserId, currentUserRut, onLoanSuccess }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    API.get('/equipos')
      .then(res => { if (!mounted) return; setItems(res.data ?? []); })
      .catch(err => { console.error(err); setItems([]); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [refreshKey]);

  const openLoan = (equipo) => {
    console.log('openLoan currentUserId=', currentUserId, 'currentUserRut=', currentUserRut);
    setSelectedEquipo(equipo);
    setModalOpen(true);
  };
  const handleModalClose = () => { setModalOpen(false); setSelectedEquipo(null); };

  const handleLoanSuccess = (result) => {
    setRefreshKey(k => k + 1);
    if (typeof onLoanSuccess === 'function') onLoanSuccess(result);
    handleModalClose();
  };
  // Dentro de EquipmentList.jsx (en el mismo componente que ya tienes)

// handleReturn (mejorado con fallback URL y logging)
const handleReturn = async (equipo) => {
  if (!window.confirm(`Confirmar devolución del equipo ${equipo.Tipo_equipo} (ID ${equipo.id_equipo})?`)) return;

  try {
    // Intentamos con la instancia API (si tu API tiene baseURL '/api' esto apunta a '/api/loans/return')
    let res;
    try {
      res = await API.post('/loans/return', { fk_id_equipo: Number(equipo.id_equipo) });
    } catch (errInner) {
      // Si falla por Network Error con API, intentamos con ruta absoluta (por si tu API no tiene baseURL)
      console.warn('API.post("/loans/return") falló, intentando con /api/loans/return', errInner?.message);
      res = await API.post('/api/loans/return', { fk_id_equipo: Number(equipo.id_equipo) });
    }

    // Respuesta OK del servidor
    if (res?.data?.ok) {
      alert('Devolución procesada correctamente.');
      setRefreshKey(k => k + 1);
      if (typeof onLoanSuccess === 'function') onLoanSuccess(res.data);
    } else {
      // Respuesta del servidor con ok:false
      const serverMsg = res?.data?.message || JSON.stringify(res?.data) || 'Respuesta inesperada';
      alert('Error en devolución: ' + serverMsg);
    }
  } catch (err) {
    // Mejor logging para depurar Network Error
    console.error('Error en handleReturn:', err);

    // Si axios, puede contener err.response y err.request
    const resp = err?.response;
    if (resp) {
      console.error('Response status:', resp.status, 'data:', resp.data);
      alert('Error en la devolución: ' + (resp.data?.message || `HTTP ${resp.status}`));
    } else if (err?.request) {
      // request fue enviado pero no hubo respuesta (Network Error / CORS / backend caido)
      console.error('No response received. err.request:', err.request);
      alert('Error en la devolución: No se recibió respuesta del servidor (Network Error). Verifica que el backend esté corriendo y que la URL sea correcta.');
    } else {
      // otro error (por ejemplo, problema en front)
      alert('Error en la devolución: ' + (err.message || 'Error desconocido'));
    }
  }
};



  const columns = [
    { header: 'ID', key: 'id_equipo' },
    { header: 'Codigo', key: 'Codigo_qr' },
    { header: 'Tipo', key: 'Tipo_equipo' },
    { header: 'Descripción', key: 'Descripcion' },
    { header: 'Estado', key: 'Estado' },
  ];

  return (
    <div>
      <h3>Inventario de Equipos</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <ExportPdfButton columns={columns} data={items} title="Inventario_de_Equipos" />
        <small style={{ color: '#666' }}>Exportar inventario a PDF</small>
      </div>

      {loading ? <div>Cargando equipos...</div> : (
        <table className="simple-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              {columns.map(c => <th key={c.key}>{c.header}</th>)}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={columns.length + 1}>No hay equipos.</td></tr>
            ) : items.map(eq => (
              <tr key={eq.id_equipo}>
                <td>{eq.id_equipo}</td>
                <td>{eq.Codigo_qr}</td>
                <td>{eq.Tipo_equipo}</td>
                <td>{eq.Descripcion}</td>
                <td>{eq.Estado}</td>
<td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
  {eq.Estado && String(eq.Estado).toLowerCase() === 'disponible' ? (
    <button onClick={() => openLoan(eq)} style={{ padding: '', borderRadius: 12, background: '', color: '#fff', border: 'none', cursor: 'pointer' }}>
      Solicitar préstamo
    </button>
  ) : (
    <button onClick={() => handleReturn(eq)} style={{ padding: '', borderRadius: 12, background: '#bcd', color: '#fff', border: 'none', cursor: 'pointer' }}>
      Devolver
    </button>
  )}
</td>


                
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && selectedEquipo && (
        <LoanModal
          equipo={selectedEquipo}
          onClose={handleModalClose}
          onSuccess={handleLoanSuccess}
          currentUserId={currentUserId}
          currentUserRut={currentUserRut}
        />
      )}
    </div>
  );
}

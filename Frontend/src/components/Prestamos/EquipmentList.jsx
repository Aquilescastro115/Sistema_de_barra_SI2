// src/components/EquipmentList.jsx
import React, { useEffect, useState } from 'react';
import API from '../../api';
import LoanModal from './LoanModal';
import ExportPdfButton from '../Reportes/ExportPdfButton';
import axios from '../../api';


export default function EquipmentList({ currentUserId, onLoanSuccess }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    API.get('/equipos') // ajusta si tu endpoint es /api/equipos o /api/equipments
      .then(res => {
        if (!mounted) return;
        const data = res.data ?? [];
        setItems(data);
      })
      .catch(err => { console.error(err); setItems([]); })
      .finally(()=> mounted && setLoading(false));
    return () => { mounted = false; };
  }, [refreshKey]);

  const openLoan = (equipo) => { setSelectedEquipo(equipo); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setSelectedEquipo(null); };

  const handleLoanSuccess = (result) => {
    setRefreshKey(k => k + 1);
    if (typeof onLoanSuccess === 'function') onLoanSuccess(result);
    handleModalClose();
  };

  const columns = [
    { header: 'ID', key: 'id_equipo' },
    { header: 'QR', key: 'Codigo_qr' },
    { header: 'Tipo', key: 'Tipo_equipo' },
    { header: 'Descripción', key: 'Descripcion' },
    { header: 'Estado', key: 'Estado' },
  ];
  const handleRequestLoan = async ({ solicitanteId, beneficiarioId, equipoId }) => {
    try {
      const body = {
        fk_id_Profesor_solicitante: solicitanteId,
        fk_id_Profesor_beneficiario: beneficiarioId,
        fk_id_equipo: equipoId,
        // fecha_devolucion: '2025-12-05' // opcional
      };
      // Asegúrate que la baseURL de axios apunta a tu backend; si usas proxy en package.json, '/api/...' está bien.
      const res = await axios.post('/api/loans/request', body);
      if (res.data && res.data.ok) {
        alert('Préstamo creado OK: ID préstamo ' + res.data.id_Prestamo);
        if (onLoanSuccess) onLoanSuccess();
      } else {
        // mostrar el mensaje de error que venga del backend
        const msg = (res.data && res.data.message) ? res.data.message : 'Respuesta inesperada';
        alert('Error en la solicitud: ' + msg);
      }
    } catch (err) {
      console.error('Error en request loan:', err);
      // Mostrar mensaje con lo que venga del servidor si existe
      const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
      alert('Error en la solicitud: ' + serverMsg);
    }}

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
                <td>
                  {eq.Estado && eq.Estado.toLowerCase() === 'disponible' ? (
                    <button onClick={() => openLoan(eq)}>Solicitar préstamo</button>
                  ) : (
                    <button disabled style={{ opacity: 0.6 }}>No disponible</button>
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

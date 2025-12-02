// frontend/src/components/Prestamos/LoanModal.jsx
import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function LoanModal({ equipo, onClose, onSuccess, currentUserId, currentUserRut }) {
  const [profesores, setProfesores] = useState([]);
  const [beneficiarioId, setBeneficiarioId] = useState('');
  const [fechaDevolucion, setFechaDevolucion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    API.get('/profesores')
      .then(res => { if (mounted) setProfesores(res.data || []); })
      .catch(err => { console.error('Error cargando profesores', err); if (mounted) setProfesores([]); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // debug: mostrar valores al abrir
    console.log('LoanModal mounted, currentUserId=', currentUserId, 'currentUserRut=', currentUserRut);
  }, [currentUserId, currentUserRut]);

  const handleSubmit = async () => {
    setError(null);

    if (!currentUserId) {
      setError('No se detectó el usuario solicitante.');
      return;
    }
    if (!beneficiarioId) {
      setError('Seleccione un beneficiario.');
      return;
    }
    if (!equipo || !equipo.id_equipo) {
      setError('Equipo inválido.');
      return;
    }

    if (!window.confirm(`Confirmar préstamo del equipo ${equipo.Tipo_equipo} (ID ${equipo.id_equipo}) al profesor ID ${beneficiarioId}?`)) return;

    const payload = {
      fk_id_Profesor_solicitante: Number(currentUserId),
      fk_id_Profesor_beneficiario: Number(beneficiarioId),
      fk_id_equipo: Number(equipo.id_equipo),
      fecha_devolucion: fechaDevolucion || null,
      solicitante_Rut: currentUserRut || null
    };

    try {
      setLoading(true);
      const res = await API.post('/loans/request', payload);
      if (res.data?.ok) {
        alert('Préstamo creado: ' + res.data.id_Prestamo);
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        setError(res.data?.message || 'Error en el servidor');
      }
    } catch (err) {
      console.error('Error en request loan:', err);
      const serverMessage = err?.response?.data?.message || err?.message || 'Error en la solicitud';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ width:480, background:'#fff', borderRadius:8, padding:16 }}>
        <h3>Solicitar préstamo — Equipo {equipo?.Tipo_equipo} (ID {equipo?.id_equipo})</h3>

        {error && <div style={{ background:'#ffdddd', padding:8, borderRadius:4, color:'#900', marginBottom:10 }}>{error}</div>}

        {/* NO TOCAR: select de profesores */}
        <label>Beneficiario (Profesor)</label>
        <select value={beneficiarioId} onChange={e => setBeneficiarioId(e.target.value)}>
          <option value="">-- Seleccionar --</option>
          {profesores.map(p => (
            <option key={p.id_Profesor} value={p.id_Profesor}>
              {p.Nombre} ({p.Email_institucional})
            </option>
          ))}
        </select>

        <label>Fecha devolución (opcional)</label>
        <input type="date" value={fechaDevolucion} onChange={e => setFechaDevolucion(e.target.value)} />

        <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
          <button onClick={onClose} disabled={loading} style={{ background:'#ccc' }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading}>{loading ? 'Enviando...' : 'Confirmar préstamo'}</button>
        </div>
      </div>
    </div>
  );
}

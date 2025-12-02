import React, { useState, useEffect } from 'react';
import API from '../../api'; // Ajusta si tu path es distinto

export default function LoanModal({ equipo, onClose, onSuccess, currentUserId }) {
  const [profesores, setProfesores] = useState([]);
  const [beneficiarioId, setBeneficiarioId] = useState(currentUserId || '');
  const [fechaDevolucion, setFechaDevolucion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar profesores al abrir modal
  useEffect(() => {
    let mounted = true;

    API.get('/profesores')
      .then(res => {
        if (mounted) setProfesores(res.data || []);
      })
      .catch(e => {
        console.error('Error cargando profesores', e);
        if (mounted) setProfesores([]);
      });

    return () => { mounted = false };
  }, []);

  // Handler final (uno solo)
  const handleSubmit = async () => {
    setError(null);

    // Validaciones
    if (!beneficiarioId) {
      return setError('Seleccione un beneficiario.');
    }
    if (!currentUserId) {
      return setError('No se detectó el usuario solicitante.');
    }
    if (!equipo || !equipo.id_equipo) {
      return setError('Equipo inválido.');
    }

    if (!confirm(`Confirmar préstamo del equipo ${equipo.Tipo_equipo} (ID ${equipo.id_equipo}) al profesor ${beneficiarioId}?`)) {
      return;
    }

const payload = {
  fk_id_Profesor_solicitante: Number(currentUserId),
  fk_id_Profesor_beneficiario: Number(beneficiarioId),
  fk_id_equipo: Number(equipo.id_equipo),
  fecha_devolucion: fechaDevolucion || null,
  solicitante_Rut: currentUserRut || null   // <-- agregamos el rut (opcional)
};

// Envío
const res = await API.post('/loans/request', payload);


    try {
      setLoading(true);
      const res = await API.post('/loans/request', payload);

      if (res.data?.ok) {
        alert('Préstamo creado: ' + res.data.id_Prestamo);
        if (onSuccess) onSuccess(res.data);
      } else {
        setError(res.data?.message || 'Error desconocido del backend');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error en la solicitud');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:480, background:'#fff', borderRadius:8, padding:16 }}>
        
        <h3>Solicitar préstamo — Equipo {equipo.Tipo_equipo} (ID {equipo.id_equipo})</h3>

        {error && (
          <div style={{ background:'#ffdddd', padding:8, borderRadius:4, color:'#900', marginBottom:10 }}>
            {error}
          </div>
        )}

        <label>Beneficiario (Profesor)</label>
        <select value={beneficiarioId} onChange={e=>setBeneficiarioId(e.target.value)}>
          <option value="">-- Seleccionar --</option>
          {profesores.map(p => <option key={p.id_Profesor} value={p.id_Profesor}>{p.Nombre} ({p.Email_institucional})</option>)}
        </select>

        <label>Fecha devolución (opcional)</label>
        <input type="date" value={fechaDevolucion} onChange={e=>setFechaDevolucion(e.target.value)} />

        <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ background:'#ccc', color:'#000' }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading}>{loading ? 'Enviando...' : 'Confirmar préstamo'}</button>
        </div>
      </div>
    </div>
  );
}

// frontend/src/components/reports/ReportsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import API from '../../api';
import ExportPdfButton from './ExportPdfButton';
import ProfessorDetailModal from './ProfessorDetailModal';
import EquipmentList from '../Prestamos/EquipmentList';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

export const PROJECT_STRUCTURE_SCREENSHOT = '/mnt/data/6a6e0a2c-a24c-4988-9389-729f863d011b.png';

export default function ReportsPage(){
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProf, setSelectedProf] = useState(null);
const storedUserId = localStorage.getItem('userId'); // string o null
const currentUserId = storedUserId ? Number(storedUserId) : null;
const storedUserRut = localStorage.getItem('userRut') || null;
const currentUserRut = storedUserRut || null;


  const navigate = useNavigate();

  const refreshProfessors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/reports/professors-with-loans');
      setProfessors(res.data || []);
    } catch (err) {
      console.error('Error cargando profesores con préstamos', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(()=> {
    refreshProfessors();
  }, [refreshProfessors]);

  const columns = [
    { header: 'ID', key: 'id_Profesor' },
    { header: 'Nombre', key: 'Nombre' },
    { header: 'Email', key: 'Email_institucional' },
    { header: 'Rut', key: 'Rut' },
    { header: 'Activo', key: 'Activo' },
    { header: 'Total préstamos', key: 'total_prestamos' }
  ];

  return (
    <div style={{ 
        padding: '30px',
        margin: '40px auto',         
        maxWidth: '1100px',       
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '15px',       
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', 
        color: '#333'               
    }}>
    <div style={{ marginBottom: '20px' }}>
         <button 
           onClick={() => navigate('/')}
           style={{
             display: 'flex', alignItems: 'center', gap: '8px',
             background: '#333', color: 'white',
             border: 'none', padding: '8px 16px', borderRadius: '20px',
             cursor: 'pointer', fontSize: '14px'
           }}
         >
           <FaArrowLeft /> Volver al Menú
         </button>
      </div>

      <h2>Reportes — Profesores con préstamos</h2>
      <p style={{ fontSize: 13, color: '#555' }}>
        Lista de profesores que han prestado al menos un equipo. (Estructura del proyecto: {PROJECT_STRUCTURE_SCREENSHOT})
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <ExportPdfButton columns={columns} data={professors} title="Profesores_con_prestamos" />
        <small style={{ color:'#666' }}>Exportar listado completo a PDF</small>
      </div>

      {loading ? <div>Cargando...</div> : (
        <table className="simple-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              {columns.map(c => <th key={c.key}>{c.header}</th>)}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {professors.length === 0 && <tr><td colSpan={columns.length+1}>No hay profesores con préstamos.</td></tr>}
            {professors.map(p => (
              <tr key={p.id_Profesor}>
                <td>{p.id_Profesor}</td>
                <td>{p.Nombre}</td>
                <td>{p.Email_institucional}</td>
                <td>{p.Rut ?? '—'}</td>
                <td>{p.Activo ? 'Sí' : 'No'}</td>
                <td>{p.total_prestamos ?? 0}</td>
                <td>
                  <button onClick={() => setSelectedProf(p)}>Ver detalle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedProf && (
        <ProfessorDetailModal
          profesor={selectedProf}
          onClose={() => setSelectedProf(null)}
        />
      )}

      <hr style={{ margin: '24px 0' }} />

      {/* Aquí incluimos el inventario y pasamos refreshProfessors como callback */}
<EquipmentList
  currentUserId={currentUserId}
  currentUserRut={currentUserRut}
  onLoanSuccess={() => refreshProfessors()}
/>
    </div>
  );
}

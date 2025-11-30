// frontend/src/components/reports/ProfessorDetailModal.jsx
import React, { useEffect, useState } from 'react';
import API from '../../api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ProfessorDetailModal({ profesor, onClose }) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState([]); // rows from Detalle_prestamo joined with Equipo/Prestamo
  const [profInfo, setProfInfo] = useState(profesor);

  useEffect(()=>{
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Endpoint que backend debe exponer: GET /api/reports/professors/:id
        const res = await API.get(`/reports/professors/${profesor.id_Profesor}`);
        if(mounted){
          // Expect response: { profesor: {...}, detalle: [ {id_Detalle_prestamo, fk_id_equipo, fk_id_Prestamo, fecha_entrega, fecha_devolucion, estado, Tipo_equipo, Descripcion } ] }
          setProfInfo(res.data.profesor || profesor);
          setDetails(res.data.detalle || []);
        }
      } catch (err) {
        console.error('Error cargando detalle profesor', err);
      } finally {
        if(mounted) setLoading(false);
      }
    };
    load();
    return ()=> mounted = false;
  }, [profesor]);

  const handleExportProfessor = () => {
    const doc = new jsPDF({ unit:'pt', format:'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(14);
    doc.text(`Reporte — Profesor: ${profInfo.Nombre}`, pageWidth/2, 40, { align: 'center' });

    // Profesor info (simple table key/value)
    const pHead = [['Campo','Valor']];
    const pBody = [
      ['ID', profInfo.id_Profesor],
      ['Nombre', profInfo.Nombre],
      ['Email', profInfo.Email_institucional],
      ['Rut', profInfo.Rut || '—'],
      ['Activo', profInfo.Activo ? 'Sí' : 'No'],
    ];
    doc.autoTable({ startY: 70, head: pHead, body: pBody, theme: 'grid', styles:{fontSize:10} });

    // Detalle de préstamos
    const cols = ['ID detalle','ID equipo','Tipo equipo','Descripción','Fecha entrega','Fecha devolución','Estado','ID préstamo'];
    const rows = details.map(d => [
      d.id_Detalle_prestamo,
      d.fk_id_equipo,
      d.Tipo_equipo || '',
      d.Descripcion || '',
      d.fecha_entrega,
      d.fecha_devolucion,
      d.estado,
      d.fk_id_Prestamo
    ]);
    doc.autoTable({
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 150,
      head: [cols],
      body: rows,
      styles:{fontSize:9, cellPadding:6},
      headStyles:{ fillColor: [30,136,229], textColor:255 },
      margin: { left: 30, right: 30 }
    });

    doc.save(`Reporte_profesor_${profInfo.id_Profesor}_${profInfo.Nombre.replace(/\s+/g,'_')}.pdf`);
  };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
    }}>
      <div style={{ width:'90%', maxWidth:980, background:'#fff', borderRadius:8, padding:16, maxHeight:'90vh', overflow:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3>Detalle — Profesor: {profInfo.Nombre}</h3>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleExportProfessor}>Exportar PDF</button>
            <button onClick={onClose} style={{ background:'#ccc', color:'#000' }}>Cerrar</button>
          </div>
        </div>

        {loading ? <div>Cargando...</div> : (
          <>
            <section style={{ marginBottom: 12 }}>
              <h4>Información personal</h4>
              <table>
                <tbody>
                  <tr><td><strong>ID</strong></td><td>{profInfo.id_Profesor}</td></tr>
                  <tr><td><strong>Nombre</strong></td><td>{profInfo.Nombre}</td></tr>
                  <tr><td><strong>Email</strong></td><td>{profInfo.Email_institucional}</td></tr>
                  <tr><td><strong>Rut</strong></td><td>{profInfo.Rut || '—'}</td></tr>
                  <tr><td><strong>Activo</strong></td><td>{profInfo.Activo ? 'Sí' : 'No'}</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h4>Historial de Detalle de Préstamos</h4>
              <table className="simple-table" style={{ width:'100%' }}>
                <thead>
                  <tr>
                    <th>ID detalle</th>
                    <th>ID equipo</th>
                    <th>Tipo equipo</th>
                    <th>Descripción</th>
                    <th>Fecha entrega</th>
                    <th>Fecha devolución</th>
                    <th>Estado</th>
                    <th>ID préstamo</th>
                  </tr>
                </thead>
                <tbody>
                  {details.length === 0 && <tr><td colSpan={8}>No hay registros de detalle de préstamos para este profesor.</td></tr>}
                  {details.map(d => (
                    <tr key={d.id_Detalle_prestamo}>
                      <td>{d.id_Detalle_prestamo}</td>
                      <td>{d.fk_id_equipo}</td>
                      <td>{d.Tipo_equipo}</td>
                      <td>{d.Descripcion}</td>
                      <td>{d.fecha_entrega}</td>
                      <td>{d.fecha_devolucion}</td>
                      <td>{d.estado}</td>
                      <td>{d.fk_id_Prestamo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

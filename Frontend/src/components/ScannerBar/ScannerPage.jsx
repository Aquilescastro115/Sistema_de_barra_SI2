import React, { useState } from 'react';
import { useBarcodeScanner } from './useBarcodeScanner.js';
import { useNavigate } from 'react-router-dom';

function ScannerPage({ addScannedItem }) {
  const [scannedCode, setScannedCode] = useState("Esperando...");
  const [scanMode, setScanMode] = useState('persona');
  const navigate = useNavigate();

  useBarcodeScanner({
    onScan: (code) => {
      console.log("Escaneado:", code);
      setScannedCode(code);
      addScannedItem({ codigo: code, hora: new Date().toLocaleTimeString() });
      navigate('/');  
      addScannedItem({ codigo: code, hora: new Date().toLocaleTimeString(), tipo: scanMode });
      navigate('/');
    }
  });

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Página de Escaneo</h1>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>¿Qué deseas escanear?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => setScanMode('persona')}
            style={{
              padding: '10px 15px',
              backgroundColor: scanMode === 'persona' ? '#4caf50' : '#e0e0e0',
              color: scanMode === 'persona' ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Datos de la persona
          </button>
          <button
            onClick={() => setScanMode('equipo')}
            style={{
              padding: '10px 15px',
              backgroundColor: scanMode === 'equipo' ? '#4caf50' : '#e0e0e0',
              color: scanMode === 'equipo' ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Datos del equipo
          </button>
        </div>
        <p style={{ marginTop: '10px', color: 'gray' }}>Modo seleccionado: <strong>{scanMode === 'persona' ? 'Persona' : 'Equipo'}</strong></p>
      </div>

      <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'gray' }}>
        Producto detectado: {scannedCode}
      </p> <br></br>
      <p style={{ fontSize: '12px', color: 'gray' }}>
        (Usa la pistola USB o escribe rápido y presiona Enter)
      </p>
    </div>
  );
}

export default ScannerPage;
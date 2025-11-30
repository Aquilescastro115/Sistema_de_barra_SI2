import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

function ScannerQR({ addScannedItem }) {

  const [scanStep, setScanStep] = useState('persona'); // 'persona' o 'equipo'
  const [scanResult, setScanResult] = useState(null);

  // Usamos Refs para mantener el valor dentro del callback del escáner sin reiniciar el useEffect
  const personaCodeRef = useRef(null);
  const equipoCodeRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Limpiamos refs al montar
    personaCodeRef.current = null;
    equipoCodeRef.current = null;

    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 250 }, 
      fps: 10,
      disableFlip: false, 
      aspectRatio: 1.0,
      videoConstraints: { facingMode: "environment" } 
    });

    const success = (result) => {
      // 1. PASO 1: Escanear Persona
      if (!personaCodeRef.current) {
        console.log("Persona detectada:", result);
        personaCodeRef.current = result;
        setScanStep('equipo'); 
        

        alert("Persona detectada. Ahora escanea el Equipo.");
        return;
      }


      if (!equipoCodeRef.current && result !== personaCodeRef.current) {
        console.log("Equipo detectado:", result);
        equipoCodeRef.current = result;
        setScanResult(result); 
        addScannedItem({
          codigo: `P: ${personaCodeRef.current} / E: ${result}`,
          hora: new Date().toLocaleTimeString(),
        });
        scanner.clear();
        navigate('/');
      }
    };

    const error = (err) => {
    };

    scanner.render(success, error);
    return () => {
      scanner.clear().catch((error) => console.error("Error limpiando scanner", error));
    };
  }, [addScannedItem, navigate]);

  return (
    <div className="CodeQR" style={{ textAlign: 'center', margin: '20px' }}>
      

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(51, 51, 51, 0.8)', color: 'white',
            border: 'none', padding: '10px 20px', borderRadius: '20px',
            cursor: 'pointer', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          <FaArrowLeft /> Volver al Menú
        </button>
      </div>

      <h1>Escaneo de QR</h1>
      

      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '8px', display: 'inline-block' }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>
            Escaneando: <span style={{ color: 'steelblue', fontSize: '1.2em' }}>
                {scanStep === 'persona' ? '👤 PROFESOR' : '💻 EQUIPO'}
            </span>
        </p>
      </div>

      {scanResult ? (
          <div>
            <h2>¡Escaneo Exitoso!</h2>
            <p>Datos guardados correctamente.</p>
          </div>
        ) : (

          <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}></div>
        )
      }

      <p className="helper-text" style={{ marginTop: '20px', color: '#666' }}>
        (Apunta la cámara al QR del {scanStep === 'persona' ? 'Profesor' : 'Equipo'})
      </p>

    </div>
  );
}

export default ScannerQR;
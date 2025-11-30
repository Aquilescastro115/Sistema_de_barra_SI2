
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';

function ScannerQR({ addScannedItem }) {
  const [scanResult, setScanResult] = useState(null);
  const [scanStep, setScanStep] = useState('persona');
  const personaCodeRef = useRef('');
  const equipoCodeRef = useRef('');
  const [personaCode, setPersonaCode] = useState('');
  const [equipoCode, setEquipoCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    personaCodeRef.current = '';
    equipoCodeRef.current = '';

    const elementId = 'reader';
    const scanner = new Html5QrcodeScanner(elementId, {
      qrbox: {
        width: 300,
        height: 300,
      },
      fps: 10,
      disableFlip: true,
      aspectRatio: 1.0,
      videoConstraints: {
        facingMode: "environment"
      }
    });

    const success = (result) => {
      if (!personaCodeRef.current) {
        personaCodeRef.current = result;
        setPersonaCode(result);
        setScanStep('equipo');
        return;
      }

      if (!equipoCodeRef.current) {
        equipoCodeRef.current = result;
        setEquipoCode(result);
        setScanResult(result);
        addScannedItem({
          personaCodigo: personaCodeRef.current,
          equipoCodigo: result,
          hora: new Date().toLocaleString(),
        });
        scanner.clear();
        navigate('/');
      }
    };

    const error = (err) => {
      console.warn(err);
    };

    scanner.render(success, error);

    return () => {
      scanner.clear().catch(error => {
        console.error("Fallo al detener el escáner al desmontar:", error);
      });
    };
  }, [addScannedItem, navigate]);

  return (
    <div className="CodeQR" style={{ textAlign: 'center', margin: '20px' }}>
      <h1>Scaneo de QR</h1>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Escanea primero a la persona y luego el equipo.</p>
        <p style={{ marginTop: '10px', color: 'gray' }}>Paso actual: <strong>{scanStep === 'persona' ? 'Persona' : 'Equipo'}</strong></p>
        <p style={{ margin: '5px 0' }}><strong>Persona:</strong> {personaCode || 'Pendiente'}</p>
        <p style={{ margin: '5px 0' }}><strong>Equipo:</strong> {equipoCode || 'Pendiente'}</p>
      </div>
      {
        scanResult
          ? (
            <div>
              <h2>¡Escaneo Exitoso!</h2>
              <p>Código detectado: <strong>{scanResult}</strong></p>
              <a href={"http://" + scanResult} target="_blank" rel="noopener noreferrer">Ir a URL</a>
            </div>
          )
          : <div id="reader" style={{ width: '400px', margin: 'auto' }}></div>
      }
    </div>
  );
}

export default ScannerQR;
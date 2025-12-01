import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';

function ScannerQR({ addScannedItem }) {

  const [scanStep, setScanStep] = useState('persona');
  const [scanResult, setScanResult] = useState(null);

  const personaCodeRef = useRef('');
  const equipoCodeRef = useRef('');

  const [personaCode, setPersonaCode] = useState('');
  const [equipoCode, setEquipoCode] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    personaCodeRef.current = '';
    equipoCodeRef.current = '';

    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 300, height: 300 },
      fps: 10,
      disableFlip: true,
      aspectRatio: 1.0,
      videoConstraints: { facingMode: "environment" }
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

    const error = (err) => console.warn(err);

    scanner.render(success, error);

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [addScannedItem, navigate]);

  return (
    <div style={{ padding: "25px", textAlign: "center" }}>

      <style>{`
        body {
          margin: 0;
          padding: 0;
          background: #000000;
        }

        :root {
          font-family: 'Cambria', Cochin, Georgia, Times, 'Times New Roman', serif;
          color-scheme: light dark;
          --primary: steelblue;
          --primary-light: lightsteelblue;
        }

        h1 { margin-top: 20px; margin-bottom: 25px; }
        .info-text { margin: 15px 0; font-size: 20px; font-weight: bold; }
        .step-text { margin: 20px 0 25px; }
        .scanned-box p { margin: 12px 0; font-size: 18px; }
        .helper-text { margin-top: 25px; opacity: 0.8; }

        @media (prefers-color-scheme: light) {
          body { background: #f4f4f4; }
          h1 { color: var(--primary); }
        }

        @media (prefers-color-scheme: dark) {
          body { background: #1f1f1f; }
          h1 { color: var(--primary-light); }
        }
      `}</style>

      <button
        style={{
          backgroundColor: 'gray',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '9999px',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '25px'
        }}
        onClick={() => navigate('/')}
      >
        ← volver
      </button>

      <h1>Scaneo de QR</h1>

      <p className="info-text">
        Escanea primero a la persona y luego el equipo.
      </p>

      <p className="step-text">
        Paso actual: <strong>{scanStep === 'persona' ? 'Persona' : 'Equipo'}</strong>
      </p>

      <div className="scanned-box">
        <p><strong>Persona:</strong> {personaCode || 'Pendiente'}</p>
        <p><strong>Equipo:</strong> {equipoCode || 'Pendiente'}</p>
      </div>

      {scanResult ? (
        <>
          <h2 style={{ marginTop: "30px" }}>¡Escaneo Exitoso!</h2>
          <p><strong>{scanResult}</strong></p>
        </>
      ) : (
        <div id="reader" style={{ width: '350px', margin: '30px auto' }}></div>
      )}

      <p className="helper-text">(Apunta la cámara al QR)</p>
    </div>
  );
}

export default ScannerQR;

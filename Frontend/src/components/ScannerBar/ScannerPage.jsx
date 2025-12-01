import React, { useRef, useState } from 'react';
import { useBarcodeScanner } from './useBarcodeScanner.js';
import { useNavigate } from 'react-router-dom';

function ScannerPage({ addScannedItem }) {

  const [scanStep, setScanStep] = useState('persona');
  const [scanResult, setScanResult] = useState(null);

  const personaCodeRef = useRef('');
  const equipoCodeRef = useRef('');

  const [personaCode, setPersonaCode] = useState('');
  const [equipoCode, setEquipoCode] = useState('');
  const [lastScanned, setLastScanned] = useState("Esperando...");

  const navigate = useNavigate();

  useBarcodeScanner({
    onScan: (code) => {
      setLastScanned(code);

      if (!personaCodeRef.current) {
        personaCodeRef.current = code;
        setPersonaCode(code);
        setScanStep("equipo");
        return;
      }

      if (!equipoCodeRef.current) {
        equipoCodeRef.current = code;
        setEquipoCode(code);
        setScanResult(code);

        addScannedItem({
          personaCodigo: personaCodeRef.current,
          equipoCodigo: code,
          hora: new Date().toLocaleString(),
        });

        navigate('/');
      }
    }
  });

  const resetScan = () => {
    personaCodeRef.current = "";
    equipoCodeRef.current = "";
    setPersonaCode("");
    setEquipoCode("");
    setScanResult(null);
    setLastScanned("Esperando...");
    setScanStep("persona");
  };

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
          --text-muted: #888;
        }

        h1 { margin-top: 20px; margin-bottom: 25px; }

        .info-text { margin: 15px 0; font-size: 20px; font-weight: bold; }

        .step-text { margin: 20px 0; }

        .scanned-box p { margin: 12px 0; font-size: 18px; }

        .detected { margin-top: 30px; font-size: 22px; }

        .helper-text { margin-top: 25px; opacity: 0.8; }

        .scan-reset-btn {
          margin-top: 25px;
          padding: 12px 22px;
          font-size: 17px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.2s;
        }

        @media (prefers-color-scheme: light) {
          body { background: #f4f4f4; }
          h1 { color: var(--primary); }
          .scan-reset-btn { background: var(--primary-light); }
          .scan-reset-btn:hover { background: var(--primary); color: white; }
        }

        @media (prefers-color-scheme: dark) {
          body { background: #1f1f1f; }
          h1 { color: var(--primary-light); }
          .scan-reset-btn { background: var(--primary); color: white; }
          .scan-reset-btn:hover { background: var(--primary-light); }
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

      <h1>Escaneo por Pistola</h1>

      <p className="info-text">
        Escanea primero al profesor y luego el equipo.
      </p>

      <p className="step-text">
        Paso actual: <strong>{scanStep === 'persona' ? 'Persona' : 'Equipo'}</strong>
      </p>

      <div className="scanned-box">
        <p><strong>Profesor:</strong> {personaCode || 'Pendiente'}</p>
        <p><strong>Equipo:</strong> {equipoCode || 'Pendiente'}</p>
      </div>

      {scanResult ? (
        <>
          <h2 style={{ marginTop: "30px" }}>¡Escaneo Exitoso!</h2>
          <p><strong>{scanResult}</strong></p>
          <button className="scan-reset-btn" onClick={resetScan}>Nuevo Escaneo</button>
        </>
      ) : (
        <>
          <p className="detected">Último detectado: {lastScanned}</p>

          <button className="scan-reset-btn" onClick={resetScan}>
            Reiniciar escaneo
          </button>
        </>
      )}

      <p className="helper-text">(Usa la pistola USB o escribe rápido + Enter)</p>
    </div>
  );
}

export default ScannerPage;

import React, { useRef, useState } from 'react';
import { useBarcodeScanner } from './useBarcodeScanner.js';
import { useNavigate } from 'react-router-dom';

function ScannerPage({ addScannedItem }) {

  const [scannedCode, setScannedCode] = useState("Esperando...");
  const personaCodeRef = useRef('');
  const equipoCodeRef = useRef('');
  const [personaCode, setPersonaCode] = useState('');
  const [equipoCode, setEquipoCode] = useState('');
  const [scanStep, setScanStep] = useState('persona');
  const navigate = useNavigate();

  useBarcodeScanner({
    onScan: (code) => {
      setScannedCode(code);

      if (scanStep === 'persona') {
        personaCodeRef.current = code;
        setPersonaCode(code);
        setScanStep('equipo');
        return;
      }

      equipoCodeRef.current = code;
      setEquipoCode(code);

      addScannedItem({
        personaCodigo: personaCodeRef.current,
        equipoCodigo: code,
        hora: new Date().toLocaleString(),
      });

      resetScan();
      navigate('/');
    }
  });

  const resetScan = () => {
    personaCodeRef.current = '';
    equipoCodeRef.current = '';
    setPersonaCode('');
    setEquipoCode('');
    setScannedCode('Esperando...');
    setScanStep('persona');
  };

  return (
    <div className="scanner-page">

      <style>{`
        :root {
          font-family: 'Cambria', Cochin, Georgia, Times, 'Times New Roman', serif;
        }

        body {
          margin: 0;
          padding: 0;
          background: #000000;
        }

        .scanner-page {
          text-align: center;
          margin-top: 30px;
        }

        .volver-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(51, 51, 51, 0.85);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          margin: 0 auto 25px auto;
          transition: 0.2s;
        }

        .volver-btn:hover {
          background: rgba(70, 70, 70, 0.9);
        }

        h1 {
          color: steelblue;
          margin-bottom: 20px;
        }

        .info-text {
          font-size: 18px;
          font-weight: bold;
        }

        .scan-step-box {
          margin: 20px auto;
          padding: 10px 20px;
          background: #f0f0f0;
          border-radius: 8px;
          display: inline-block;
        }

        .scan-step-box strong {
          color: steelblue;
        }

        .label {
          font-weight: bold;
          color: steelblue;
        }

        .data-lines {
          margin-top: 25px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          font-size: 18px;
        }

        .reset-btn {
          margin-top: 25px;
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          background-color: lightsteelblue;
          color: #213547;
          cursor: pointer;
          transition: 0.2s;
        }

        .reset-btn:hover {
          background-color: steelblue;
          color: white;
        }

        .helper-text {
          color: #777;
          margin-top: 25px;
          font-size: 14px;
        }

        @media (prefers-color-scheme: dark) {

          body {
            background-color: #1f1f1f;
            color: #f5f5f5;
          }

          .volver-btn {
            background: rgba(200, 200, 200, 0.15);
            color: white;
          }

          .volver-btn:hover {
            background: rgba(220, 220, 220, 0.25);
          }

          h1 {
            color: lightsteelblue;
          }

          .scan-step-box {
            background: #333;
            color: white;
          }

          .label {
            color: lightsteelblue;
          }

          .reset-btn {
            background-color: steelblue;
            color: white;
          }

          .reset-btn:hover {
            background-color: lightsteelblue;
            color: #213547;
          }

          .helper-text {
            color: #ccc;
          }
        }
      `}</style>

      <button className="volver-btn" onClick={() => navigate('/')}>
        <FaArrowLeft /> Volver al Menú
      </button>

      <h1>Escaneo de Código de Barras</h1>

      <p className="info-text">Escanea primero el código del profesor y luego el del equipo.</p>

      <div className="scan-step-box">
        Escaneando: <strong>{scanStep === 'persona' ? '👤 PROFESOR' : '💻 EQUIPO'}</strong>
      </div>

      <div className="data-lines">
        <p><span className="label">Profesor:</span> {personaCode || 'Pendiente'}</p>
        <p><span className="label">Equipo:</span> {equipoCode || 'Pendiente'}</p>
      </div>

      <button className="reset-btn" onClick={resetScan}>
        Reiniciar escaneo
      </button>

      <p className="helper-text">(Usa la pistola USB o escribe rápido y presiona Enter)</p>
    </div>
  );
}

export default ScannerPage;

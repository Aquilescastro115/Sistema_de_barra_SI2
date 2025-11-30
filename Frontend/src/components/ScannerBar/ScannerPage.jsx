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
      console.log("Escaneado:", code);
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
      <div>
        <style>{`
          :root {
            --primary: steelblue;
            --text-dark: #333;
            --text-muted: #666;
            --card-bg: #ffffff;
            --radius: 12px;
            --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }

          body, html {
            margin: 0;
            padding: 0;
          }

          .scanner-container {
            max-width: 580px;
            margin: 60px auto;
            padding: 40px;
            text-align: center;
            background: var(--card-bg);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
          }

          .scanner-container h1 {
            margin-bottom: 28px;
            color: var(--primary);
            font-size: 30px;
          }

          .info-text {
            font-weight: bold;
            margin-bottom: 20px;
            line-height: 1.5;
            font-size: 19px;
          }

          .step-text {
            margin-top: 10px;
            margin-bottom: 28px;
            font-size: 18px;
            color: var(--text-muted);
          }

          .scanned-box {
            margin-bottom: 28px;
          }

          .scanned-box p {
            margin: 10px 0;
            font-size: 18px;
          }

          .label {
            font-weight: bold;
            color: var(--primary);
          }

          .scan-reset-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 12px 22px;
            cursor: pointer;
            font-size: 16px;
            border-radius: var(--radius);
            transition: 0.2s;
            margin-bottom: 20px;
          }

          .scan-reset-btn:hover {
            background: #3b6f99;
          }

          .detected {
            font-size: 22px;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 5px;
            color: var(--text-dark);
          }

          .helper-text {
            font-size: 13px;
            color: var(--text-muted);
          }
      `}</style>


      <div className="scanner-container">
        <h1>Página de Escaneo</h1>

        <div>
          <p className="info-text">Escanea primero el código del profesor <br></br> y luego el equipo.</p>
          <p className="step-text">Paso actual: <strong>{scanStep === 'persona' ? 'Persona' : 'Equipo'}</strong></p>
        </div>

        <div className="scanned-box">
          <p><span className="label">Profesor:</span> {personaCode || 'Pendiente'}</p>
          <p><span className="label">Equipo:</span> {equipoCode || 'Pendiente'}</p>
        </div>

        <button className="scan-reset-btn" onClick={resetScan}>
          Reiniciar escaneo
        </button>

        <p className="detected">
          Producto detectado: {scannedCode}
        </p> <br></br>

        <p className="helper-text">
          (Usa la pistola USB o escribe rápido y presiona Enter)
        </p>
      </div>
    </div>
  );
}

export default ScannerPage;

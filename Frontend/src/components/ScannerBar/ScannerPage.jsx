import React, { useRef, useState } from 'react';
import { useBarcodeScanner } from './useBarcodeScanner.js';
import { FaArrowLeft } from "react-icons/fa";
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
            font-family: 'Cambria', Cochin, Georgia, Times, Times New Roman, serif;
            line-height: 1.5;
            font-weight: 400;
            color-scheme: light dark;
            font-synthesis: none;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;

            --primary: steelblue;
            --primary-light: lightsteelblue;
            --text-dark: #333;
            --text-muted: #666;
            --radius: 12px;
          }

          body, html {
            margin: 0;
            padding: 0;
          }

          .scanner-container {
            max-width: 600px;
            margin: 60px auto;
            padding: 40px;
            text-align: center;
            border-radius: 12px;
          }

          .scanner-container h1 {
            margin-bottom: 30px;
            font-size: 32px;
          }

          .info-text {
            font-weight: bold;
            margin-bottom: 20px;
            line-height: 1.5;
            font-size: 20px;
          }

          .step-text {
            margin-top: 10px;
            margin-bottom: 25px;
            font-size: 18px;
          }

          .scanned-box {
            margin-bottom: 25px;
          }

          .scanned-box p {
            margin: 10px 0;
            font-size: 18px;
          }

          .label {
            font-weight: bold;
          }

          .scan-reset-btn {
            border: none;
            padding: 12px 22px;
            cursor: pointer;
            font-size: 17px;
            border-radius: 12px;
            transition: 0.2s;
            margin-bottom: 18px;
          }

          .detected {
            font-size: 22px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 5px;
          }

          .helper-text {
            font-size: 13px;
          }

          @media (prefers-color-scheme: light) {
            body {
              background-color: #f4f4f4;
            }

            .scanner-container {
              background-color: white;
              color: #333;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }

            h1 {
              color: var(--primary);
            }

            .label {
              color: var(--primary);
            }

            .scan-reset-btn {
              background-color: var(--primary-light);
              color: #213547;
            }

            .scan-reset-btn:hover {
              background-color: var(--primary);
              color: white;
            }
          }

          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1f1f1f;
            }

            .scanner-container {
              background-color: #2a2a2a;
              color: #f5f5f5;
              box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            }

            h1 {
              color: var(--primary-light);
            }

            .label {
              color: var(--primary-light);
            }

            .scan-reset-btn {
              background-color: var(--primary);
              color: white;
            }

            .scan-reset-btn:hover {
              background-color: var(--primary-light);
              color: white;
            }

            .helper-text {
              color: #ccc;
            }
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

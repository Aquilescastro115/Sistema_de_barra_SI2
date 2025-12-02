import React, { useRef, useState } from 'react';
import { useBarcodeScanner } from './useBarcodeScanner.js';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

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
    <div>
      <style>{`
        :root {
          font-family: 'Cambria', Cochin, Georgia, Times, Times New Roman, serif;
          --primary: steelblue;
          --text-muted: #666;
        }
        .scanner-container {
          max-width: 600px;
          margin: 40px auto;
          padding: 30px;
          text-align: center;
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(5px);
          border-radius: 15px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        h1 { 
          font-size: 32px; 
          margin-bottom: 25px; 
          color: var(--primary); 
          font-weight: bold;
        }

        .volver-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #333;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          margin: 0 auto 20px auto;
          transition: transform 0.2s;
        }
        
        .volver-btn:hover {
            background: #555;
            transform: scale(1.05);
        }

        .info-text { 
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          line-height: 1.4;
          color: #333;
        }

        .step-text {
          margin: 10px 0 20px;
          font-size: 16px;
          color: var(--text-muted);
        }
        .scanned-box {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
            text-align: left;
        }

        .scanned-box p {
          margin: 8px 0;
          font-size: 16px;
          color: #333;
          border-bottom: 1px dashed #ccc;
          padding-bottom: 5px;
        }

        .label { 
            font-weight: bold; 
            color: var(--primary); 
            display: inline-block;
            width: 80px;
        }

        .detected {
          margin-top: 15px;
          font-size: 18px;
          font-weight: bold;
          color: #28a745;
        }

        .scan-reset-btn {
          margin-top: 20px;
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          background-color: lightsteelblue;
          color: #213547;
          cursor: pointer;
          transition: 0.2s;
          font-weight: bold;
        }

        .scan-reset-btn:hover {
          background-color: steelblue;
          color: white;
        }

        .helper-text { 
            font-size: 13px; 
            margin-top: 20px; 
            color: #777; 
        }
      `}</style>

      <div className="scanner-container">
        
        <button className="volver-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Volver al Menú
        </button>

        <h1>Escaneo de Barras</h1>

        <p className="info-text">
          Escanea primero al profesor y luego el equipo.
        </p>

        <p className="step-text">
          Paso actual: <strong>{scanStep === 'persona' ? '👤 Persona' : '💻 Equipo'}</strong>
        </p>

        <div className="scanned-box">
          <p><span className="label">Persona:</span> {personaCode || 'Pendiente'}</p>
          <p><span className="label">Equipo:</span> {equipoCode || 'Pendiente'}</p>
        </div>

        {scanResult ? (
          <>
            <h2>¡Escaneo Exitoso!</h2>
            <p className="detected">{scanResult}</p>
            <button className="scan-reset-btn" onClick={resetScan}>Nuevo Escaneo</button>
          </>
        ) : (
          <>
            <p className="detected">
              Último detectado: {lastScanned !== "Esperando..." ? lastScanned : "..."}
            </p>

            <button className="scan-reset-btn" onClick={resetScan}>
              Reiniciar escaneo
            </button>
          </>
        )}

        <p className="helper-text">(Usa la pistola USB o escribe rápido + Enter)</p>
      </div>

    </div>
  );
}

export default ScannerPage;

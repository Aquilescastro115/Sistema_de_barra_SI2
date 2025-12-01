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
    <div>

      <style>{`
        :root {
          font-family: 'Cambria', Cochin, Georgia, Times, Times New Roman, serif;
          color-scheme: light dark;
          --primary: steelblue;
          --primary-light: lightsteelblue;
          --text-muted: #666;
        }

        body {
          margin: 0;
          padding: 0;
          background: #000000;
        }

        .scanner-container {
          max-width: 600px;
          margin: 50px auto;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
        }

        h1 { font-size: 32px; margin-bottom: 25px; }

        .info-text { 
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          line-height: 1.5;
        }

        .step-text {
          margin: 10px 0 20px;
          font-size: 18px;
          color: var(--text-muted);
        }

        .scanned-box p {
          margin: 8px 0;
          font-size: 18px;
        }

        .label { font-weight: bold; }

        .scan-reset-btn {
          margin-top: 20px;
          padding: 12px 22px;
          font-size: 17px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.2s;
        }

        .detected {
          margin-top: 25px;
          font-size: 22px;
          font-weight: bold;
        }

        .helper-text { font-size: 13px; margin-top: 5px; }

        @media (prefers-color-scheme: light) {
          body { background: #f4f4f4; }
          .scanner-container {
            background: white;
            color: #333;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          h1 { color: var(--primary); }
          .label { color: var(--primary); }
          .scan-reset-btn { background: var(--primary-light); color: #213547; }
          .scan-reset-btn:hover { background: var(--primary); color: white; }
        }

        @media (prefers-color-scheme: dark) {
          body { background: #1f1f1f; }
          .scanner-container {
            background: #2a2a2a;
            color: #f5f5f5;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          }
          h1 { color: var(--primary-light); }
          .label { color: var(--primary-light); }
          .scan-reset-btn { background: var(--primary); color: white; }
          .scan-reset-btn:hover { background: var(--primary-light); color: white; }
        }
      `}</style>


      <div className="scanner-container">
        <h1>Scaneo de QR</h1>

        <p className="info-text">
          Escanea primero a la persona<br/>y luego el equipo.
        </p>

        <p className="step-text">
          Paso actual: <strong>{scanStep === 'persona' ? 'Persona' : 'Equipo'}</strong>
        </p>

        <div className="scanned-box">
          <p><span className="label">Persona:</span> {personaCode || 'Pendiente'}</p>
          <p><span className="label">Equipo:</span> {equipoCode || 'Pendiente'}</p>
        </div>

        {
          scanResult ? (
            <>
              <h2>¡Escaneo Exitoso!</h2>
              <p>Código: <strong>{scanResult}</strong></p>
            </>
          ) : (
            <div id="reader" style={{ width: '350px', margin: 'auto' }}></div>
          )
        }

        <p className="helper-text">(Apunta la cámara al QR)</p>
      </div>

    </div>
  );
}

export default ScannerQR;

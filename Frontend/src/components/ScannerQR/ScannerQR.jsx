import React, { useEffect, useState, useRef } from 'react'; 
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

function ScannerQR({ addScannedItem }) {

  const [scanStep, setScanStep] = useState('persona');
  const [scanResult, setScanResult] = useState(null);

  const personaCodeRef = useRef(null);
  const equipoCodeRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
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

      if (!personaCodeRef.current) {
        personaCodeRef.current = result;
        setScanStep('equipo');
        alert("Persona detectada. Ahora escanea el Equipo.");
        return;
      }

      if (!equipoCodeRef.current && result !== personaCodeRef.current) {
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

    const error = () => {};

    scanner.render(success, error);

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [addScannedItem, navigate]);

  return (
    <div className="scannerQR-page">

      <style>{`
        :root {
          font-family: 'Cambria', Cochin, Georgia, Times, 'Times New Roman', serif;
        }

        body {
          margin: 0;
          padding: 0;
        }

        .scannerQR-page {
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

        .success-box {
          margin-top: 30px;
          font-size: 20px;
          font-weight: bold;
          color: steelblue;
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

          .scan-step-box strong {
            color: lightsteelblue;
          }

          .success-box {
            color: lightsteelblue;
          }

          .helper-text {
            color: #ccc;
          }
        }
      `}</style>

      <button className="volver-btn" onClick={() => navigate('/')}>
        <FaArrowLeft /> Volver al Menú
      </button>

      <h1>Escaneo de QR</h1>

      <div className="scan-step-box">
        Escaneando: <strong>{scanStep === 'persona' ? '👤 PROFESOR' : '💻 EQUIPO'}</strong>
      </div>

      {scanResult ? (
        <div className="success-box">
          ¡Escaneo Exitoso! <br />
          Datos guardados correctamente.
        </div>
      ) : (
        <div id="reader" style={{ width: "100%", maxWidth: "500px", margin: "auto" }}></div>
      )}

      <p className="helper-text">
        (Apunta la cámara al QR del {scanStep === 'persona' ? 'Profesor' : 'Equipo'})
      </p>

    </div>
  );
}

export default ScannerQR;

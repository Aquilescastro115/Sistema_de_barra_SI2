import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

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
          --primary: steelblue;
          --text-muted: #666;
        }

        .scanner-container {
          max-width: 500px;
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
          font-size: 28px; 
          margin-bottom: 20px; 
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

        /* Caja gris para los datos escaneados */
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

        .scanned-box p:last-child {
            border-bottom: none;
        }

        .label { 
            font-weight: bold; 
            color: var(--primary); 
            display: inline-block;
            width: 80px;
        }

        .helper-text { 
            font-size: 13px; 
            margin-top: 15px; 
            color: #777; 
        }

        /* Ajuste para el cuadro de la cámara */
        #reader {
            border-radius: 10px;
            overflow: hidden;
            border: none !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        #reader__dashboard_section_csr button {
            background: steelblue !important;
            color: white !important;
            border: none !important;
            padding: 5px 10px;
            border-radius: 5px;
        }
      `}</style>

      {/* CONTENEDOR TIPO TARJETA --- lo volvi a colocar pq se ve mal sin esto */}
      <div className="scanner-container">
        
        <button className="volver-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Volver al Menú
        </button>

        <h1>Escaneo de QR</h1>

        <p className="info-text">
          Escanea primero a la persona<br/>y luego el equipo.
        </p>

        <p className="step-text">
          Paso actual: <strong>{scanStep === 'persona' ? '👤 Persona' : '💻 Equipo'}</strong>
        </p>

        <div className="scanned-box">
          <p><span className="label">Persona:</span> {personaCode || 'Pendiente'}</p>
          <p><span className="label">Equipo:</span> {equipoCode || 'Pendiente'}</p>
        </div>

        {
          scanResult ? (
            <div style={{ padding: '20px', background: '#d4edda', borderRadius: '10px', color: '#155724' }}>
              <h2>¡Escaneo Exitoso!</h2>
              <p>Código: <strong>{scanResult}</strong></p>
            </div>
          ) : (
            /* Aquí se renderiza la cámara */
            <div id="reader" style={{ width: '100%', margin: 'auto' }}></div>
          )
        }

        <p className="helper-text">(Apunta la cámara al código QR)</p>
      </div>

    </div>
  );
}

export default ScannerQR;
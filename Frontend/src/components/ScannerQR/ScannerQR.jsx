import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";

function ScannerQR() {
    const [scanResult, setScanResult] = useState(null);

useEffect(() => {
        const elementId = 'reader';
        const scanner = new Html5QrcodeScanner(elementId, {
            // 💡 AJUSTE 1: Aumentar el área de detección si es necesario (ej: 300x300)
            qrbox: {
                width: 300, 
                height: 300,
            },
            fps: 10,
            // 💡 AJUSTE 2: Deshabilitar el volteo (flip) puede forzar la lectura.
            // Si el QR está en la pantalla o impreso, deshabilítalo.
            disableFlip: true, 
            // 💡 AJUSTE 3: Especificar un aspect ratio puede mejorar el rendimiento.
            aspectRatio: 1.0, 
            // 💡 AJUSTE 4: Intentar forzar el uso de la cámara del entorno (trasera en móviles)
            // Si usas un laptop, puede ayudar a enfocar.
            videoConstraints: {
                facingMode: "environment" 
            }
        });

        const success = (result) => {
            // PROBLEMA 1 (Lectura): Si queremos detener el escaneo después del primer resultado:
            scanner.clear(); // Limpiamos para evitar que siga escaneando
            setScanResult(result);
        };

        const error = (err) => {
            // Mantenemos el error para depuración
            // console.warn(err); 
        };

        // Renderizar el escáner
        scanner.render(success, error);

        // 💡 SOLUCIÓN 2 (Duplicación): Función de limpieza
        // Esto se ejecuta al desmontar el componente (cambiar de página)
        // o antes de que el useEffect se ejecute de nuevo.
        return () => {
            scanner.clear().catch(error => {
                // Esto maneja errores si el escáner ya se detuvo antes (por ejemplo, después de un éxito)
                console.error("Fallo al detener el escáner al desmontar:", error);
            });
        };
    }, []); // Array de dependencias vacío para que se ejecute solo al montar y desmontar

    return (
        <div className="CodeQR" style={{ textAlign: 'center', margin: '20px' }}>
            <h1>Scaneo de QR</h1>
            {
                scanResult
                ? (
                    <div>
                        <h2>¡Escaneo Exitoso!</h2>
                        <p>Código detectado: <strong>{scanResult}</strong></p>
                        <a href={"http://" + scanResult} target="_blank" rel="noopener noreferrer">Ir a URL</a>
                    </div>
                )
                // 💡 Asegúrate de tener el div con el ID 'reader' disponible
                : <div id="reader" style={{ width: '400px', margin: 'auto' }}></div> 
            }
        </div>
    );
}

export default ScannerQR;
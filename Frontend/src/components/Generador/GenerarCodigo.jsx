import { useState } from "react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBarcode, FaQrcode, FaSave, FaFilePdf } from "react-icons/fa";

export default function GenerarCodigo() {
    const [codigo, setCodigo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [tipoEquipo, setTipoEquipo] = useState("");
    const [tipo, setTipo] = useState("barcode"); // Por defecto Barcode (Equipo)
    const [imagen, setImagen] = useState(null);

    const navigate = useNavigate();

    // Generar QR o código de barras
    const generar = async (e) => {
        e.preventDefault(); // Evitar recarga si está dentro de form
        if (!codigo) return alert("Debes ingresar un código.");

        if (tipo === "qr") {
            try {
                // Generar QR
                const dataURL = await QRCode.toDataURL(String(codigo), { width: 300, margin: 2 });
                setImagen(dataURL);
            } catch (err) {
                alert("Error generando QR: " + err.message);
            }
        } else {
            try {
                // Generar Código de Barras (CODE128 soporta guiones y letras)
                const canvas = document.createElement("canvas");
                JsBarcode(canvas, String(codigo), { 
                    format: "CODE128", 
                    width: 2, 
                    height: 60,
                    displayValue: true // Muestra el texto debajo de la barra
                });
                const dataURL = canvas.toDataURL("image/png");
                setImagen(dataURL);
            } catch (err) {
                alert("Error generando código de barras. Intenta usar menos caracteres o solo letras/números.");
            }
        }
    };

    // Guardar en la base de datos
    const guardarEnDB = async () => {
        if (!codigo) return alert("Debes ingresar un código.");
        if (!tipoEquipo) return alert("Debes ingresar el tipo de equipo.");

        // OJO: Si tu DB espera un INT en Codigo_qr, esto fallará si mandas letras.
        // Si solo usas números, funcionará perfecto.
        const payload = {
            Codigo_qr: codigo, // Enviamos como string por si acaso, el backend intentará convertirlo
            Tipo_equipo: tipoEquipo,
            Descripcion: descripcion || "Sin descripción",
            Estado: "Disponible"
        };

        try {
            const resp = await fetch("http://localhost:5000/api/equipos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await resp.json();

            if (resp.ok) {
                alert("✅ Equipo guardado correctamente en la Base de Datos");
            } else {
                alert("❌ Error del servidor: " + (data.error || "Desconocido"));
            }
        } catch (err) {
            console.error(err);
            alert("❌ Error de conexión con el servidor");
        }
    };

    // Descargar PDF
    const descargarPDF = () => {
        if (!imagen) return alert("Primero genera el código");

        const pdf = new jsPDF();
        pdf.setFontSize(18);
        pdf.text("Etiqueta de Inventario", 105, 20, null, null, "center");
        
        pdf.setFontSize(12);
        pdf.text(`Tipo: ${tipoEquipo || 'Equipo'}`, 105, 35, null, null, "center");
        pdf.text(`Descripción: ${descripcion || '---'}`, 105, 45, null, null, "center");

        // Centrar imagen
        const imgWidth = 150;
        const imgHeight = 60;
        const xPos = (210 - imgWidth) / 2; // 210 es el ancho A4

        pdf.addImage(imagen, "PNG", xPos, 60, imgWidth, imgHeight);
        
        pdf.setFontSize(10);
        pdf.text(String(codigo), 105, 130, null, null, "center");

        pdf.save(`codigo_${codigo}.pdf`);
    };

    return (
        <div>
            <style>{`
                .generator-container {
                    max-width: 500px;
                    margin: 40px auto;
                    padding: 30px;
                    background-color: white;
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    color: #333;
                    text-align: left;
                }
                .header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #333;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 14px;
                }
                h2 {
                    text-align: center;
                    color: steelblue;
                    margin-bottom: 20px;
                }
                .input-group {
                    margin-bottom: 15px;
                }
                .input-group label {
                    display: block;
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #555;
                }
                .input-field {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    font-size: 16px;
                    box-sizing: border-box;
                }
                .type-selector {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .type-btn {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-weight: bold;
                }
                .btn-primary {
                    width: 100%;
                    padding: 12px;
                    background-color: steelblue;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .btn-primary:hover { background-color: #36648b; }
                
                .actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                }
                .action-btn {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                }
                .pdf-btn { background-color: #6c757d; }
                .save-btn { background-color: #28a745; }
                
                .result-area {
                    margin-top: 25px;
                    text-align: center;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border: 1px dashed #ccc;
                }
                .result-img {
                    max-width: 100%;
                    height: auto;
                    background: white;
                    padding: 10px;
                    border-radius: 5px;
                }
            `}</style>

            <div className="generator-container">
                <div className="header-row">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <FaArrowLeft /> Volver
                    </button>
                    <h3 style={{ margin: 0, color: '#555' }}>Generar Etiquetas</h3>
                </div>

                <div className="type-selector">
                    <button 
                        className="type-btn"
                        style={{ background: tipo === 'barcode' ? 'steelblue' : '#eee', color: tipo === 'barcode' ? 'white' : '#333' }}
                        onClick={() => setTipo('barcode')}
                    >
                        <FaBarcode /> Código Barra
                    </button>
                    <button 
                        className="type-btn"
                        style={{ background: tipo === 'qr' ? 'steelblue' : '#eee', color: tipo === 'qr' ? 'white' : '#333' }}
                        onClick={() => setTipo('qr')}
                    >
                        <FaQrcode /> Código QR
                    </button>
                </div>

                <div className="input-group">
                    <label>Código {tipo === 'barcode' ? '(Permite guiones)' : '(Rut o ID)'}</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder={tipo === 'barcode' ? "Ej: PC-2002-A" : "Ej: 12345678-9"}
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>Tipo de Equipo</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Ej: Notebook"
                        value={tipoEquipo}
                        onChange={(e) => setTipoEquipo(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>Descripción (Opcional)</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Ej: Lenovo T480 - Sala 5"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>

                <button className="btn-primary" onClick={generar}>
                    Generar Imagen
                </button>

                {imagen && (
                    <div className="result-area">
                        <img src={imagen} alt="Código generado" className="result-img" />
                        
                        <div className="actions">
                            <button className="action-btn pdf-btn" onClick={descargarPDF}>
                                <FaFilePdf /> Descargar PDF
                            </button>
                            <button className="action-btn save-btn" onClick={guardarEnDB}>
                                <FaSave /> Guardar en DB
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
import { useState } from "react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function GenerarCodigo() {
    const [codigo, setCodigo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [tipoEquipo, setTipoEquipo] = useState("");
    const [tipo, setTipo] = useState("qr"); // tipo de código (qr o barcode)
    const [imagen, setImagen] = useState(null);

    const navigate = useNavigate();

    // Generar QR o código de barras
    const generar = async () => {
        if (!codigo) return alert("Debes ingresar un código numérico.");
        if (isNaN(Number(codigo))) return alert("El código debe ser numérico.");

        if (tipo === "qr") {
            const dataURL = await QRCode.toDataURL(String(codigo), { width: 300 });
            setImagen(dataURL);
        } else {
            try {
                const canvas = document.createElement("canvas");
                JsBarcode(canvas, String(codigo), { format: "CODE128", width: 2, height: 60 });
                const dataURL = canvas.toDataURL("image/png");
                setImagen(dataURL);
            } catch (err) {
                alert("Error generando código de barras: " + err.message);
            }
        }
    };

    // Guardar en la base de datos
    const guardarEnDB = async () => {
        if (!codigo) return alert("Debes ingresar un código.");
        if (isNaN(Number(codigo))) return alert("El código debe ser numérico.");
        if (!tipoEquipo) return alert("Debes ingresar el tipo de equipo.");

        const payload = {
            Codigo_qr: Number(codigo),
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
                alert("Equipo guardado correctamente");
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Error de conexión con el servidor");
        }
    };

    // Descargar PDF
    const descargarPDF = () => {
        if (!imagen) return alert("Primero genera el código");

        const pdf = new jsPDF();
        pdf.text("Código generado:", 10, 10);
        pdf.addImage(imagen, "PNG", 10, 20, 150, 80);
        pdf.save("codigo_generado.pdf");
    };

   return (
        <div>
            <style>{`
                .generator-container {
                    max-width: 500px;
                    margin: 40px auto;
                    padding: 30px;
                    background-color: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                    color: #333;
                    text-align: left;
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
                    margin-bottom: 20px;
                    width: fit-content;
                }

                h2 {
                    text-align: center;
                    color: steelblue;
                    margin-bottom: 25px;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 10px;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                .form-group label {
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
                    box-sizing: border-box; /* Para que el padding no rompa el ancho */
                }

                .input-field:focus {
                    outline: none;
                    border-color: steelblue;
                    box-shadow: 0 0 5px rgba(70, 130, 180, 0.3);
                }

                .btn {
                    width: 100%;
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: 0.2s;
                    margin-top: 10px;
                }

                .btn-primary {
                    background-color: steelblue;
                    color: white;
                }
                .btn-primary:hover { background-color: #36648b; }

                .btn-secondary {
                    background-color: #6c757d;
                    color: white;
                }
                .btn-secondary:hover { background-color: #5a6268; }

                .btn-success {
                    background-color: #28a745; /* Verde estándar */
                    color: white;
                }
                .btn-success:hover { background-color: #218838; }

                .result-area {
                    margin-top: 25px;
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }

                .result-img {
                    max-width: 100%;
                    border: 1px solid #ddd;
                    padding: 10px;
                    border-radius: 8px;
                    background: white;
                }
            `}</style>

            <div className="generator-container">
                <button className="back-btn" onClick={() => navigate('/')}>
                    <FaArrowLeft /> Volver
                </button>

                <h2>Generador de Códigos</h2>

                <div className="form-group">
                    <label>Código numérico</label>
                    <input
                        type="number"
                        className="input-field"
                        placeholder="Ej: 12345"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Descripción</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Ej: Proyector Epson"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Tipo de equipo</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Ej: Computador"
                        value={tipoEquipo}
                        onChange={(e) => setTipoEquipo(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Formato</label>
                    <select 
                        className="input-field"
                        value={tipo} 
                        onChange={(e) => setTipo(e.target.value)}
                    >
                        <option value="qr">Código QR</option>
                        <option value="barcode">Código de Barras</option>
                    </select>
                </div>

                <button className="btn btn-primary" onClick={generar}>
                    Generar Código
                </button>

                {imagen && (
                    <div className="result-area">
                        <img src={imagen} alt="Código generado" className="result-img" />
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <button className="btn btn-secondary" onClick={descargarPDF}>
                                📥 PDF
                            </button>
                            <button className="btn btn-success" onClick={guardarEnDB}>
                                💾 Guardar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
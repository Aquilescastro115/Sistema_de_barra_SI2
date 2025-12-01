import { useState } from "react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

export default function GenerarCodigo() {
    const [codigo, setCodigo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [tipoEquipo, setTipoEquipo] = useState("");
    const [tipo, setTipo] = useState("qr"); // tipo de código (qr o barcode)
    const [imagen, setImagen] = useState(null);

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
        <div style={{ padding: "20px", color: "white" }}>
            <h2>Generar Código (QR o Código de Barras)</h2>

            <div style={{ marginBottom: "10px" }}>
                <label>Código numérico: </label>
                <input
                    type="number"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    style={{ padding: "5px", width: "250px" }}
                />
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label>Descripción: </label>
                <input
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    style={{ padding: "5px", width: "250px" }}
                />
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label>Tipo de equipo: </label>
                <input
                    type="text"
                    value={tipoEquipo}
                    onChange={(e) => setTipoEquipo(e.target.value)}
                    style={{ padding: "5px", width: "250px" }}
                />
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label>Tipo de código: </label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                    <option value="qr">Código QR</option>
                    <option value="barcode">Código de Barras</option>
                </select>
            </div>

            <button onClick={generar} style={{ marginRight: "10px" }}>
                Generar
            </button>

            {imagen && (
                <>
                    <div style={{ marginTop: "20px" }}>
                        <img src={imagen} alt="Código generado" />
                    </div>

                    <button 
                        onClick={descargarPDF} 
                        style={{ marginTop: "10px", marginRight: "10px" }}
                    >
                        Descargar PDF
                    </button>

                    <button 
                        onClick={guardarEnDB} 
                        style={{ marginTop: "10px", background: "#2596be", color: "white" }}
                    >
                        Guardar en Base de Datos
                    </button>
                </>
            )}
        </div>
    );
}

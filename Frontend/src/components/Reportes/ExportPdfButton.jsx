// src/components/Reports/ExportPdfButton.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportPdfButton({ columns, data, title }) {
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text(title || "Reporte", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [columns.map(c => c.header)],
      body: data.map(row => columns.map(c => row[c.key])),
    });

    doc.save(`${title || "reporte"}.pdf`);
  };

  return (
    <button onClick={exportPDF}>
      Exportar PDF
    </button>
  );
}

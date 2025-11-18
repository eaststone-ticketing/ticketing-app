const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function DownloadPDFButton({ arendeId }) {
  const downloadPDF = () => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;

    // Open the URL directly — browser downloads automatically
    window.open(
      `${API_URL}/arendepdf/${arendeId}?token=${token}`,
      "_blank"
    );
  };

  return <button onClick={downloadPDF}>Ladda ner PDF</button>;
}

export default DownloadPDFButton;
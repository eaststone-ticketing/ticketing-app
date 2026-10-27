import laggTillTrace from "./laggTillTrace";
import { IoDownloadOutline } from "react-icons/io5";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function DownloadPDFButton({ arende, asType, label = "PDF" }) {
  const downloadPDF = async () => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    try {
      await laggTillTrace("laddade ner PDF", arende)
    } catch (err) {
      console.log(err)
    }

    const params = new URLSearchParams({ token });
    if (asType) {
      params.set("asType", asType);
    }

    // Open the URL directly — browser downloads automatically
    window.open(
      `${API_URL}/arendepdf/${arende.id}?${params.toString()}`,
      "_blank"
    );
  };

  return <button onClick={downloadPDF}>{label} <IoDownloadOutline/> </button>;
}

export default DownloadPDFButton;

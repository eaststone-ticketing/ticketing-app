import laggTillTrace from "./laggTillTrace";
import { IoDownloadOutline } from "react-icons/io5";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function DownloadPDFButton({ arende }) {
  const downloadPDF = async () => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    try {
      await laggTillTrace("laddade ner PDF", arende)
    } catch (err) {
      console.log(err)
    }

    // Open the URL directly — browser downloads automatically
    window.open(
      `${API_URL}/arendepdf/${arende.id}?token=${token}`,
      "_blank"
    );
  };

  return <button onClick={downloadPDF}>PDF <IoDownloadOutline/> </button>;
}

export default DownloadPDFButton;
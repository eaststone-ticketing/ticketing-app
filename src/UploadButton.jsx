import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.8.171:5000";

function UploadButton({ arendeID }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setStatus("Requesting upload URL...");
    
    // Step 1: Ask backend for a presigned URL
    const res = await fetch(`${API_URL}/api/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ arendeID:"1", fileType: file.type })
    });
    if (!res.ok) {
    setStatus("Failed to get upload URL");
    return;
  }
    const { uploadUrl, key } = await res.json();

    setStatus("Uploading...");

    // Step 2: Upload directly to Cloudflare R2
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type
      }
    });

    if (uploadRes.ok) {
      setStatus("Upload successful!");
      console.log("Stored key:", key); // Save key in your DB if needed
    } else {
      setStatus("Upload failed");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{status}</p>
    </div>
  );
}

export default UploadButton;
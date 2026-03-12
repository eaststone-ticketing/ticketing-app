import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.8.171:5000";

async function getToken() {

  const user = localStorage.getItem('user'); 
  let token = user ? JSON.parse(user).token : null; 

  if(!token) return null;
  
  if (isTokenExpired(token)){
        try {
            const res = await fetch(`${API_URL}/refresh-token`, {
                method: 'POST',
                credentials: 'include', // send HTTP-only cookie
            });

            if (!res.ok) {
                console.error('Refresh token failed');
                return null;
            }

            const data = await res.json();
            // Save the new token in localStorage
            localStorage.setItem('user', JSON.stringify({ ...JSON.parse(user), token: data.accessToken }));
            token = data.accessToken;
        } catch (err) {
            console.error('Error refreshing token:', err);
            return null;
        }
  }
  
    return token;
}

function isTokenExpired(token) {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1])); // decode JWT payload
    const now = Date.now() / 1000; // current time in seconds
    return payload.exp < now + 30; // consider it expired if less than 30s left
}

function UploadButton({ arendeID }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const token = getToken()

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setStatus("Requesting upload URL...");
    
    // Step 1: Ask backend for a presigned URL
    const res = await fetch(`${API_URL}/api/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
       },
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
        "Content-Type": file.type,
        "Authorization": `Bearer ${token}`
       },
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
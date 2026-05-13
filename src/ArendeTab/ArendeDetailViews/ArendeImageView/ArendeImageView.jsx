import { useEffect, useState } from "react";
import UploadButton from "../../../UploadButton.jsx";
import { getBilder } from "../../../api.js";
import './ArendeImageView.css'

const R2_URL_PUB =
  "https://pub-b57e1e9dcdfe4d67981fce0351584079.r2.dev";

export default function ArendeImageView({ activeArende }) {
  const [bilder, setBilder] = useState([]);
  const [bildIndex, setBildIndex] = useState(0)

  useEffect(() => {
    async function loadBilder() {
      const data = await getBilder();
      setBilder(data);
    }
    loadBilder();
  }, []);

  const arendeBilder = bilder.filter(
    (bild) => bild.arendeID === activeArende.id
  );

  const [imageWidth, setImageWidth] = useState(200)
  const activeFil = arendeBilder[bildIndex]

  function getFileExtension(key = "") {
    const parts = key.split(".")
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ""
  }

  function renderActiveFile() {
    if (!activeFil) {
      return null
    }

    const fileUrl = `${R2_URL_PUB}/${activeFil.key}`
    const extension = getFileExtension(activeFil.key)

    if (extension === "pdf") {
      return (
        <iframe
          className = "ArendeImageView-pdf"
          src = {fileUrl}
          title = {activeFil.key}
        />
      )
    }

    if (extension === "heic") {
      return (
        <div className = "ArendeImageView-file-card">
          <p>HEIC-fil: {activeFil.key}</p>
          <a href = {fileUrl} target = "_blank" rel = "noreferrer">
            Öppna / ladda ner
          </a>
        </div>
      )
    }

    return (
      <img
        className = "ArendeImageView-image"
        onClick = {() => setImageWidth(imageWidth === 200 ? 500 : 200)}
        src = {fileUrl}
        style = {{ width: `${imageWidth}px`, margin: "10px" }}
      />
    )
  }

  return (
    <div>  
      {arendeBilder.length > 0 && <div>
        <h3>Galleri</h3>
        <div className = "galleri">
          {renderActiveFile()}
          <p>Fil {bildIndex + 1}/{arendeBilder.length}</p>
          <div> 
            <button onClick = {() => {setBildIndex(bildIndex > 0 ? bildIndex - 1 : arendeBilder.length - 1); console.log(bildIndex)}}>←</button>
            <button onClick = {() => {setBildIndex(bildIndex + 1< arendeBilder.length ? bildIndex + 1 : 0); console.log(bildIndex)}}>→</button>
          </div>
          </div>
        </div>}
      <h3>Ladda upp filer</h3>
      <UploadButton arendeID={activeArende.id} />
    </div>
  );
}
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

  return (
    <div>  
      {arendeBilder.length > 0 && <div>
        <h3>Galleri</h3>
        <div className = "galleri">
          <img
            src={`${R2_URL_PUB}/${arendeBilder[bildIndex].key}`}
            style={{ width: "200px", margin: "10px" }}
          />
          <p>Bild {bildIndex + 1}/{arendeBilder.length}</p>
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
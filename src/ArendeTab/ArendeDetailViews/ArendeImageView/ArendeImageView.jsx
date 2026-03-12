import { useEffect, useState } from "react";
import UploadButton from "../../../UploadButton.jsx";
import { getBilder } from "../../../api.js";

const R2_URL_PUB =
  "https://pub-b57e1e9dcdfe4d67981fce0351584079.r2.dev";

export default function ArendeImageView({ activeArende }) {
  const [bilder, setBilder] = useState([]);

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
      <UploadButton arendeID={activeArende.id} />

      {arendeBilder.map((bild) => (
        <div key={bild.id}>
          <img
            src={`${R2_URL_PUB}/${bild.key}`}
            style={{ width: "200px", margin: "10px" }}
          />
          <p>{bild.key}</p>
        </div>
        
      ))}
    </div>
  );
}
import { useEffect, useState } from "react";
import UploadButton from "../../../UploadButton.jsx";
import { getBilder } from "../../../api.js";

const R2_URL =
  "https://ticketing-images.fe0019fa228aaa75fe5c4670e78fbc4b.eu.r2.cloudflarestorage.com";

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
            src={`${R2_URL}/${bild.key}`}
            style={{ width: "200px", margin: "10px" }}
          />
        </div>
      ))}
    </div>
  );
}
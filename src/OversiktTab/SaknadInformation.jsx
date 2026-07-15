import { useState } from 'react'
import linkToArende from '../Helpers/linkToArende.js'
import './OversiktTab.css'

function isEmptyish(value) {
  if (value === null || value === undefined) return true;
  const trimmed = String(value).trim();
  return trimmed === "" || trimmed === "-";
}

const VARIABLES = {
  adress: {
    label: "Adress",
    isMissing: (arende) => isEmptyish(arende.adress)
  },
  pris: {
    label: "Pris",
    isMissing: (arende) => isEmptyish(arende.pris) || !/\d/.test(String(arende.pris))
  },
  gravrattsinnehavare: {
    label: "Gravrättsinnehavare",
    isMissing: (arende) => isEmptyish(arende.gravrattsinnehavare)
  }
};

export default function SaknadInformation({ arenden, setActiveTab, setActiveArende }) {

  const [variable, setVariable] = useState("adress");

  const missing = arenden
    .filter((a) => a.status !== "LEGACY" && a.status !== "raderad")
    .filter((a) => VARIABLES[variable].isMissing(a))
    .sort((a, b) => b.id - a.id);

  return (
    <div className="saknad-information-view">
      <h3>Saknad information</h3>
      <div className="saknad-information-controls">
        <label>
          Saknad variabel
          <select value={variable} onChange={(e) => setVariable(e.target.value)}>
            {Object.entries(VARIABLES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>
        <p className="saknad-information-count">{missing.length} ärenden saknar {VARIABLES[variable].label.toLowerCase()}</p>
      </div>
      <div className="saknad-information-list">
        {missing.length === 0 && <p>Inga ärenden saknar {VARIABLES[variable].label.toLowerCase()}.</p>}
        {missing.map((arende) => (
          <div key={arende.id} className="saknad-information-card" onClick={() => linkToArende(setActiveTab, setActiveArende, arende)}>
            <h4>#{arende.id} {arende.avlidenNamn}</h4>
            <p>{arende.arendeTyp ?? "Okänd typ"} — {arende.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

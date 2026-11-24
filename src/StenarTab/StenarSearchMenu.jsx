import { useRef, useState } from 'react'
import './StenarSearchMenu.css'

export const STEN_STATUS_OPTIONS = [
  "Behöver beställas",
  "Behöver hämtas",
  "Beställt",
  "I lager",
]

export default function StenarSearchMenu({
  material,
  setMaterial,
  modell,
  setModell,
  avlidenNamn,
  setAvlidenNamn,
  status,
  setStatus,
  onlyLaserportratt,
  setOnlyLaserportratt,
  onlyLykthal,
  setOnlyLykthal,
  onlySpecialBlasting,
  setOnlySpecialBlasting,
  onRegistrera,
  onDownloadCsv,
  onImportCsv,
  onChangeStatus,
  selectedCount = 0,
}) {
  const fileInputRef = useRef(null)
  const [massAction, setMassAction] = useState("")
  const [massStatus, setMassStatus] = useState("")

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onImportCsv(file)
  }

  function handleMassActionChange(e) {
    setMassAction(e.target.value)
    setMassStatus("")
  }

  return (
    <form className="searchbar-arende stenar-searchbar">
      <div className="stenar-searchbar-header">
        <h3>Sök stenar</h3>
        <button
          type="button"
          className="create-button"
          onClick={onRegistrera}
        >
          +Registrera ny sten
        </button>
      </div>
      <div className="sok-arende-filter-toggles">
        <button
          type="button"
          className={onlyLaserportratt ? "sok-arende-filter-toggle active" : "sok-arende-filter-toggle"}
          onClick={() => setOnlyLaserportratt(!onlyLaserportratt)}
        >
          Laserporträtt
        </button>
        <button
          type="button"
          className={onlyLykthal ? "sok-arende-filter-toggle active" : "sok-arende-filter-toggle"}
          onClick={() => setOnlyLykthal(!onlyLykthal)}
        >
          Lykthål
        </button>
        <button
          type="button"
          className={onlySpecialBlasting ? "sok-arende-filter-toggle active" : "sok-arende-filter-toggle"}
          onClick={() => setOnlySpecialBlasting(!onlySpecialBlasting)}
        >
          Special blasting
        </button>
      </div>
      <div className="input-field-searchbar-arende">
        <label>Material</label>
        <input
          type="text"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
        />
      </div>
      <div className="input-field-searchbar-arende">
        <label>Modell</label>
        <input
          type="text"
          value={modell}
          onChange={(e) => setModell(e.target.value)}
        />
      </div>
      <div className="input-field-searchbar-arende">
        <label>Avlidens namn</label>
        <input
          type="text"
          value={avlidenNamn}
          onChange={(e) => setAvlidenNamn(e.target.value)}
        />
      </div>
      <div className="input-field-searchbar-arende">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Alla</option>
          {STEN_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="stenar-csv-buttons">
        <button
          type="button"
          className="stenar-csv-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Importera CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="stenar-csv-file-input"
          onChange={handleFileChange}
        />
        <div className="stenar-mass-action">
          <select
            id="stenar-mass-action"
            aria-label="Välj handling"
            value={massAction}
            onChange={handleMassActionChange}
          >
            <option value="">Välj handling</option>
            <option value="download-csv">Ladda ner CSV</option>
            <option value="change-status">Ändra status till</option>
          </select>
          {massAction === "download-csv" && (
            <button
              type="button"
              className="stenar-csv-button"
              onClick={onDownloadCsv}
              disabled={selectedCount === 0}
            >
              Ladda ner CSV
            </button>
          )}
          {massAction === "change-status" && (
            <>
              <select
                aria-label="Ny status"
                value={massStatus}
                onChange={(e) => setMassStatus(e.target.value)}
              >
                <option value="">Välj status</option>
                {STEN_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="stenar-csv-button"
                onClick={() => onChangeStatus?.(massStatus)}
                disabled={selectedCount === 0 || !massStatus}
              >
                Ändra
              </button>
            </>
          )}
        </div>
      </div>
    </form>
  )
}

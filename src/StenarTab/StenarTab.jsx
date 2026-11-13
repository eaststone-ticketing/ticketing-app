import { useEffect, useRef, useState } from 'react'
import './StenarTab.css'
import StenCard from './StenCard.jsx'
import StenarSearchMenu from './StenarSearchMenu.jsx'
import RegistreraStenForm from './RegistreraStenForm.jsx'
import StenImportDuplicateDialog from './StenImportDuplicateDialog.jsx'
import { getStenObjekt } from '../api.js'
import { downloadFilteredStenarCsv } from './exportStenarCsv.js'
import { importStenarFromCsv } from './importStenarCsv.js'

function matchesSearch(sten, filters, arenden, stenListTab) {
  const { attr } = sten
  const {
    material,
    modell,
    avlidenNamn,
    status,
    onlyLaserportratt,
    onlyLykthal,
    onlySpecialBlasting,
  } = filters

  const isArkiverad = attr.status === 'Arkiverad'
  if (stenListTab === 'aktuella' && isArkiverad) return false
  if (stenListTab === 'arkiverade' && !isArkiverad) return false

  const materialQ = material.trim().toLowerCase()
  if (materialQ && !(attr.material ?? "").toLowerCase().includes(materialQ)) {
    return false
  }

  const modellQ = modell.trim().toLowerCase()
  if (modellQ && !(attr.modell ?? "").toLowerCase().includes(modellQ)) {
    return false
  }

  // Status filter only applies to active stones; archived tab is all Arkiverad.
  if (stenListTab === 'aktuella' && status && attr.status !== status) {
    return false
  }

  const nameQ = avlidenNamn.trim().toLowerCase()
  if (nameQ) {
    const arende = arenden.find((a) => Number(a.id) === Number(attr.arendeID))
    const name = (arende?.avlidenNamn ?? "").toLowerCase()
    if (!name.includes(nameQ)) return false
  }

  if (onlyLaserportratt && !attr.laserportratt) return false
  if (onlyLykthal && !attr.lykthal) return false
  if (onlySpecialBlasting && !attr.specialBlasting) return false

  return true
}

export default function StenarTab({ arenden = [], setActiveTab, setActiveArende }) {
  const [stenar, setStenar] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [stenListTab, setStenListTab] = useState('aktuella')
  const [material, setMaterial] = useState("")
  const [modell, setModell] = useState("")
  const [avlidenNamn, setAvlidenNamn] = useState("")
  const [status, setStatus] = useState("")
  const [onlyLaserportratt, setOnlyLaserportratt] = useState(false)
  const [onlyLykthal, setOnlyLykthal] = useState(false)
  const [onlySpecialBlasting, setOnlySpecialBlasting] = useState(false)
  const [duplicatePrompt, setDuplicatePrompt] = useState(null)
  const stenarRef = useRef(stenar)

  useEffect(() => {
    stenarRef.current = stenar
  }, [stenar])

  useEffect(() => {
    async function loadStenObjekt() {
      try {
        const data = await getStenObjekt()
        setStenar(data)
      } catch (err) {
        console.error("Failed to load stenObjekt:", err)
      }
    }
    loadStenObjekt()
  }, [])

  const filters = {
    material,
    modell,
    avlidenNamn,
    status,
    onlyLaserportratt,
    onlyLykthal,
    onlySpecialBlasting,
  }

  const filtered = stenar.filter((sten) =>
    matchesSearch(sten, filters, arenden, stenListTab)
  )

  function resolveDuplicate(existing, incomingAttr) {
    return new Promise((resolve) => {
      setDuplicatePrompt({ existing, incomingAttr, resolve })
    })
  }

  function handleDuplicateResolve(action) {
    if (!duplicatePrompt) return
    duplicatePrompt.resolve(action)
    setDuplicatePrompt(null)
  }

  async function handleImportCsv(file) {
    try {
      await importStenarFromCsv(file, {
        existingStenar: stenarRef.current,
        setStenar,
        resolveDuplicate,
      })
    } catch (err) {
      console.error(err)
      setDuplicatePrompt(null)
      window.alert('Kunde inte importera CSV. Se konsolen för detaljer.')
    }
  }

  return (
    <div className="stenar-tab">
      {showForm ? (
        <RegistreraStenForm setShowForm={setShowForm} setStenar={setStenar} />
      ) : (
        <div className="stenar-body">
          <div className="stenar-search-column">
            <StenarSearchMenu
              material={material}
              setMaterial={setMaterial}
              modell={modell}
              setModell={setModell}
              avlidenNamn={avlidenNamn}
              setAvlidenNamn={setAvlidenNamn}
              status={status}
              setStatus={setStatus}
              onlyLaserportratt={onlyLaserportratt}
              setOnlyLaserportratt={setOnlyLaserportratt}
              onlyLykthal={onlyLykthal}
              setOnlyLykthal={setOnlyLykthal}
              onlySpecialBlasting={onlySpecialBlasting}
              setOnlySpecialBlasting={setOnlySpecialBlasting}
              onRegistrera={() => setShowForm(true)}
              onDownloadCsv={() => downloadFilteredStenarCsv(filtered, arenden)}
              onImportCsv={handleImportCsv}
            />
          </div>
          <div className="stenar-list-column">
            <div className="stenar-list-tabs">
              <button
                type="button"
                className={`notification-tab ${stenListTab === 'aktuella' ? 'active' : ''}`}
                onClick={() => setStenListTab('aktuella')}
              >
                Aktuella stenar
              </button>
              <button
                type="button"
                className={`notification-tab ${stenListTab === 'arkiverade' ? 'active' : ''}`}
                onClick={() => setStenListTab('arkiverade')}
              >
                Arkiverade stenar
              </button>
            </div>
            <div className="stenar-list">
              {filtered.map((sten) => (
                <StenCard
                  key={sten.id}
                  sten={sten}
                  arenden={arenden}
                  setStenar={setStenar}
                  setActiveTab={setActiveTab}
                  setActiveArende={setActiveArende}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {duplicatePrompt && (
        <StenImportDuplicateDialog
          existing={duplicatePrompt.existing}
          incomingAttr={duplicatePrompt.incomingAttr}
          onResolve={handleDuplicateResolve}
        />
      )}
    </div>
  )
}

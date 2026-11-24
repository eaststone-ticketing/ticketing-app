import { useEffect, useRef, useState } from 'react'
import './StenarTab.css'
import StenCard, { StenListHeader } from './StenCard.jsx'
import StenarSearchMenu from './StenarSearchMenu.jsx'
import RegistreraStenForm from './RegistreraStenForm.jsx'
import StenImportDuplicateDialog from './StenImportDuplicateDialog.jsx'
import { getStenObjekt, updateStenObjekt } from '../api.js'
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

export default function StenarTab({ arenden = [], setArenden, setActiveTab, setActiveArende }) {
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
  const [selectedIds, setSelectedIds] = useState(() => new Set())
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

  useEffect(() => {
    setSelectedIds(new Set())
  }, [
    material,
    modell,
    avlidenNamn,
    status,
    onlyLaserportratt,
    onlyLykthal,
    onlySpecialBlasting,
    stenListTab,
  ])

  const filtered = stenar.filter((sten) =>
    matchesSearch(sten, filters, arenden, stenListTab)
  )
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((sten) => selectedIds.has(sten.id))
  const someFilteredSelected = filtered.some((sten) => selectedIds.has(sten.id))

  function toggleSelected(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(filtered.map((sten) => sten.id)))
  }

  function handleDownloadSelectedCsv() {
    const selected = filtered.filter((sten) => selectedIds.has(sten.id))
    downloadFilteredStenarCsv(selected, arenden)
  }

  async function handleChangeSelectedStatus(newStatus) {
    if (!newStatus) return
    const selected = filtered.filter((sten) => selectedIds.has(sten.id))
    if (selected.length === 0) return

    const confirmed = window.confirm(
      `Vill du ändra status till ${newStatus} för alla valda stenar?`
    )
    if (!confirmed) return

    try {
      await Promise.all(
        selected.map((sten) =>
          updateStenObjekt(sten.id, {
            attr: { ...sten.attr, status: newStatus },
          })
        )
      )
      const selectedIdSet = new Set(selected.map((sten) => sten.id))
      setStenar((prev) =>
        prev.map((sten) =>
          selectedIdSet.has(sten.id)
            ? { ...sten, attr: { ...sten.attr, status: newStatus } }
            : sten
        )
      )
    } catch (err) {
      console.error(err)
      window.alert('Kunde inte ändra status. Se konsolen för detaljer.')
    }
  }

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
        <RegistreraStenForm setShowForm={setShowForm} setStenar={setStenar} setArenden={setArenden} />
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
              onDownloadCsv={handleDownloadSelectedCsv}
              onImportCsv={handleImportCsv}
              onChangeStatus={handleChangeSelectedStatus}
              selectedCount={filtered.filter((sten) => selectedIds.has(sten.id)).length}
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
              <StenListHeader
                allSelected={allFilteredSelected}
                someSelected={someFilteredSelected}
                onToggleAll={toggleSelectAll}
              />
              {filtered.map((sten) => (
                <StenCard
                  key={sten.id}
                  sten={sten}
                  arenden={arenden}
                  setArenden={setArenden}
                  setStenar={setStenar}
                  setActiveTab={setActiveTab}
                  setActiveArende={setActiveArende}
                  selected={selectedIds.has(sten.id)}
                  onToggleSelected={toggleSelected}
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

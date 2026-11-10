import { useEffect, useState } from 'react'
import './StenarTab.css'
import StenCard from './StenCard.jsx'
import StenarSearchMenu from './StenarSearchMenu.jsx'
import RegistreraStenForm from './RegistreraStenForm.jsx'
import { getStenObjekt } from '../api.js'

export { mmToCm, cmToMm } from '../Helpers/stoneUnits.js'

function matchesSearch(sten, filters, arenden) {
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

  const materialQ = material.trim().toLowerCase()
  if (materialQ && !(attr.material ?? "").toLowerCase().includes(materialQ)) {
    return false
  }

  const modellQ = modell.trim().toLowerCase()
  if (modellQ && !(attr.modell ?? "").toLowerCase().includes(modellQ)) {
    return false
  }

  if (status && attr.status !== status) {
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

export default function StenarTab({ arenden = [] }) {
  const [stenar, setStenar] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [material, setMaterial] = useState("")
  const [modell, setModell] = useState("")
  const [avlidenNamn, setAvlidenNamn] = useState("")
  const [status, setStatus] = useState("")
  const [onlyLaserportratt, setOnlyLaserportratt] = useState(false)
  const [onlyLykthal, setOnlyLykthal] = useState(false)
  const [onlySpecialBlasting, setOnlySpecialBlasting] = useState(false)

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
    matchesSearch(sten, filters, arenden)
  )

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
            />
          </div>
          <div className="stenar-list">
            {filtered.map((sten) => (
              <StenCard
                key={sten.id}
                sten={sten}
                arenden={arenden}
                setStenar={setStenar}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

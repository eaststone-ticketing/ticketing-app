import { useState } from 'react'
import { IoMdArrowDropright, IoMdArrowDropdown } from 'react-icons/io'
import { FaRegEdit } from 'react-icons/fa'
import calculateStonePrice from '../Helpers/calculateStonePrice.js'
import { mmToCm } from '../Helpers/stoneUnits.js'
import { removeStenObjekt } from '../api.js'
import EditStenForm from './EditStenForm.jsx'
import './StenCard.css'

function formatBool(value) {
  return value ? 'Ja' : 'Nej'
}

export default function StenCard({ sten, arenden = [], setStenar }) {
  const [showMore, setShowMore] = useState(false)
  const [editing, setEditing] = useState(false)
  const { attr } = sten

  const arende = arenden.find((a) => Number(a.id) === Number(attr.arendeID))
  const breddCm = mmToCm(attr.bredd)
  const hojdCm = mmToCm(attr.hojd)
  const djupCm = mmToCm(attr.djup)
  const price = calculateStonePrice(attr)

  const detailRows = [
    { label: 'Status', value: attr.status },
    { label: 'Framsida', value: attr.framsida },
    { label: 'Baksida', value: attr.baksida },
    { label: 'Kanter', value: attr.kanter },
    { label: 'Skulptur', value: attr.skulptur || '—' },
    { label: 'Laserporträtt', value: formatBool(attr.laserportratt) },
    { label: 'Lykthål', value: formatBool(attr.lykthal) },
    { label: 'Special blasting', value: formatBool(attr.specialBlasting) },
    { label: 'Priskategori', value: attr.prisKategori },
    {
      label: 'Pris',
      value: price != null ? `${price.toLocaleString('sv-SE')} kr` : '—',
    },
  ]

  async function handleDelete(e) {
    e.stopPropagation()
    if (!window.confirm('Är du säker på att du vill radera stenen?')) return
    try {
      await removeStenObjekt(sten.id)
      setStenar((prev) => prev.filter((s) => s.id !== sten.id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="sten-card">
      <div className="sten-card-header-row">
        <h3>
          {attr.modell} {attr.material} {breddCm}x{hojdCm}x{djupCm}cm
        </h3>
        <button
          type="button"
          className="sten-card-edit-button"
          onClick={(e) => {
            e.stopPropagation()
            setEditing(true)
          }}
          aria-label="Redigera sten"
        >
          <FaRegEdit />
        </button>
        <button
          type="button"
          className="delete-button-card"
          onClick={handleDelete}
        >
          <p>Radera</p>
        </button>
        {!showMore ? (
          <IoMdArrowDropright
            className="dropdown-arrow sten-card-expand-arrow"
            onClick={() => setShowMore(true)}
          />
        ) : (
          <IoMdArrowDropdown
            className="dropdown-arrow sten-card-expand-arrow"
            onClick={() => setShowMore(false)}
          />
        )}
      </div>
      <p className="sten-card-subtitle">{attr.status}</p>
      {arende && <p className="sten-card-subtitle">{arende.avlidenNamn}</p>}
      {showMore && (
        <div className="sten-card-details">
          {detailRows.map((row) => (
            <p key={row.label}>
              <span className="sten-card-detail-label">{row.label}:</span> {row.value}
            </p>
          ))}
        </div>
      )}
      {editing && (
        <EditStenForm
          sten={sten}
          setStenar={setStenar}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}

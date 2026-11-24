import { useState } from 'react'
import { IoMdArrowDropright, IoMdArrowDropdown } from 'react-icons/io'
import { FaRegEdit } from 'react-icons/fa'
import { mmToCm } from '../Helpers/stoneUnits.js'
import { removeStenObjekt } from '../api.js'
import linkToArende from '../Helpers/linkToArende.js'
import EditStenForm from './EditStenForm.jsx'
import './StenCard.css'

function formatBool(value) {
  return value ? 'Ja' : 'Nej'
}

export function StenListHeader({ allSelected, someSelected, onToggleAll }) {
  return (
    <div className="sten-list-row sten-list-header">
      <span>Modell</span>
      <span>Material</span>
      <span>Mått</span>
      <span>Ärende</span>
      <span className="sten-list-row-check-cell">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected && !allSelected
          }}
          onChange={onToggleAll}
          aria-label="Markera alla i sökresultatet"
        />
      </span>
      <span className="sten-list-row-actions-cell" aria-hidden="true" />
    </div>
  )
}

export default function StenCard({
  sten,
  arenden = [],
  setArenden,
  setStenar,
  setActiveTab,
  setActiveArende,
  selected = false,
  onToggleSelected,
}) {
  const [showMore, setShowMore] = useState(false)
  const [editing, setEditing] = useState(false)
  const { attr } = sten

  const arende = arenden.find((a) => Number(a.id) === Number(attr.arendeID))
  const isArkiverad = attr.status === 'Arkiverad'
  const breddCm = mmToCm(attr.bredd)
  const hojdCm = mmToCm(attr.hojd)
  const djupCm = mmToCm(attr.djup)
  const measurements =
    breddCm != null && hojdCm != null && djupCm != null
      ? `${breddCm}x${hojdCm}x${djupCm}cm`
      : '—'
  const canLinkTicket = Boolean(arende && setActiveTab && setActiveArende)

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

  function handleTicketClick(e) {
    e.stopPropagation()
    if (canLinkTicket) {
      linkToArende(setActiveTab, setActiveArende, arende)
    }
  }

  return (
    <div
      className={[
        'sten-list-row',
        showMore ? 'sten-list-row-expanded' : '',
        selected ? 'sten-list-row-selected' : '',
      ].filter(Boolean).join(' ')}
    >
      <span className="sten-list-row-primary">{attr.modell || '—'}</span>
      <span>{attr.material || '—'}</span>
      <span className="sten-list-row-measurements">{measurements}</span>
      <span
        className={canLinkTicket ? 'sten-list-row-ticket trace-arende' : 'sten-list-row-ticket'}
        onClick={handleTicketClick}
        role={canLinkTicket ? 'link' : undefined}
        tabIndex={canLinkTicket ? 0 : undefined}
        onKeyDown={(e) => {
          if (!canLinkTicket) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleTicketClick(e)
          }
        }}
      >
        <span className="sten-list-row-ticket-label">
          {arende ? `#${arende.id} ${arende.avlidenNamn || ''}`.trim() : '—'}
        </span>
        {arende && (
          <div className="sten-list-row-ticket-popover" role="tooltip">
            <div>
              <span className="sten-list-row-ticket-popover-label">Kyrkogård</span>
              {arende.kyrkogard || '—'}
            </div>
            <div>
              <span className="sten-list-row-ticket-popover-label">Kvarter</span>
              {arende.kvarter || '—'}
            </div>
            <div>
              <span className="sten-list-row-ticket-popover-label">Gravnummer</span>
              {arende.gravnummer || '—'}
            </div>
          </div>
        )}
      </span>
      <span className="sten-list-row-check-cell">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelected?.(sten.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Markera sten ${sten.id}`}
        />
      </span>
      <div className="sten-list-row-actions-cell">
        {!isArkiverad && (
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
        )}
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
      {showMore && (
        <div className="sten-card-details">
          {detailRows.map((row) => (
            <p key={row.label}>
              <span className="sten-card-detail-label">{row.label}:</span> {row.value}
            </p>
          ))}
        </div>
      )}
      {editing && !isArkiverad && (
        <EditStenForm
          sten={sten}
          setStenar={setStenar}
          setArenden={setArenden}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}

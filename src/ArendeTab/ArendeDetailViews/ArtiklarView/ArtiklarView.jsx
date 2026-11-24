import { useEffect, useMemo, useState } from 'react'
import { updateArende } from '../../../api.js'
import { usePriceConfig } from '../../../Helpers/PriceConfigContext.jsx'
import {
  applyArtiklarToArende,
  getAddableArtiklarRegistry,
  isSmajobbArtikel,
  normalizeArtiklar,
  sumArtiklar,
} from '../../../Helpers/artiklarHelpers.js'
import './ArtiklarView.css'

function formatKr(amount) {
  return `${Number(amount).toLocaleString('sv-SE')} kr`
}

export default function ArtiklarView({
  activeArende,
  setActiveArende,
  setArenden,
}) {
  const { priceConfig } = usePriceConfig()
  const [addLabel, setAddLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [draftAmounts, setDraftAmounts] = useState({})

  const artiklar = normalizeArtiklar(activeArende?.artiklar)
  const entries = Object.entries(artiklar)
  const total = sumArtiklar(artiklar)

  useEffect(() => {
    setDraftAmounts(
      Object.fromEntries(
        Object.entries(normalizeArtiklar(activeArende?.artiklar)).map(
          ([label, amount]) => [label, String(amount)]
        )
      )
    )
  }, [activeArende?.id, activeArende?.artiklar])

  const registry = useMemo(
    () => getAddableArtiklarRegistry(priceConfig),
    [priceConfig]
  )

  const availableToAdd = registry.filter((item) => !(item.label in artiklar))

  async function persist(nextArtiklar) {
    const updated = applyArtiklarToArende(activeArende, nextArtiklar)
    setSaving(true)
    try {
      await updateArende(activeArende.id, updated)
      setActiveArende(updated)
      setArenden((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      )
    } catch (err) {
      console.error(err)
      window.alert('Kunde inte spara artiklar.')
    } finally {
      setSaving(false)
    }
  }

  function handlePriceBlur(label) {
    const raw = draftAmounts[label]
    const amount = raw === '' || raw == null ? 0 : Number(raw)
    if (!Number.isFinite(amount)) {
      setDraftAmounts((prev) => ({
        ...prev,
        [label]: String(artiklar[label] ?? 0),
      }))
      return
    }
    if (amount === artiklar[label]) return
    persist({ ...artiklar, [label]: amount })
  }

  function handleRemove(label) {
    if (isSmajobbArtikel(label)) return
    if (!window.confirm(`Ta bort artikeln "${label}"?`)) return
    const next = { ...artiklar }
    delete next[label]
    persist(next)
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!addLabel) return
    const option = registry.find((item) => item.label === addLabel)
    if (!option || addLabel in artiklar) {
      setAddLabel('')
      return
    }
    const next = {
      ...artiklar,
      [option.label]: typeof option.amount === 'number' ? option.amount : 0,
    }
    setAddLabel('')
    persist(next)
  }

  return (
    <div className="artiklar-view">
      <h4>Artiklar</h4>

      {entries.length === 0 ? (
        <p className="artiklar-view-empty">Inga artiklar på detta ärende.</p>
      ) : (
        <ul className="artiklar-list">
          {entries.map(([label]) => {
            const locked = isSmajobbArtikel(label)
            return (
              <li key={label} className="artiklar-row">
                <span className="artiklar-label">
                  {label}
                  {locked && (
                    <span className="artiklar-locked-hint"> (via ärendetyp)</span>
                  )}
                </span>
                <input
                  type="number"
                  className="artiklar-amount-input"
                  value={draftAmounts[label] ?? ''}
                  disabled={saving}
                  onChange={(e) =>
                    setDraftAmounts((prev) => ({
                      ...prev,
                      [label]: e.target.value,
                    }))
                  }
                  onBlur={() => handlePriceBlur(label)}
                />
                {!locked && (
                  <button
                    type="button"
                    className="artiklar-remove"
                    disabled={saving}
                    onClick={() => handleRemove(label)}
                  >
                    Ta bort
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <div className="artiklar-total">
        <strong>Totalt</strong>
        <span>{formatKr(total)}</span>
      </div>

      <form className="artiklar-add-form" onSubmit={handleAdd}>
        <select
          value={addLabel}
          onChange={(e) => setAddLabel(e.target.value)}
          disabled={saving || availableToAdd.length === 0}
        >
          <option value="">
            {availableToAdd.length === 0
              ? 'Inga fler artiklar att lägga till'
              : 'Lägg till artikel…'}
          </option>
          {availableToAdd.map((item) => (
            <option key={item.label} value={item.label}>
              {item.label}
              {typeof item.amount === 'number'
                ? ` (${formatKr(item.amount)})`
                : ''}
            </option>
          ))}
        </select>
        <button type="submit" disabled={saving || !addLabel}>
          Lägg till
        </button>
      </form>
    </div>
  )
}

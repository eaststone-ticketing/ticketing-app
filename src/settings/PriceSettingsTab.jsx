import { useEffect, useState } from 'react'
import { updateSetting } from '../api.js'
import { usePriceConfig } from '../Helpers/PriceConfigContext.jsx'
import { mergePriceConfig } from '../Helpers/stonePriceConfig.js'

const PRICE_GROUPS = [
  {
    title: 'Stenpriser',
    fields: [
      { key: 'GRUNDPRIS', label: 'Grundpris' },
      { key: 'PRICE_PER_M3.A', label: 'A' },
      { key: 'PRICE_PER_M3.B', label: 'B' },
      { key: 'PRICE_PER_M3.C', label: 'C' },
      { key: 'PRICE_PER_M3.D', label: 'D' },
      { key: 'SOCKEL_STANDARD', label: 'Sockel' },
      { key: 'BLOMLIST_STANDARD', label: 'Blomlist' },
    ],
  },
  {
    title: 'Tillägg stenmaterial',
    fields: [
      { key: 'LYKTHAL', label: 'Lykthål' },
      { key: 'LASERPORTRATT', label: 'Laserporträtt' },
      { key: 'SPECIAL_BLASTING', label: 'Specialblästring' },
    ],
  },
  {
    title: 'Småjobb',
    fields: [
      { key: 'STABILISERING_STANDARD', label: 'Stabilisering' },
      { key: 'NYINSKRIPTION_STANDARD', label: 'Nyinskription' },
      { key: 'RENGORING_STANDARD', label: 'Rengöring' },
      { key: 'OMMALNING_STANDARD', label: 'Ommålning' },
      { key: 'OMSLIPNING_STANDARD', label: 'Omslipning' },
    ],
  },
  {
    title: 'Text',
    fields: [
      { key: 'RELIEF_STANDARD', label: 'Relief' },
      { key: 'BLADGULD_STANDARD', label: 'Bladguld' },
      { key: 'BLADSILVER_STANDARD', label: 'Bladsilver' },
      { key: 'BLADKOPPAR_STANDARD', label: 'Bladkoppar' },
      { key: 'GULDFARG', label: 'Guldfärg' },
      { key: 'SILVERFARG', label: 'Silverfärg' },
      { key: 'KOPPARFARG', label: 'Kopparfärg' },
    ],
  },
  {
    title: 'Justeringar',
    fields: [
      { key: 'OVRIGT', label: 'Övrigt' },
      { key: 'RABATT', label: 'Rabatt' },
    ],
  },
]

const ALL_FIELDS = PRICE_GROUPS.flatMap((group) => group.fields)

/** Left: Stenpriser + Tillägg; right: Småjobb + Text + Justeringar */
const PRICE_COLUMNS = [
  PRICE_GROUPS.slice(0, 2),
  PRICE_GROUPS.slice(2),
]

function getFieldValue(config, key) {
  if (key.startsWith('PRICE_PER_M3.')) {
    const category = key.split('.')[1]
    return config?.PRICE_PER_M3?.[category]
  }
  return config?.[key]
}

function setFieldValue(config, key, value) {
  if (key.startsWith('PRICE_PER_M3.')) {
    const category = key.split('.')[1]
    return {
      ...config,
      PRICE_PER_M3: {
        ...config.PRICE_PER_M3,
        [category]: value,
      },
    }
  }
  return { ...config, [key]: value }
}

function formatKr(value) {
  return `${Number(value).toLocaleString('sv-SE')} kr`
}

function summarizeChanges(before, after) {
  const changes = []
  for (const field of ALL_FIELDS) {
    const prev = Number(getFieldValue(before, field.key))
    const next = Number(getFieldValue(after, field.key))
    if (!Number.isFinite(prev) || !Number.isFinite(next)) continue
    if (prev === next) continue
    changes.push(`${field.label}: ${formatKr(prev)} → ${formatKr(next)}`)
  }
  return changes
}

export default function PriceSettingsTab({ onCancel }) {
  const { priceConfig: livePriceConfig, setPriceConfig, loading } = usePriceConfig()
  const [draft, setDraft] = useState(() => mergePriceConfig(livePriceConfig))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setDraft(mergePriceConfig(livePriceConfig))
  }, [livePriceConfig])

  function handleFieldChange(key, rawValue) {
    const nextValue = rawValue === '' ? '' : Number(rawValue)
    setDraft((prev) => setFieldValue(prev, key, nextValue))
  }

  function handleCancel() {
    setError('')
    setDraft(mergePriceConfig(livePriceConfig))
    onCancel?.()
  }

  async function handleSave() {
    setError('')
    try {
      let normalized = mergePriceConfig(draft)

      for (const field of ALL_FIELDS) {
        const num = Number(getFieldValue(normalized, field.key))
        if (!Number.isFinite(num)) {
          throw new Error(`Ogiltigt värde för ${field.label}`)
        }
        normalized = setFieldValue(normalized, field.key, num)
      }

      const changes = summarizeChanges(livePriceConfig, normalized)
      if (changes.length === 0) {
        window.alert('Inga prisändringar att spara.')
        return
      }

      const confirmed = window.confirm(
        `Vill du spara följande prisändringar?\n\n${changes.join('\n')}`
      )
      if (!confirmed) return

      setSaving(true)
      await updateSetting('priceConfig', normalized)
      setPriceConfig(normalized)
      setDraft(normalized)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Kunde inte spara priser.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="settings-help">Laddar…</p>
  }

  return (
    <div className="settings-panel settings-panel-prices">
      <div className="settings-price-columns">
        {PRICE_COLUMNS.map((columnGroups, columnIndex) => (
          <div key={columnIndex} className="settings-price-column">
            {columnGroups.map((group) => (
              <section key={group.title} className="settings-price-group">
                <h4>{group.title}</h4>
                <div className="settings-price-list">
                  {group.fields.map((field) => (
                    <label key={field.key} className="settings-field-row">
                      <span>{field.label}</span>
                      <input
                        type="number"
                        value={getFieldValue(draft, field.key) ?? ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ))}
      </div>

      {error && <p className="settings-error">{error}</p>}

      <div className="settings-actions">
        <button type="button" onClick={handleCancel} disabled={saving}>
          Avbryt
        </button>
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Sparar…' : 'Spara priser'}
        </button>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import UserSettingsTab from './UserSettingsTab.jsx'
import PriceSettingsTab from './PriceSettingsTab.jsx'
import './SettingsOverlay.css'

const PRICE_SETTINGS_USERS = new Set(['felix', 'lotten', 'ian'])

export default function SettingsOverlay({
  onClose,
  prideForcedOutOfSeason,
  setPrideThemeOutOfSeason,
}) {
  const userName = JSON.parse(localStorage.getItem('user'))?.userName ?? ''
  const canEditPrices = PRICE_SETTINGS_USERS.has(userName.toLowerCase())
  const [activeTab, setActiveTab] = useState('user')

  const tabs = useMemo(() => {
    const list = [{ id: 'user', label: 'Användarinställningar' }]
    if (canEditPrices) {
      list.push({ id: 'price', label: 'Priser' })
    }
    return list
  }, [canEditPrices])

  return createPortal(
    <div
      className="arende-jobb-form-overlay"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div
        className="arende-jobb-form settings-overlay-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="arende-jobb-form-header">
          <h3>Inställningar</h3>
          <button
            type="button"
            className="arende-jobb-form-close"
            onClick={onClose}
            aria-label="Stäng"
            title="Stäng"
          >
            ×
          </button>
        </div>

        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'user' && (
          <UserSettingsTab
            prideForcedOutOfSeason={prideForcedOutOfSeason}
            setPrideThemeOutOfSeason={setPrideThemeOutOfSeason}
          />
        )}
        {activeTab === 'price' && canEditPrices && (
          <PriceSettingsTab onCancel={onClose} />
        )}
      </div>
    </div>,
    document.body
  )
}

export default function UserSettingsTab({
  prideForcedOutOfSeason,
  setPrideThemeOutOfSeason,
}) {
  return (
    <div className="settings-panel">
      <p className="settings-help">
        Pride-läget visas vanligtvis endast under Stockholm Pride, här kan du aktivera det året runt.
      </p>
      <button
        type="button"
        className={`settings-toggle-button ${prideForcedOutOfSeason ? "active" : ""}`}
        onClick={() => setPrideThemeOutOfSeason(!prideForcedOutOfSeason)}
      >
        {prideForcedOutOfSeason ? "Stäng av pride-läge" : "Aktivera pride-läge"}
      </button>
    </div>
  )
}

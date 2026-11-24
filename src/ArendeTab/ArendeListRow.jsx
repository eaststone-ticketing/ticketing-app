import './ArendeListRow.css'

export function ArendeListHeader() {
  return (
    <div className="arende-list-row arende-list-header">
      <span>Avliden</span>
      <span>Typ</span>
      <span>Skapad</span>
      <span>Kyrkogård</span>
      <span>Kund</span>
    </div>
  )
}

export default function ArendeListRow({ arende, setActiveArende }) {
  return (
    <div
      className="arende-list-row"
      onClick={() => setActiveArende(arende)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setActiveArende(arende)
        }
      }}
    >
      <span className="arende-list-row-primary">{arende.avlidenNamn || "—"}</span>
      <span>{arende.arendeTyp || "—"}</span>
      <span className="arende-list-row-date">{arende.datum || "—"}</span>
      <span>{arende.kyrkogard || "—"}</span>
      <span>{arende.bestallare || "—"}</span>
    </div>
  )
}

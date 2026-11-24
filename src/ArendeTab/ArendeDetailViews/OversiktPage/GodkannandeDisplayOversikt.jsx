import handleStatusChange from '../../../handleStatusChange.js'
import { isGodkannandeChecked } from '../../../Helpers/approvalFields.js'

function displayGodkannande(list, godkannare) {
  if (!list || list.length === 0) return <></>

  const godkannande = list.find((x) => x.godkannare === godkannare)
  if (!godkannande) return <></>

  return (
    <div className="godkannande-info">
      <p>Godkänt: {godkannande.datum}</p>
      <p>Källa: {godkannande.kalla}</p>
    </div>
  )
}

export function GodkannandeDisplayOversikt({
  activeArende,
  setArenden,
  setActiveArende,
}) {
  const godkannanden = Array.isArray(activeArende.godkannanden)
    ? activeArende.godkannanden
    : []

  return (
    <div>
      <h3>Godkännanden</h3>
      <div className="arende-detail-checkboxes">
        <label>
          <strong>Godkänd av kund</strong>
        </label>
        <input
          type="checkbox"
          name="godkandKund"
          checked={isGodkannandeChecked(activeArende, 'kund')}
          onChange={() =>
            handleStatusChange(
              'kund',
              activeArende,
              setArenden,
              setActiveArende
            )
          }
        />
      </div>
      <div className="godkannande-info">
        {displayGodkannande(godkannanden, 'kund')}
      </div>
      <div className="arende-detail-checkboxes">
        <label>
          <strong>Godkänd av kyrkogård</strong>
        </label>
        <input
          type="checkbox"
          name="godkandKyrkogard"
          checked={isGodkannandeChecked(activeArende, 'kyrkogård')}
          onChange={() =>
            handleStatusChange(
              'kyrkogård',
              activeArende,
              setArenden,
              setActiveArende
            )
          }
        />
      </div>
      <div className="godkannande-info">
        {displayGodkannande(godkannanden, 'kyrkogård')}
      </div>
    </div>
  )
}

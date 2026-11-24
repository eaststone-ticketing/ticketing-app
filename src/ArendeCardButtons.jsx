import hasType from './Helpers/hasType.js'
import { canSendAnsokan } from './Helpers/approvalFields.js'

export default function ArendeCardButtons({ arende, onRecordAnsokan }) {
  const onApprovalTrack =
    hasType(arende.arendeTyp, 'Ny sten') ||
    hasType(arende.arendeTyp, 'Nyinskription')

  if (!onApprovalTrack) return null

  const showSkiss = canSendAnsokan(arende, 'kund')
  const showAnsokan = canSendAnsokan(arende, 'kyrkogård')

  if (!showSkiss && !showAnsokan) return null

  return (
    <div>
      {showSkiss && (
        <button
          className="send-button"
          type="button"
          onClick={() => onRecordAnsokan('kund', arende)}
        >
          Skickat skiss →→
        </button>
      )}
      {showAnsokan && (
        <button
          className="send-button"
          type="button"
          onClick={() => onRecordAnsokan('kyrkogård', arende)}
        >
          Skickat ansökan →→
        </button>
      )}
    </div>
  )
}

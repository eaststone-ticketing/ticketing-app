import { updateArende } from './api.js'
import laggTillTrace from './laggTillTrace.jsx'
import { applyToggleGodkannande } from './Helpers/approvalFields.js'
import { hasGodkannande } from './Helpers/deriveStatus.js'

export default async function handleStatusChange(
  approver,
  arende,
  setArenden,
  setActiveArende = null
) {
  const wasApproved = hasGodkannande(arende.godkannanden, approver)
  const patch = applyToggleGodkannande(arende, approver)
  const updatedArende = { ...arende, ...patch }

  setArenden((prev) =>
    prev.map((a) => (a.id === arende.id ? updatedArende : a))
  )
  if (setActiveArende) {
    setActiveArende((prev) =>
      prev?.id === arende.id ? { ...prev, ...patch } : prev
    )
  }

  await updateArende(arende.id, patch)

  const action = wasApproved
    ? `tog bort godkännande av ${approver}`
    : `lade till godkännande av ${approver}`
  await laggTillTrace(
    `${action}`,
    arende
  )
}

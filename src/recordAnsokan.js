import { updateArende } from './api.js'
import laggTillTrace from './laggTillTrace.jsx'
import { applyRecordAnsokan } from './Helpers/approvalFields.js'

export default async function recordAnsokan(till, arende, setArenden) {
  const patch = applyRecordAnsokan(arende, till)
  if (
    patch.status === arende.status &&
    JSON.stringify(patch.ansokan) === JSON.stringify(arende.ansokan ?? [])
  ) {
    return
  }

  const updatedArende = { ...arende, ...patch }
  setArenden((prev) =>
    prev.map((a) => (a.id === arende.id ? updatedArende : a))
  )

  await updateArende(arende.id, patch)

  const label = till === 'kund' ? 'skiss' : 'ansökan'
  await laggTillTrace(
    `skickade ${label} till ${till}`,
    arende
  )
}

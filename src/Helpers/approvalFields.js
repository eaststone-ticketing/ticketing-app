import deriveStatus, {
  hasGodkannande,
  hasPendingAnsokan,
} from './deriveStatus.js'
import hasType from './hasType.js'

const TERMINAL_STATUSES = new Set(['Stängt', 'raderad', 'LEGACY'])

export function requiresApprovalTrack(arendeTyp) {
  return (
    hasType(arendeTyp, 'Ny sten') || hasType(arendeTyp, 'Nyinskription')
  )
}

/** Initial status + empty approval JSON for a new/restored ärende. */
export function initialApprovalState(arendeTyp) {
  return {
    status: requiresApprovalTrack(arendeTyp) ? 'Nytt' : 'Redo',
    godkannanden: [],
    ansokan: [],
  }
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function asList(value) {
  return Array.isArray(value) ? value : []
}

function withDerivedStatus(arende, godkannanden, ansokan) {
  const derived = deriveStatus({ godkannanden, ansokan })
  const status = TERMINAL_STATUSES.has(arende.status) ? arende.status : derived
  return { godkannanden, ansokan, status }
}

/** Toggle kund/kyrkogård approval; clears that party's pending ansökan when approving. */
export function applyToggleGodkannande(arende, godkannare) {
  let godkannanden = asList(arende.godkannanden)
  let ansokan = asList(arende.ansokan)

  if (hasGodkannande(godkannanden, godkannare)) {
    godkannanden = godkannanden.filter((g) => g.godkannare !== godkannare)
  } else {
    godkannanden = [
      ...godkannanden.filter((g) => g.godkannare !== godkannare),
      { godkannare, datum: today(), kalla: 'Email' },
    ]
    ansokan = ansokan.filter((a) => a.till !== godkannare)
  }

  return withDerivedStatus(arende, godkannanden, ansokan)
}

/** Record that skiss (kund) or ansökan (kyrkogård) was sent. */
export function applyRecordAnsokan(arende, till) {
  const godkannanden = asList(arende.godkannanden)
  let ansokan = asList(arende.ansokan)

  if (!hasPendingAnsokan(ansokan, till) && !hasGodkannande(godkannanden, till)) {
    ansokan = [
      ...ansokan,
      {
        till,
        typ: till === 'kund' ? 'skiss' : 'ansokan',
        datum: today(),
      },
    ]
  }

  return withDerivedStatus(arende, godkannanden, ansokan)
}

export function isGodkannandeChecked(arende, godkannare) {
  return (
    hasGodkannande(arende?.godkannanden, godkannare) ||
    arende?.status === 'LEGACY' ||
    arende?.status === 'Stängt'
  )
}

export function canSendAnsokan(arende, till) {
  return (
    !hasGodkannande(arende?.godkannanden, till) &&
    !hasPendingAnsokan(arende?.ansokan, till)
  )
}

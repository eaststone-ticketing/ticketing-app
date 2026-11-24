function asList(value) {
  return Array.isArray(value) ? value : []
}

export function hasGodkannande(godkannanden, godkannare) {
  return asList(godkannanden).some((g) => g?.godkannare === godkannare)
}

export function hasPendingAnsokan(ansokan, till) {
  return asList(ansokan).some((a) => a?.till === till)
}

/**
 * Derive workflow status from approval facts on an ärende.
 * Does not handle terminal statuses (Stängt, raderad, LEGACY) — leave those alone.
 *
 * @param {{ godkannanden?: unknown, ansokan?: unknown }} fields
 * @returns {string}
 */
export default function deriveStatus({ godkannanden, ansokan } = {}) {
  const kundOk = hasGodkannande(godkannanden, 'kund')
  const kyrkogardOk = hasGodkannande(godkannanden, 'kyrkogård')
  const pendingKund = hasPendingAnsokan(ansokan, 'kund')
  const pendingKyrkogard = hasPendingAnsokan(ansokan, 'kyrkogård')

  if (kundOk && kyrkogardOk) return 'Redo'

  if (kundOk && pendingKyrkogard) {
    return 'Godkänd av kund, väntar svar av kyrkogård'
  }
  if (kundOk) return 'Godkänd av kund'

  if (kyrkogardOk && pendingKund) {
    return 'Godkänd av kyrkogård, väntar svar av kund'
  }
  if (kyrkogardOk) return 'Godkänd av kyrkogård'

  if (pendingKund && pendingKyrkogard) {
    return 'Väntar svar av kund och kyrkogård'
  }
  if (pendingKund) return 'Väntar svar av kund'
  if (pendingKyrkogard) return 'Väntar svar av kyrkogård'

  return 'Nytt'
}

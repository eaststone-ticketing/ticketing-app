import getTypes from './getTypes.js'
import { STONE_PRICE_CONFIG } from './stonePriceConfig.js'

/** Småjobb tied to ärendetyp tags — not addable/removable via Artiklar tab. */
export const SMAJOBB_LABELS = [
  'Nyinskription',
  'Rengöring',
  'Ommålning',
  'Omslipning',
  'Stabilisering',
]

const SMAJOBB_PRICE_KEYS = {
  Nyinskription: 'NYINSKRIPTION_STANDARD',
  Rengöring: 'RENGORING_STANDARD',
  Ommålning: 'OMMALNING_STANDARD',
  Omslipning: 'OMSLIPNING_STANDARD',
  Stabilisering: 'STABILISERING_STANDARD',
}

export const ARTIKEL_STENMATERIAL = 'Stenmaterial'
export const ARTIKEL_SOCKEL = 'Sockel'

/** Registry entries selectable in the Artiklar tab (defaults from price settings). */
export function getAddableArtiklarRegistry(priceConfig = STONE_PRICE_CONFIG) {
  return [
    { label: 'Blomlist', amount: priceConfig.BLOMLIST_STANDARD },
    { label: 'Lykthål', amount: priceConfig.LYKTHAL },
    { label: 'Laserporträtt', amount: priceConfig.LASERPORTRATT },
    { label: 'Specialblästring', amount: priceConfig.SPECIAL_BLASTING },
    { label: 'Relief', amount: priceConfig.RELIEF_STANDARD },
    { label: 'Bladguld', amount: priceConfig.BLADGULD_STANDARD },
    { label: 'Bladsilver', amount: priceConfig.BLADSILVER_STANDARD },
    { label: 'Bladkoppar', amount: priceConfig.BLADKOPPAR_STANDARD },
    { label: 'Guldfärg', amount: priceConfig.GULDFARG },
    { label: 'Silverfärg', amount: priceConfig.SILVERFARG },
    { label: 'Kopparfärg', amount: priceConfig.KOPPARFARG },
    { label: 'Övrigt', amount: priceConfig.OVRIGT ?? 0 },
    { label: 'Rabatt', amount: priceConfig.RABATT ?? 0 },
  ]
}

export function isSmajobbArtikel(label) {
  return SMAJOBB_LABELS.includes(label)
}

export function normalizeArtiklar(artiklar) {
  if (!artiklar || typeof artiklar !== 'object' || Array.isArray(artiklar)) {
    return {}
  }
  const next = {}
  for (const [key, value] of Object.entries(artiklar)) {
    if (!key) continue
    const num = typeof value === 'number' ? value : Number(value)
    next[key] = Number.isFinite(num) ? num : 0
  }
  return next
}

export function sumArtiklar(artiklar) {
  return Object.values(normalizeArtiklar(artiklar)).reduce((sum, value) => sum + value, 0)
}

/**
 * Convert kostnadspecifikation lines into a flat artiklar map.
 * Stone groups become a single "Stenmaterial" total.
 */
export function kostnadLinesToArtiklar(lines) {
  const artiklar = {}
  for (const line of lines || []) {
    if (typeof line.amount !== 'number') continue

    let key = line.label
    if (line.id === 'sten' || /^Sten(?:\s|#)/.test(line.label) || line.label === 'Sten') {
      key = ARTIKEL_STENMATERIAL
    }

    artiklar[key] = line.amount
  }
  return artiklar
}

/** Ensure småjobb lines match current ärendetyper; preserve existing amounts. */
export function syncSmajobbArtiklar(
  artiklar,
  arendeTyp,
  priceConfig = STONE_PRICE_CONFIG
) {
  const next = normalizeArtiklar(artiklar)
  const types = getTypes(arendeTyp)

  for (const label of SMAJOBB_LABELS) {
    if (types.includes(label)) {
      if (!(label in next)) {
        const priceKey = SMAJOBB_PRICE_KEYS[label]
        const amount = priceConfig?.[priceKey]
        next[label] = typeof amount === 'number' ? amount : 0
      }
    } else {
      delete next[label]
    }
  }

  return next
}

export function applyArtiklarToArende(arende, artiklar) {
  const nextArtiklar = normalizeArtiklar(artiklar)
  return {
    ...arende,
    artiklar: nextArtiklar,
    pris: String(sumArtiklar(nextArtiklar)),
  }
}

/** Sync småjobb from arendeTyp, then recompute pris. */
export function withSyncedSmajobbArtiklar(
  arende,
  priceConfig = STONE_PRICE_CONFIG
) {
  const synced = syncSmajobbArtiklar(
    arende?.artiklar,
    arende?.arendeTyp,
    priceConfig
  )
  return applyArtiklarToArende(arende, synced)
}

/**
 * When a stone is registered/linked to an ärende, ensure Stenmaterial or Sockel
 * exists in artiklar (does not overwrite an existing billed amount).
 */
export function artiklarAfterStoneLinked(
  artiklar,
  { isSockel, stonePrice, sockelPrice }
) {
  const next = normalizeArtiklar(artiklar)
  if (isSockel) {
    if (!(ARTIKEL_SOCKEL in next) && typeof sockelPrice === 'number') {
      next[ARTIKEL_SOCKEL] = sockelPrice
    }
    return next
  }
  if (!(ARTIKEL_STENMATERIAL in next) && typeof stonePrice === 'number') {
    next[ARTIKEL_STENMATERIAL] = stonePrice
  }
  return next
}

import { STONE_PRICE_CONFIG } from './stonePriceConfig.js'

/** Itemized stone price lines. `attr` dimensions must be in mm. Returns null if price cannot be calculated. */
export default function buildStonePriceBreakdown(attr) {
  const {
    GRUNDPRIS,
    PRICE_PER_M3,
    SCULPTURE_SMALL,
    SCULPTURE_BIG,
    LYKTHAL,
    LASERPORTRATT,
    SPECIAL_BLASTING,
  } = STONE_PRICE_CONFIG

  const {
    hojd,
    bredd,
    djup,
    prisKategori,
    skulptur,
    lykthal,
    laserportratt,
    specialBlasting,
  } = attr ?? {}

  const rate = PRICE_PER_M3[prisKategori]
  if (rate == null) return null

  const h = Number(hojd)
  const b = Number(bredd)
  const d = Number(djup)
  if (![h, b, d].every((n) => Number.isFinite(n) && n > 0)) return null

  const volumeM3 = (h * b * d) / 1e9
  const stenmaterial = GRUNDPRIS + Math.round(volumeM3 * rate)

  const lines = [
    { label: 'Stenmaterial', amount: stenmaterial },
  ]

  if (skulptur === 'Liten') {
    lines.push({ label: 'Skulptur (liten)', amount: SCULPTURE_SMALL })
  }
  if (skulptur === 'Stor') {
    lines.push({ label: 'Skulptur (stor)', amount: SCULPTURE_BIG })
  }
  if (lykthal) {
    lines.push({ label: 'Lykthål', amount: LYKTHAL })
  }
  if (laserportratt) {
    lines.push({ label: 'Laserporträtt', amount: LASERPORTRATT })
  }
  if (specialBlasting) {
    lines.push({ label: 'Special blasting', amount: SPECIAL_BLASTING })
  }

  const total = lines.reduce((sum, line) => sum + line.amount, 0)
  return { lines, total }
}

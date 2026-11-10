export default function calculateStonePrice(attr) {
  const GRUNDPRIS = 7063

  const PRICE_PER_M3 = {
    A: 202956,
    B: 270608,
    C: 317301,
    D: 350199,
  }

  const SCULPTURE_SMALL = 5600
  const SCULPTURE_BIG = 10500
  const LYKTHAL = 1500
  const LASERPORTRATT = 4200
  const SPECIAL_BLASTING = 2800

  const { hojd, bredd, djup, prisKategori, skulptur, lykthal, laserportratt, specialBlasting } = attr

  // Dimensions stored as mm → volume in m³
  const volumeM3 = (hojd * bredd * djup) / 1e9
  const rate = PRICE_PER_M3[prisKategori]
  if (rate == null) return null

  let price = GRUNDPRIS + volumeM3 * rate

  if (skulptur === "Liten") price += SCULPTURE_SMALL
  if (skulptur === "Stor") price += SCULPTURE_BIG
  if (lykthal) price += LYKTHAL
  if (laserportratt) price += LASERPORTRATT
  if (specialBlasting) price += SPECIAL_BLASTING

  return Math.round(price)
}

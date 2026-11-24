import { mmToCm } from '../Helpers/stoneUnits.js'
import { STENAR_CSV_HEADERS } from './stenarCsvHeaders.js'

function escapeCsvValue(value) {
  const str = value == null ? '' : String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function downloadFilteredStenarCsv(filtered, arenden) {
  const rows = filtered.map((sten) => {
    const { attr } = sten
    const arende = arenden.find((a) => Number(a.id) === Number(attr.arendeID))

    return [
      sten.id,
      attr.material ?? '',
      attr.modell ?? '',
      mmToCm(attr.bredd),
      mmToCm(attr.hojd),
      mmToCm(attr.djup),
      attr.status ?? '',
      attr.framsida ?? '',
      attr.baksida ?? '',
      attr.kanter ?? '',
      attr.skulptur ?? '',
      attr.laserportratt ? 'Ja' : 'Nej',
      attr.lykthal ? 'Ja' : 'Nej',
      attr.specialBlasting ? 'Ja' : 'Nej',
      attr.prisKategori ?? '',
      attr.arendeID ?? '',
      arende?.avlidenNamn ?? '',
    ].map(escapeCsvValue).join(',')
  })

  const csv = '\uFEFF' + [STENAR_CSV_HEADERS.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().split('T')[0]
  link.href = url
  link.download = `stenar-${date}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

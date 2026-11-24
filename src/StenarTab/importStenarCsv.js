import { addStenObjekt, removeStenObjekt } from '../api.js'
import { cmToMm } from '../Helpers/stoneUnits.js'
import { STENAR_CSV_HEADERS } from './stenarCsvHeaders.js'

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }

  result.push(current)
  return result
}

function parseCsv(text) {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n').filter((line) => line.trim() !== '')
  if (lines.length === 0) return { headers: [], rows: [] }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim())
  const rows = lines.slice(1).map((line) => parseCsvLine(line))
  return { headers, rows }
}

function parseCsvBool(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return normalized === 'ja' || normalized === 'true' || normalized === '1' || normalized === 'yes'
}

function headersMatchExpected(headers) {
  // Allow older exports that still include a "Pris (kr)" column.
  return STENAR_CSV_HEADERS.every((expected) => headers.includes(expected))
}

function rowToStenAttr(row, headers) {
  const get = (header) => {
    const index = headers.indexOf(header)
    return index >= 0 ? row[index] ?? '' : ''
  }

  const arendeRaw = String(get('Ärende-ID')).trim()

  return {
    material: String(get('Material')).trim(),
    modell: String(get('Modell')).trim(),
    bredd: cmToMm(get('Bredd (cm)')),
    hojd: cmToMm(get('Höjd (cm)')),
    djup: cmToMm(get('Djup (cm)')),
    status: String(get('Status')).trim() || 'I lager',
    framsida: String(get('Framsida')).trim(),
    baksida: String(get('Baksida')).trim(),
    kanter: String(get('Kanter')).trim(),
    skulptur: String(get('Skulptur')).trim(),
    laserportratt: parseCsvBool(get('Laserporträtt')),
    lykthal: parseCsvBool(get('Lykthål')),
    specialBlasting: parseCsvBool(get('Special blasting')),
    prisKategori: String(get('Priskategori')).trim() || 'A',
    arendeID: arendeRaw === '' ? null : Number(arendeRaw),
  }
}

export function stonesMatchIdentity(existingAttr, incomingAttr) {
  return (
    String(existingAttr.material ?? '').trim().toLowerCase() ===
      String(incomingAttr.material ?? '').trim().toLowerCase() &&
    String(existingAttr.modell ?? '').trim().toLowerCase() ===
      String(incomingAttr.modell ?? '').trim().toLowerCase() &&
    Number(existingAttr.bredd) === Number(incomingAttr.bredd) &&
    Number(existingAttr.hojd) === Number(incomingAttr.hojd) &&
    Number(existingAttr.djup) === Number(incomingAttr.djup)
  )
}

function findMatchingStone(stenar, incomingAttr) {
  return stenar.find((sten) => stonesMatchIdentity(sten.attr, incomingAttr)) ?? null
}

/**
 * @param {File} file
 * @param {{
 *   existingStenar: array,
 *   setStenar: Function,
 *   resolveDuplicate: (existing, incomingAttr) => Promise<'keep-both' | 'keep-existing' | 'keep-imported'>,
 * }} options
 */
export async function importStenarFromCsv(file, { existingStenar, setStenar, resolveDuplicate }) {
  const text = await file.text()
  const { headers, rows } = parseCsv(text)

  if (!headersMatchExpected(headers)) {
    window.alert('Kolumner matchar inte väntat format')
    return
  }

  if (rows.length === 0) {
    window.alert('CSV-filen innehåller inga stenar att importera.')
    return
  }

  let workingStenar = [...existingStenar]
  let importedCount = 0
  let skippedCount = 0
  let replacedCount = 0

  for (const row of rows) {
    const attr = rowToStenAttr(row, headers)
    const match = findMatchingStone(workingStenar, attr)

    let action = 'keep-both'
    if (match) {
      action = await resolveDuplicate(match, attr)
    }

    if (action === 'keep-existing') {
      skippedCount += 1
      continue
    }

    if (action === 'keep-imported' && match) {
      await removeStenObjekt(match.id)
      workingStenar = workingStenar.filter((sten) => sten.id !== match.id)
      setStenar((prev) => prev.filter((sten) => sten.id !== match.id))
      replacedCount += 1
    }

    const created = await addStenObjekt({ attr })
    workingStenar = [...workingStenar, created]
    setStenar((prev) => [...prev, created])
    importedCount += 1
  }

  const parts = [`${importedCount} sten${importedCount === 1 ? '' : 'ar'} importerades`]
  if (replacedCount > 0) {
    parts.push(`${replacedCount} ersattes`)
  }
  if (skippedCount > 0) {
    parts.push(`${skippedCount} hoppades över`)
  }
  window.alert(`${parts.join(', ')}.`)
}

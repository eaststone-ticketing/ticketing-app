import { STONE_PRICE_CONFIG } from './stonePriceConfig.js'
import buildStonePriceBreakdown from './buildStonePriceBreakdown.js'
import { cmToMm } from './stoneUnits.js'
import getTypes from './getTypes.js'

function jobStandardPrices(priceConfig) {
  return {
    Nyinskription: priceConfig.NYINSKRIPTION_STANDARD,
    Rengöring: priceConfig.RENGORING_STANDARD,
    Ommålning: priceConfig.OMMALNING_STANDARD,
    Omslipning: priceConfig.OMSLIPNING_STANDARD,
    Stabilisering: priceConfig.STABILISERING_STANDARD,
    Inspektion: null,
    Högalid: null,
    'Lilla Dalen': null,
    Övrigt: null,
  }
}

export function getFargTillaggOptions(priceConfig = STONE_PRICE_CONFIG) {
  return [
    {
      id: 'bladguld',
      label: 'Bladguld',
      farg: 'Bladguld',
      amount: priceConfig.BLADGULD_STANDARD,
    },
    {
      id: 'bladsilver',
      label: 'Bladsilver',
      farg: 'Bladsilver',
      amount: priceConfig.BLADSILVER_STANDARD,
    },
    {
      id: 'bladkoppar',
      label: 'Bladkoppar',
      farg: 'Bladkoppar',
      amount: priceConfig.BLADKOPPAR_STANDARD,
    },
    {
      id: 'relief',
      label: 'Relief',
      farg: 'Relief',
      amount: priceConfig.RELIEF_STANDARD,
    },
    {
      id: 'guldfarg',
      label: 'Guldfärg',
      farg: 'Guldfärg',
      amount: priceConfig.GULDFARG,
    },
    {
      id: 'silverfarg',
      label: 'Silverfärg',
      farg: 'Silverfärg',
      amount: priceConfig.SILVERFARG,
    },
    {
      id: 'kopparfarg',
      label: 'Kopparfärg',
      farg: 'Kopparfärg',
      amount: priceConfig.KOPPARFARG,
    },
    {
      id: 'ovrig',
      label: 'Övrigt',
      amount: priceConfig.OVRIGT ?? 0,
      kind: 'extra',
    },
    {
      id: 'rabatt',
      label: 'Rabatt',
      amount: priceConfig.RABATT ?? 0,
      kind: 'rabatt',
    },
  ]
}

export function isFargTillaggOption(option) {
  return Boolean(option?.farg)
}

/** @deprecated Prefer getFargTillaggOptions(priceConfig) for live prices. */
export const FARG_TILLAGG_OPTIONS = getFargTillaggOptions(STONE_PRICE_CONFIG)

function stenAttrFromForm(sten) {
  if (!sten) return null
  return {
    hojd: cmToMm(sten.hojd),
    bredd: cmToMm(sten.bredd),
    djup: cmToMm(sten.djup),
    prisKategori: sten.prisKategori || 'A',
    skulptur: sten.skulptur || '',
    lykthal: !!sten.lykthal,
    laserportratt: !!sten.laserportratt,
    specialBlasting: !!sten.specialBlasting,
  }
}

function stoneDependencyKey(attr) {
  if (!attr) return 'sten:none'
  return [
    'sten',
    attr.hojd,
    attr.bredd,
    attr.djup,
    attr.prisKategori,
    attr.skulptur || '',
    attr.lykthal ? 1 : 0,
    attr.laserportratt ? 1 : 0,
    attr.specialBlasting ? 1 : 0,
  ].join(':')
}

function pushJobLine(lines, arendeTyp, sten, priceConfig) {
  const prices = jobStandardPrices(priceConfig)
  if (!Object.prototype.hasOwnProperty.call(prices, arendeTyp)) return

  const baseAmount = prices[arendeTyp]
  const jobDepKey = `job:${arendeTyp}`
  const jobId = `job-${arendeTyp}`

  if (arendeTyp === 'Nyinskription' && typeof baseAmount === 'number') {
    const children = [
      {
        id: `${jobId}-standard`,
        label: 'Standardpris',
        amount: baseAmount,
        dependencyKey: `${jobDepKey}:base`,
      },
    ]
    if (sten?.specialBlasting) {
      children.push({
        id: `${jobId}-special-blasting`,
        label: 'Special blasting',
        amount: priceConfig.SPECIAL_BLASTING,
        dependencyKey: `${jobDepKey}:specialBlasting`,
      })
    }
    const total = children.reduce((sum, child) => sum + child.amount, 0)
    lines.push({
      id: jobId,
      label: arendeTyp,
      amount: total,
      dependencyKey: jobDepKey,
      children,
    })
    return
  }

  lines.push({
    id: jobId,
    label: arendeTyp,
    amount: baseAmount,
    dependencyKey: jobDepKey,
  })
}

/**
 * Default itemized kostnad lines for NewArendeForm.
 * Supports multiple ärendetyper — one cost group per type.
 * Each entry: { id, label, amount: number|null, dependencyKey, children? }
 */
export default function buildKostnadLines({
  arendeTyp,
  sten,
  sockelChecked,
  useExistingSten,
  selectedLagerSten,
  priceConfig = STONE_PRICE_CONFIG,
}) {
  const lines = []
  const types = Array.isArray(arendeTyp) ? arendeTyp : getTypes(arendeTyp)

  if (!types.length) return lines

  for (const type of types) {
    if (type === 'Ny sten') {
      const attr = useExistingSten
        ? selectedLagerSten?.attr
        : stenAttrFromForm(sten)
      const breakdown = attr ? buildStonePriceBreakdown(attr, priceConfig) : null
      const depKey = stoneDependencyKey(attr)

      if (breakdown) {
        lines.push({
          id: 'sten',
          label: useExistingSten
            ? `Sten #${selectedLagerSten.id}`
            : 'Sten',
          amount: breakdown.total,
          dependencyKey: depKey,
          children: breakdown.lines.map((child, index) => ({
            id: `sten-child-${index}-${child.label}`,
            label: child.label,
            amount: child.amount,
            dependencyKey: depKey,
          })),
        })
      }
      continue
    }

    pushJobLine(lines, type, sten, priceConfig)
  }

  if (sockelChecked) {
    lines.push({
      id: 'sockel',
      label: 'Sockel',
      amount: priceConfig.SOCKEL_STANDARD,
      dependencyKey: 'sockel',
    })
  }

  return lines
}

export function flattenKostnadLines(lines) {
  const flat = []
  for (const line of lines) {
    if (line.children?.length) {
      for (const child of line.children) flat.push(child)
    } else {
      flat.push(line)
    }
  }
  return flat
}

/** Sum priced leaf amounts (children when present; otherwise the line itself). */
export function sumKostnadLines(lines) {
  let total = 0
  let hasPriced = false
  for (const line of flattenKostnadLines(lines)) {
    if (typeof line.amount === 'number') {
      total += line.amount
      hasPriced = true
    }
  }
  return hasPriced ? total : null
}

function formatAmount(amount) {
  if (typeof amount !== 'number') return 'Pris saknas.'
  return `${amount.toLocaleString('sv-SE')} kr`
}

/** Plain-text kostnadspecifikation for storing as a comment until backend support exists. */
export function formatKostnadspecifikationComment(lines, total) {
  if (!lines?.length) return ''

  const rows = ['Kostnadspecifikation']
  for (const line of lines) {
    rows.push(`${line.label}: ${formatAmount(line.amount)}`)
    if (line.children?.length) {
      for (const child of line.children) {
        rows.push(`  ${child.label}: ${formatAmount(child.amount)}`)
      }
    }
  }
  rows.push(`Totalt: ${formatAmount(total)}`)
  return rows.join('\n')
}

export function applyAmountOverrides(defaultLines, overrides) {
  return defaultLines.map((line) => {
    if (line.children?.length) {
      const children = line.children.map((child) => ({
        ...child,
        amount:
          child.id in overrides
            ? overrides[child.id]
            : child.amount,
      }))
      const childTotal = children.reduce(
        (sum, child) => sum + (typeof child.amount === 'number' ? child.amount : 0),
        0
      )
      const hasPricedChild = children.some((child) => typeof child.amount === 'number')
      return {
        ...line,
        children,
        amount: hasPricedChild ? childTotal : line.amount,
      }
    }
    return {
      ...line,
      amount: line.id in overrides ? overrides[line.id] : line.amount,
    }
  })
}

/** Drop overrides whose dependency key changed or whose line disappeared. */
export function reconcileOverrides(defaultLines, overrides, previousDepKeys) {
  const flat = flattenKostnadLines(defaultLines)
  const nextDepKeys = {}
  const nextOverrides = { ...overrides }
  let changed = false

  for (const line of flat) {
    nextDepKeys[line.id] = line.dependencyKey
    if (
      previousDepKeys[line.id] !== undefined &&
      previousDepKeys[line.id] !== line.dependencyKey &&
      line.id in nextOverrides
    ) {
      delete nextOverrides[line.id]
      changed = true
    }
  }

  for (const id of Object.keys(nextOverrides)) {
    if (!flat.some((line) => line.id === id)) {
      delete nextOverrides[id]
      changed = true
    }
  }

  return { overrides: nextOverrides, depKeys: nextDepKeys, changed }
}

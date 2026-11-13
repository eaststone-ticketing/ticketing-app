export const NON_COMBINABLE_TYPES = ['Ny sten', 'Lilla Dalen', 'Högalid']

export const COMBINABLE_TYPES = [
  'Nyinskription',
  'Stabilisering',
  'Rengöring',
  'Inspektion',
  'Ommålning',
  'Övrigt',
]

/** Can only be added when the required type is already present; never as the sole/first type. */
export const DEPENDENT_TYPES = {
  Omslipning: 'Nyinskription',
}

export function canCombineTypes(currentTypes) {
  return !currentTypes.some((type) => NON_COMBINABLE_TYPES.includes(type))
}

/**
 * Types that can be added via the + control.
 * When empty and `includeNonCombinableWhenEmpty`, Ny sten / Högalid / Lilla Dalen are offered as first type.
 */
export function getAvailableTypesToAdd(
  currentTypes,
  { includeNonCombinableWhenEmpty = false } = {}
) {
  if (!canCombineTypes(currentTypes)) return []

  const available = [
    ...COMBINABLE_TYPES.filter((type) => !currentTypes.includes(type)),
    ...Object.entries(DEPENDENT_TYPES)
      .filter(
        ([type, requiredType]) =>
          currentTypes.includes(requiredType) && !currentTypes.includes(type)
      )
      .map(([type]) => type),
  ]

  if (includeNonCombinableWhenEmpty && currentTypes.length === 0) {
    return [...NON_COMBINABLE_TYPES, ...available]
  }

  return available
}

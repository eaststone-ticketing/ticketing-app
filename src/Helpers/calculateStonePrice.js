import buildStonePriceBreakdown from './buildStonePriceBreakdown.js'

export default function calculateStonePrice(attr) {
  const breakdown = buildStonePriceBreakdown(attr)
  return breakdown ? breakdown.total : null
}

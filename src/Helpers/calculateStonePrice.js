import buildStonePriceBreakdown from './buildStonePriceBreakdown.js'
import { STONE_PRICE_CONFIG } from './stonePriceConfig.js'

export default function calculateStonePrice(attr, priceConfig = STONE_PRICE_CONFIG) {
  const breakdown = buildStonePriceBreakdown(attr, priceConfig)
  return breakdown ? breakdown.total : null
}

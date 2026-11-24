import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSetting, updateSetting } from '../api.js'
import { STONE_PRICE_CONFIG, mergePriceConfig } from './stonePriceConfig.js'

const PriceConfigContext = createContext({
  priceConfig: STONE_PRICE_CONFIG,
  setPriceConfig: () => {},
  reloadPriceConfig: async () => {},
  loading: true,
})

export function PriceConfigProvider({ children }) {
  const [priceConfig, setPriceConfigState] = useState(STONE_PRICE_CONFIG)
  const [loading, setLoading] = useState(true)

  const reloadPriceConfig = useCallback(async () => {
    setLoading(true)
    try {
      const row = await getSetting('priceConfig')
      if (row?.value) {
        setPriceConfigState(mergePriceConfig(row.value))
      } else {
        const seeded = mergePriceConfig(STONE_PRICE_CONFIG)
        await updateSetting('priceConfig', seeded)
        setPriceConfigState(seeded)
      }
    } catch (err) {
      console.error('Failed to load priceConfig:', err)
      setPriceConfigState(STONE_PRICE_CONFIG)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reloadPriceConfig()
  }, [reloadPriceConfig])

  const setPriceConfig = useCallback((next) => {
    setPriceConfigState(mergePriceConfig(next))
  }, [])

  const value = useMemo(
    () => ({ priceConfig, setPriceConfig, reloadPriceConfig, loading }),
    [priceConfig, setPriceConfig, reloadPriceConfig, loading]
  )

  return (
    <PriceConfigContext.Provider value={value}>
      {children}
    </PriceConfigContext.Provider>
  )
}

export function usePriceConfig() {
  return useContext(PriceConfigContext)
}

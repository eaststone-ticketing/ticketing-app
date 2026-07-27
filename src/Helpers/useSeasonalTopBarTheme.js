import { useEffect, useMemo, useState } from "react"
import {
  getActiveTopBarThemeId,
  getAvailableSeasonalTopBarThemes,
  loadEnabledTopBarThemeIds,
  saveEnabledTopBarThemeIds,
} from "./seasonalTopBarThemes.js"

export function useSeasonalTopBarTheme() {
  const availableThemes = useMemo(() => getAvailableSeasonalTopBarThemes(), [])
  const [enabledById, setEnabledById] = useState(loadEnabledTopBarThemeIds)

  const activeThemeId = useMemo(
    () => getActiveTopBarThemeId(enabledById),
    [enabledById]
  )

  useEffect(() => {
    if (activeThemeId) {
      document.documentElement.setAttribute("data-top-bar-theme", activeThemeId)
    } else {
      document.documentElement.removeAttribute("data-top-bar-theme")
    }
  }, [activeThemeId])

  useEffect(() => {
    saveEnabledTopBarThemeIds(enabledById)
  }, [enabledById])

  function toggleTheme(id) {
    setEnabledById((prev) => {
      const nextEnabled = !prev[id]
      const updated = {}

      for (const theme of availableThemes) {
        updated[theme.id] = false
      }

      if (nextEnabled) {
        updated[id] = true
      }

      return updated
    })
  }

  return { availableThemes, enabledById, toggleTheme }
}

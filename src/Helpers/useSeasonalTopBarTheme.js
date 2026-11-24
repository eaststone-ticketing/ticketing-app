import { useEffect, useMemo, useState } from "react"
import {
  getActiveTopBarThemeId,
  getAvailableSeasonalTopBarThemes,
  isPrideForcedOutOfSeason,
  loadEnabledTopBarThemeIds,
  saveEnabledTopBarThemeIds,
  setPrideForcedOutOfSeason,
  seasonalTopBarThemes,
} from "./seasonalTopBarThemes.js"

export function useSeasonalTopBarTheme() {
  const [prideForcedOutOfSeason, setPrideForcedOutOfSeasonState] = useState(
    isPrideForcedOutOfSeason
  )
  const [enabledById, setEnabledById] = useState(loadEnabledTopBarThemeIds)

  const availableThemes = useMemo(
    () => getAvailableSeasonalTopBarThemes(),
    [prideForcedOutOfSeason]
  )

  const activeThemeId = useMemo(
    () => getActiveTopBarThemeId(enabledById),
    [enabledById, prideForcedOutOfSeason]
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
  }, [enabledById, prideForcedOutOfSeason])

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

  /** Unlock (and turn on) pride theme even outside the seasonal window. */
  function setPrideThemeOutOfSeason(enabled) {
    setPrideForcedOutOfSeason(enabled)
    setPrideForcedOutOfSeasonState(enabled)

    setEnabledById((prev) => {
      const updated = {}
      for (const theme of seasonalTopBarThemes) {
        updated[theme.id] = false
      }

      if (enabled) {
        updated.pride = true
        localStorage.setItem("topBarTheme.pride", "true")
      } else {
        const pride = seasonalTopBarThemes.find((theme) => theme.id === "pride")
        if (pride && !pride.isInSeason()) {
          localStorage.setItem("topBarTheme.pride", "false")
        } else if (prev.pride) {
          updated.pride = true
        }
      }

      return updated
    })
  }

  return {
    availableThemes,
    enabledById,
    toggleTheme,
    prideForcedOutOfSeason,
    setPrideThemeOutOfSeason,
  }
}

export const seasonalTopBarThemes = [
  {
    id: "pride",
    icon: "🌈",
    title: "Pride-läge",
    enableLabel: "Aktivera pride-läge",
    disableLabel: "Stäng av pride-läge",
    isInSeason(date = new Date()) {
      const month = date.getMonth()
      const day = date.getDate()
      return (month === 6 && day >= 27) || (month === 7 && day <= 1)
    },
  },
]

export function getAvailableSeasonalTopBarThemes(date = new Date()) {
  return seasonalTopBarThemes.filter((theme) => theme.isInSeason(date))
}

export function loadEnabledTopBarThemeIds(date = new Date()) {
  const enabled = {}
  for (const theme of getAvailableSeasonalTopBarThemes(date)) {
    enabled[theme.id] = localStorage.getItem(`topBarTheme.${theme.id}`) === "true"
  }
  return enabled
}

export function saveEnabledTopBarThemeIds(enabledById, date = new Date()) {
  for (const theme of getAvailableSeasonalTopBarThemes(date)) {
    localStorage.setItem(
      `topBarTheme.${theme.id}`,
      enabledById[theme.id] ? "true" : "false"
    )
  }
}

export function getActiveTopBarThemeId(enabledById, date = new Date()) {
  const active = getAvailableSeasonalTopBarThemes(date).find((theme) => enabledById[theme.id])
  return active?.id ?? null
}

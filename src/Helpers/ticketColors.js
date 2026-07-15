export const statusColor = {
  "Nytt": ["var(--status-nytt-start)", "var(--status-nytt-end)"],
  "Väntar svar av kund": ["var(--status-vantar-svar-av-kund-start)", "var(--status-vantar-svar-av-kund-end)"],
  "Väntar svar av kyrkogård": ["var(--status-vantar-svar-av-kyrkogard-start)", "var(--status-vantar-svar-av-kyrkogard-end)"],
  "Väntar svar av kund och kyrkogård": ["var(--status-vantar-svar-av-kund-och-kyrkogard-start)", "var(--status-vantar-svar-av-kund-och-kyrkogard-end)"],
  "Godkänd av kund": ["var(--status-godkand-av-kund-start)", "var(--status-godkand-av-kund-end)"],
  "Godkänd av kund, väntar svar av kyrkogård": ["var(--status-godkand-av-kund-vantar-svar-av-kyrkogard-start)", "var(--status-godkand-av-kund-vantar-svar-av-kyrkogard-end)"],
  "Godkänd av kyrkogård": ["var(--status-godkand-av-kyrkogard-start)", "var(--status-godkand-av-kyrkogard-end)"],
  "Godkänd av kyrkogård, väntar svar av kund": ["var(--status-godkand-av-kyrkogard-vantar-svar-av-kund-start)", "var(--status-godkand-av-kyrkogard-vantar-svar-av-kund-end)"],
  "Redo": ["var(--status-redo-start)", "var(--status-redo-end)"],
  "Stängt": ["var(--status-stangt-start)", "var(--status-stangt-end)"],
  "LEGACY": ["var(--status-legacy-start)", "var(--status-legacy-end)"],
  "raderad": ["var(--status-raderad-start)", "var(--status-raderad-end)"],
};

export const typeColor = {
  "Ny sten": ["var(--type-ny-sten-start)", "var(--type-ny-sten-end)"],
  "Stabilisering": ["var(--type-stabilisering-start)", "var(--type-stabilisering-end)"],
  "Nyinskription": ["var(--type-nyinskription-start)", "var(--type-nyinskription-end)"],
  "Ommålning": ["var(--type-ommålning-start)", "var(--type-ommålning-end)"],
  "Rengöring": ["var(--type-rengöring-start)", "var(--type-rengöring-end)"],
  "Inspektering": ["var(--type-inspektering-start)", "var(--type-inspektering-end)"],
  "Övrigt": ["var(--type-ovrigt-start)", "var(--type-ovrigt-end)"],
  "Högalid": ["var(--type-hogalid-start)", "var(--type-hogalid-end)"],
  "Lilla Dalen": ["var(--type-lilla-dalen-start)", "var(--type-lilla-dalen-end)"],
};

export function ticketColorStyle(status, arendeTyp) {
  return {
    "--status-color-start": statusColor[status]?.[0] || "transparent",
    "--status-color-end": statusColor[status]?.[1] || "transparent",
    "--arendeType-color-start": typeColor[arendeTyp]?.[0] || "transparent",
    "--arende-type-color-end": typeColor[arendeTyp]?.[1] || "transparent",
  };
}

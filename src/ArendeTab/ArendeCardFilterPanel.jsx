import './ArendeCardFilterPanel.css'

export default function ArendeCardFilterPanel({
  typeToSearch,
  resultSorted,
  setFilter,
  findTicketAmount
}) {

  const filters = [
    { statuses: [], label: "Alla", key: "all" },
    { statuses: ["nytt", "väntar svar av kund", "väntar svar av kyrkogård"], label: "Nya", key: "Nytt" },
    { statuses: ["godkänd av kund", "godkänd av kund, väntar svar av kyrkogård"], label: "Godkänt av kund", key: "Godkänd av kund" },
    { statuses: ["godkänd av kyrkogård", "godkänd av kyrkogård, väntar svar av kund"], label: "Godkänt av kyrkogård", key: "Godkänd av kyrkogård" },
    { statuses: ["redo"], label: "Redo", key: "Redo" },
    { statuses: ["väntar svar av kund", "väntar svar av kyrkogård", "Godkänd av kund, väntar svar av kyrkogård", "Godkänd av kyrkogård, väntar svar av kund", "Väntar svar av kund och kyrkogård"], label: "Väntande", key: "Väntande" }
  ];

  return (
    <div className="arende-card-filter-panel">
    <div className = "filter">
      {filters.map(({ statuses, label, key }) => (
        <button
          key={key}
          onClick={() => setFilter(statuses)}
        >
          {label} ({findTicketAmount(key, resultSorted, typeToSearch)})
        </button>
      ))}
    </div>
      <select>
        <option>
          Sortera efter:
        </option>
        <option>
          Nyaste
        </option>
        <option>
          Äldsta  
        </option>
        <option>
          Namn
        </option>
        <option>
          Kyrkogård
        </option>
      </select>
    </div>
  );
}

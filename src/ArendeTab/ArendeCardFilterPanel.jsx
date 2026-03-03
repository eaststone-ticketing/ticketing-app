import './ArendeCardFilterPanel.css'

export default function ArendeCardFilterPanel({
  typeToSearch,
  ursprungToSearch,
  resultSorted,
  setFilter,
  setSorting,
  sorting,
  findTicketAmount
}) {

  const filters = [
    { statuses: [], label: "Alla", key: "all" },
    { statuses: ["nytt", "väntar svar av kund", "väntar svar av kyrkogård", "väntar svar av kund och kyrkogård"], label: "Nya", key: "Nytt" },
    { statuses: ["godkänd av kund", "godkänd av kund, väntar svar av kyrkogård"], label: "Godkänt av kund", key: "Godkänd av kund" },
    { statuses: ["godkänd av kyrkogård", "godkänd av kyrkogård, väntar svar av kund"], label: "Godkänt av kyrkogård", key: "Godkänd av kyrkogård" },
    { statuses: ["redo"], label: "Redo", key: "Redo" },
    { statuses: ["väntar svar av kund", "väntar svar av kyrkogård", "Godkänd av kund, väntar svar av kyrkogård", "Godkänd av kyrkogård, väntar svar av kund", "Väntar svar av kund och kyrkogård"], label: "Väntande", key: "Väntande" }
  ];

  return (
    <div className="arende-card-filter-panel">
    <div className = "filter">
      {filters.map(({ statuses, label, key }) => (
        <button className = "filter-button"
          key={key}
          onClick={() => setFilter(statuses)}
        >
          {label} ({findTicketAmount(key, resultSorted, typeToSearch, ursprungToSearch)})
        </button>
      ))}
    </div>
      <span className = "sortera-efter" >Sortera efter: </span>
      <button className = {sorting === "Nyaste" ? "arende-card-filter-panel-selected-button" : "arende-card-filter-panel-transparent-button"} onClick ={() => setSorting("Nyaste")}>Nyaste</button>
      <button className = {sorting === "Äldsta" ? "arende-card-filter-panel-selected-button" : "arende-card-filter-panel-transparent-button"} onClick ={() => setSorting("Äldsta")}>Äldsta</button>
      <button className = {sorting === "Status" ? "arende-card-filter-panel-selected-button" : "arende-card-filter-panel-transparent-button"} onClick ={() => setSorting("Status")}>Status</button>
    </div>
  );
}

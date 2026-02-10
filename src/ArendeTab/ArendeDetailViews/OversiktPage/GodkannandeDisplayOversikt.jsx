import handleStatusChange from '../../../handleStatusChange.jsx'


 function displayGodkannande(g, godkannare) {
  if (!g || g.length === 0) return <></>;

  const godkannande = g.find(x => x.godkannare === godkannare);
  if (!godkannande) return <></>;

  return (
    <div className="godkannande-info">
      <p>Godkänt: {godkannande.datum}</p>
      <p>Källa: {godkannande.kalla}</p>
    </div>
  );
}


export function GodkannandeDisplayOversikt({activeArende, activeGodkannanden, setArenden, setActiveArende, setActiveGodkannanden}){

    return <div>
            <h3>Godkännanden</h3>
            <div className = "arende-detail-checkboxes">
                <label><strong>Godkänd av kund</strong></label>
                <input type = "checkbox" name = "godkandKund" checked = {activeArende.status === "Godkänd av kund" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt" || activeArende.status == "Godkänd av kund, väntar svar av kyrkogård"}  onChange = {()=> handleStatusChange("kund", activeArende, setArenden, setActiveGodkannanden, setActiveArende)}></input>
            </div>
            <div className = "godkannande-info">{activeGodkannanden && displayGodkannande(activeGodkannanden, "kund")}</div>
                <div className = "arende-detail-checkboxes">
                    <label><strong>Godkänd av kyrkogård</strong></label>
                    <input type = "checkbox" name = "godkandKyrkogard" checked = {activeArende.status === "Godkänd av kyrkogård" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt" || activeArende.status == "Godkänd av kyrkogård, väntar svar av kund"} onChange = {() => handleStatusChange("kyrkogård", activeArende, setArenden,  setActiveGodkannanden, setActiveArende)}></input>
                </div>
            <div className = "godkannande-info">{activeGodkannanden && displayGodkannande(activeGodkannanden, "kyrkogård")}</div>
          </div>
}
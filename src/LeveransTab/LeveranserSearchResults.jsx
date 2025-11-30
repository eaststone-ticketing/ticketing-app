    
export default function LeveranserSearchResults({leveranser, leverantorer, leverantor, leverantorId, setLeverantorView, setLeveransView}){

    function findLeverantor(namn){
        return leverantorer.find(l => l.namn === namn) 
    }

    return <div>
        {leveranser.filter(l => 
        (l.idFranLeverantor?.toLowerCase().includes(leverantorId?.toLowerCase()) || leverantorId === null || leverantorId === "")
        && (l.leverantor?.toLowerCase().includes(leverantor?.toLowerCase()) || leverantor === null || leverantor === "")
        ).map(l =>
            <div className = "leverans-card">
                <h3 onClick = {() => setLeveransView(l)}>{l.idFranLeverantor}</h3>
                <div className = "leverantor-text">
                <p>Leverantör:</p> <p className = "leverantor-link" onClick = {() => setLeverantorView(findLeverantor(l.leverantor))}>{l.leverantor}</p>
                </div>
                <p>Status: {l.status}</p>
            </div>
        )}
        </div>}
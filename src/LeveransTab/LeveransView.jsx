
export default function LeveransView({leverans, setLeveransView}) {

    return <div>
        <button onClick = {() => setLeveransView(null)}>Tillbaka</button>
        <p>{leverans.idFranLeverantor}</p>
    </div>
}
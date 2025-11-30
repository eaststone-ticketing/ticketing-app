
export default function LeverantorView({leverantor, setLeverantorView}) {

    return <div>
        <button onClick = {() => setLeverantorView(null)}>Tillbaka</button>
        <p>{leverantor.namn}</p>
    </div>
}
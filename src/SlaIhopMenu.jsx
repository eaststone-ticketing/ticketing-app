import {useState} from 'react'
import './SlaIhopMenu.css'
import {getArenden, updateArende, removeKyrkogard, getKyrkogardar} from './api.js'

export default function SlaIhopMenu({kyrkogardar, setKyrkogardar, setKyrkogardTabState}) {
    const [sokt, setSokt] = useState("")
    const [mergeList, setMergeList] = useState([])
    const [huvudkyrkogard, setHuvudkyrkogard] = useState(null)

    async function MergeKyrkogardar(huvudkyrkogard, mergeList){

        const isConfirmed = window.confirm("Är du säker på att du vill slå ihop?")

        if(!isConfirmed) return

        if(mergeList.length >= 1 && !huvudkyrkogard){
            window.alert("Ingen huvudkyrkogård")
            return
        }

        if(huvudkyrkogard && mergeList.length === 0){
            window.alert("Inga kyrkogårdar att slå ihop")
            return
        }

        if (!huvudkyrkogard && mergeList.length === 0){
            window.alert("Ingen huvudkyrkogård eller kyrkogårdar att slå ihop")
            return
        }

        try {
            const arenden = await getArenden()
            const arendenToReassign = arenden.filter(a => mergeList.some(m => m.namn === a.kyrkogard))
            for ( const arende of arendenToReassign){
                const newArende = {...arende, kyrkogard: huvudkyrkogard.namn}
                await updateArende(arende.id, newArende)
            }

            for (const kyrkogard of mergeList){
                await removeKyrkogard(kyrkogard.id)
            }
        } catch (err) {
            console.error("Merge error:", err)
            window.alert("Något gick fel under sammanslagningen. Listan uppdateras med det som hann genomföras.")
        } finally {
            // Always re-sync with the backend and reset the selections,
            // even if the merge only partially succeeded.
            const updatedKyrkogardar = await getKyrkogardar()
            setKyrkogardar(updatedKyrkogardar)
            setMergeList([])
            setHuvudkyrkogard(null)
        }
    }

    function AddToMergeList(kyrkogard) {
        setMergeList(prev => [...prev, kyrkogard]);
    }

    function RemoveFromMergeList(kyrkogard) {
        setMergeList(mergeList.filter(m=> m.id !== kyrkogard.id))
    }

    return <div className = "sla-ihop-root">
        <button className = "sla-ihop-back-button" onClick = {() => setKyrkogardTabState(null)}>← Tillbaka</button>
        <div className = "SlaIhopMenu">
            <div className = "sla-ihop-column">
                <form>
                    <label>Sök kyrkogård</label>
                    <input onChange = {(e)=> setSokt(e.target.value)}></input>
                </form>
                <div className = "sla-ihop-search-list">
                    {kyrkogardar.filter(k => k.namn !== null && k.namn.toLowerCase().includes(sokt.toLowerCase()) && !mergeList.some(m => m.id === k.id) && k !== huvudkyrkogard).map(k => <div key = {k.id} className = "kyrkogard-and-assign-button">
                        <p>{k.namn}</p>
                        <button title = "Lägg till i listan" onClick = {() => AddToMergeList(k)}>→</button>
                        <button onClick = {() => setHuvudkyrkogard(k)}>Välj huvudkyrkogård</button>
                    </div>
                    )}
                </div>
            </div>
            <div className = "sla-ihop-column sla-ihop-merge-column">
                <h4>Huvudkyrkogård</h4>
                <p>{huvudkyrkogard ? huvudkyrkogard.namn : "Ingen vald"}</p>
                <h4>Kyrkogårdar att slå ihop</h4>
                <div className = "sla-ihop-merge-list">
                    {mergeList.length === 0 && <p>Inga kyrkogårdar tillagda ännu.</p>}
                    {mergeList.map(k => <div key = {k.id} className = "kyrkogard-and-assign-button">
                        <button title = "Ta bort ur listan" onClick = {() => RemoveFromMergeList(k)}>←</button>
                        <p>{k.namn}</p>
                        </div>)}
                </div>
                <button className = "sla-ihop-confirm-button" disabled={!huvudkyrkogard || mergeList.length === 0} onClick = {() => MergeKyrkogardar(huvudkyrkogard, mergeList)}>Slå ihop till {huvudkyrkogard?.namn ?? "..."}</button>
            </div>
        </div>
    </div>
}

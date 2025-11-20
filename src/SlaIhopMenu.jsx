import {useState} from 'react'
import './SlaIhopMenu.css'
import {getArenden, updateArende, removeKyrkogard} from './api.js'

export default function SlaIhopMenu({kyrkogardar, setKyrkogardar}) {
    const [sokt, setSokt] = useState("")
    const [mergeList, setMergeList] = useState([])
    const [huvudkyrkogard, setHuvudkyrkogard] = useState(null)

    async function MergeKyrkogardar(huvudkyrkogard, mergeList){

        const isConfirmed = window.confirm("Är du säker på att du vill slå ihop?")
        
        if(isConfirmed){
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

            if(mergeList.length >= 1 && huvudkyrkogard){
                const arenden = await getArenden()
                const arendenToReassign = arenden.filter(a => mergeList.some(m => m.namn === a.kyrkogard))
                for ( const arende of arendenToReassign){
                    const newArende = {...arende, kyrkogard: huvudkyrkogard.namn}
                    await updateArende(arende.id, newArende)
                }

                for (const kyrkogard of mergeList){
                    await removeKyrkogard(kyrkogard.id)
                }
            } 
        } else {

        }

    }

    function AddToMergeList(kyrkogard) {
        setMergeList(prev => [...prev, kyrkogard]);
    }

    function RemoveFromMergeList(kyrkogard) {
        setMergeList(mergeList.filter(m=> m.id !== kyrkogard.id))
    }
    return <div className = "SlaIhopMenu">
        <div>
            <form>
                <label>Sök kyrkogård</label>
                <input onChange = {(e)=> setSokt(e.target.value)}></input>
            </form>
            <div>
                {kyrkogardar.filter(k => k.namn !== null && k.namn.toLowerCase().includes(sokt.toLowerCase()) && !mergeList.some(m => m.id === k.id) && k !== huvudkyrkogard).map(k => <div  className = "kyrkogard-and-assign-button">
                    <p>{k.namn}</p>
                    <button onClick = {() => AddToMergeList(k)}>→</button>
                    <button onClick = {() => setHuvudkyrkogard(k)}>Välj huvudkyrkogård</button>
            </div>
            )}
            </div>
        </div>
        <div>
            <h4>Kyrkogårdar att slå ihop</h4>
            {mergeList.map(k => <div className = "kyrkogard-and-assign-button">
                <button onClick = {() => RemoveFromMergeList(k)}> ← </button>
                <p>{k.namn}</p>
                </div>)}
        </div>
        <div>
        <button disabled={!huvudkyrkogard || mergeList.length === 0} onClick = {() => MergeKyrkogardar(huvudkyrkogard, mergeList)}>Slå ihop till {huvudkyrkogard?.namn}</button>
        </div>
    </div>
}
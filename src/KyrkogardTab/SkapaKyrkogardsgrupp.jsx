import { useState } from 'react'
import {updateKyrkogard, getKyrkogardar} from '../api.js'
import './SkapaKyrkogardsgrupp.css'

export default function SkapaKyrkogardsgrupp({setKyrkogardTabState, kyrkogardar, setKyrkogardar}) {
    const [sokt, setSokt] = useState("")
    const [gruppnamn, setGruppnamn] = useState("")
    const [grupp, setGrupp] = useState([])

    async function skapaGrupp(grupp, gruppnamn){
        
        if(!gruppnamn || gruppnamn === ""){
            window.alert("Inget gruppnamn valt")
        }
        const isConfirmed = window.confirm(`Är du säker att du vill skapa gruppen ${gruppnamn}`)

        if(isConfirmed){
            for (const kyrkogard of grupp) {
                const newKyrkogard = {...kyrkogard, kyrkogard_grupp: gruppnamn}
                console.log(newKyrkogard)
                await updateKyrkogard(kyrkogard.id, newKyrkogard)
            }
            const updatedKyrkogardar = await getKyrkogardar()
            setKyrkogardar(updatedKyrkogardar)
        }
    }
    return <div className = "skapa-kyrkogardsgrupp-menu">   
        <div>
            <button onClick = {() => setKyrkogardTabState(null)}>Tillbaka</button>
            <form>
                <label>Sök kyrkogård</label>
                <input onChange = {(e)=> setSokt(e.target.value)}></input>
            </form>
            <div>
                {kyrkogardar.filter(k => k.namn !== null && k.namn.toLowerCase().includes(sokt.toLowerCase()) && !grupp.some(m => m.id === k.id)).map(k => <div  className = "kyrkogard-and-assign-button">
                    <p>{k.namn}</p>
                    <button onClick = {() => setGrupp(prev => [...prev, k])}>Lägg till i gruppering →</button>
            </div>
            )}
            </div>
        </div>

        <div>
            <form>
                <label>Namnge kyrkogårdsgruppering</label>
                <input onChange = {(e)=> setGruppnamn(e.target.value)}></input>
                </form>
            {grupp.map(k => <div>
                <div className = "kyrkogard-and-assign-button">
                    <p>{k.namn}</p>
                    <button onClick = {() => setGrupp(prev => prev.filter(m => {m.id !== k.id}))}>X</button>
                </div>
            </div>)}
            <button disabled = {(!gruppnamn || grupp.length < 1)} onClick = { async () => await skapaGrupp(grupp, gruppnamn)}>Skapa kyrkogårdsgruppering</button>
            
        </div>
    </div>
}
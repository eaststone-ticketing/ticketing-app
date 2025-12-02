import { useEffect, useState } from 'react'
import "./LeveransView.css"
import {getArenden} from '../api.js'

async function findArende(id){
    const arenden = await getArenden();
    const arende = arenden.find(a => a.id === id);
    return arende;
}

export default function LeveransView({setActiveTab, setActiveArende, leverans, setLeveransView}) {

    const [viewAssociatedTickets, setViewAssociatedArenden] = useState(false)
    const [arenden, setArenden] = useState([])

    useEffect(() => {
        async function load() {
        const data = await getArenden()
        setArenden(data)
        }
        load()
    }, [])

    return <div>
        {viewAssociatedTickets && <div className = "aa-menu">
            <button onClick = {() => setViewAssociatedArenden(false)}>Tillbaka</button>
            <div className = "associated-arenden-container">
            <h2>Tillhörande ärenden</h2>
            <div className = "associated-arenden-field">
            {leverans.arenden.map(id => {
                const arende = arenden.find(a => a.id === id)
                return <div className = "associated-arende-entry">
                    <p onClick = {() => {setActiveArende(arende); setActiveTab("Ärenden")}}>#{arende.id} {arende.avlidenNamn}</p>
                </div>
            }
            )}
            </div>
            </div>
            </div>}
        {!viewAssociatedTickets && <div  className = "leverans-menu">    
        <div className = "leverans-button-panel">
        <button onClick = {() => setLeveransView(null)}>Tillbaka</button>
        <button onClick = {() => setViewAssociatedArenden(true)}>Tillhörande ärenden ({leverans.arenden?.length})</button>
        </div>
        <div className = "leverans-info-sheet">
        <div classname = "leverans-details">
            <h2>{leverans.idFranLeverantor}</h2>
            <p>Leverantör: <strong>{leverans.leverantor}</strong></p>
            <p>Status: <strong>{leverans.status}</strong></p>
        </div>
        <div className = "leverans-innehall">
            <h2>Innehåll</h2>
            {leverans.innehall.map(i => 
                <p>{i}</p>
            )}
        </div>
        </div>
        </div>
        }
    </div>
}
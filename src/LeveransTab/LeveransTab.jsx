import "./LeveransTab.css"
import LeveranserSearchMenu from './LeveranserSearchMenu'
import LeveranserSearchResults from './LeveranserSearchResults'
import LeverantorView from './LeverantorView.jsx'
import LeveransView from './LeveransView.jsx'
import { useState } from 'react'

const leveranser = [
    {
        idFranLeverantor: "HBQ110324",
        leverantor: "Haobo",
        contents: ["SB GH002", "PG LS21", "CC LS02"],
        status: "Beställd"
    }
]

const leverantorer = [
    {
        namn: "Haobo",
        bestallningVidMangd: 40
    }
]

export default function LeveransTab() {

    const [leverantor, setLeverantor] = useState(null);
    const [leverantorId, setLeverantorId] = useState(null);
    
    const[leveransView, setLeveransView] = useState(null);
    const[leverantorView, setLeverantorView] = useState(null);

    return <div>
        {leverantorView !== null && <LeverantorView setLeverantorView = {setLeverantorView} leverantor = {leverantorView} />}
        {leveransView !== null && <LeveransView setLeveransView = {setLeveransView} leverans = {leveransView} />}
        { (!leveransView && !leverantorView) && <div className = "leverans-header">
        <button><strong>+ Lägg till leverans</strong> </button>
            <div className = "leverans-body">
                <LeveranserSearchMenu setLeverantor = {setLeverantor} setLeverantorId = {setLeverantorId}/>
                <div className = "leverans-results-container">
                    <LeveranserSearchResults leveranser = {leveranser} leverantorer = {leverantorer} leverantor = {leverantor} leverantorId = {leverantorId} setLeverantorView = {setLeverantorView} setLeveransView = {setLeveransView}/>
                </div>
            </div>
        </div>}
    </div>
    
}
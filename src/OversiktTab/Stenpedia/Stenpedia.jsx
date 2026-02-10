import './Stenpedia.css'
import {Stenar} from './Contents/Stenar.jsx'
import {StenpediaWelcomePage} from './Contents/StenpediaWelcomePage.jsx'
import {useState} from 'react'

export function Stenpedia({setOversiktViewState}) {

    return <div className = "stenpedia-main">
        
        <div className = "stenpedia-content">
            <button className = "stenpedia-backbutton" onClick = {() => setOversiktViewState(null)}>← Tillbaka</button>
            <Stenar />
        </div>
    </div>

}
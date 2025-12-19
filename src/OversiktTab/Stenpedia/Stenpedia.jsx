import './Stenpedia.css'
import {Stenar} from './Contents/Stenar.jsx'
import {StenpediaWelcomePage} from './Contents/StenpediaWelcomePage.jsx'
import {useState} from 'react'

export function Stenpedia() {

    const [stenpediaState, setStenpediaState] = useState(null)
    
    return <div className = "stenpedia-main">
        
            <div className = "stenpedia-button-panel">
            <button onClick = {() => setStenpediaState("Stenar")}>Stenar</button>
        </div>
        <div className = "stenpedia-content">
            {!stenpediaState && <StenpediaWelcomePage />}
            {stenpediaState === "Stenar" && <Stenar />}
        </div>
    </div>

}
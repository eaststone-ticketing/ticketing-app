import { getStenar } from '../../../api.js'
import {useState, useEffect} from 'react'
import{AddStoneForm} from './AddStoneForm.jsx'
import {StenEntry} from './StenEntry.jsx'
import './Stenar.css'

export function Stenar() {

    const [isStoneFormVisible, setIsStoneFormVisible] = useState(false)
    const [stoneToShow, setStoneToShow] = useState(null)
    const [stenar, setStenar] = useState([])

      useEffect(() => {
      async function loadStenar() {
        try {
        const data = await getStenar(); 
        setStenar(data); 
        } catch(err){
            console.error(err)
            console.log("Failed to get stenar")
        } 
      }
      loadStenar(); 
      }, []);

    return <div>
    <div className = "stone-page-main">
    {!isStoneFormVisible && <div className = "stenpedia-stone-button-panel">{stenar.map(s =>
            <div key = {s.id} className = "stone-button">
            <button onClick = {() => setStoneToShow(s.id)}>{s.namn}</button>
            </div>
        )}
    <button onClick = {() => {setIsStoneFormVisible(true); setStoneToShow(null)}}>+Lägg till sten</button>
    </div>}
    {stoneToShow !== null && <StenEntry sten = {stenar.find(s => s.id === stoneToShow)} setStenar = {setStenar}/>}
    </div>

    {isStoneFormVisible && <AddStoneForm setIsStoneFormVisible = {setIsStoneFormVisible} setStenar = {setStenar}/>}
    </div>
    
}
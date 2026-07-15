import {getArenden} from '../api.js'
import {useEffect, useState} from 'react'
import MobileDetailView from './MobileDetailView.jsx'
import { BsTelephone } from "react-icons/bs";
import { HiOutlineMail } from "react-icons/hi";
import { IoPersonOutline } from "react-icons/io5";
import './MobileApp.css'
import { ticketColorStyle } from '../Helpers/ticketColors.js'

export default function MobileApp(user){

function sortResults(result, mode) {

    if (mode === "default"){
        return result.sort((a,b) => b.id - a.id);   
    }
    else if (mode === "Nyaste"){
      return result.sort((a,b) => b.id - a.id);
    }
    else if (mode === "Äldsta"){
      return result.sort((a,b) => a.id - b.id);
    }
    else {
        return result.sort((a,b) => b.id - a.id);  
    }
  }

    

    const [activeArende, setActiveArende] = useState(null);
    const [searchedArende, setSearchedArende] = useState("");
    const [arenden, setArenden] = useState([])
    const [arendeLimit, setArendeLimit] = useState(50)
    const [mode, setMode] = useState("default")

    const arendenSorted = sortResults(arenden, mode)

    useEffect(() => {
      async function loadArenden() {
        const data = await getArenden(); 
        setArenden(data); 
      }
      loadArenden(); 
      }, []);

    return <div>

    {activeArende && <div>
        <MobileDetailView arende = {activeArende} setActiveArende = {setActiveArende} />
    </div>}
    
    {!activeArende && <div>
        <div className = "filter-panel">
        <div>
            <input value = {searchedArende} onChange = {(e) => setSearchedArende(e.target.value)}></input>
        </div>

        <div className = "filter-buttons">
            <button onClick = {() => setMode("Nyaste")}>Nyast</button>
            <button onClick = {() => setMode("Äldsta")}>Äldst</button>
        </div>
        </div>


        <div>
        {arendenSorted.filter((arende) => (arende.avlidenNamn ?? "").toLowerCase().includes(searchedArende.toLowerCase()) && arende.status !== "LEGACY" && arende.status !== "raderad").slice(0,arendeLimit).map((arende) =>
            <div key={arende.id} className= "arende-card-ny-mobile"
              style={ticketColorStyle(arende.status, arende.arendeTyp)}>
              <div>
              <h3 className = "truncate" onClick={() => setActiveArende(arende)}>{arende.avlidenNamn}: {arende.status}</h3>
              <div className = "arende-typ-checkboxes-and-header">
              <h4 className = "dense-h4">{arende.arendeTyp}</h4>
              </div>
              </div>
            </div>
        )}
        </div>
        <button onClick = {() => setArendeLimit(arendeLimit+50)}>Ladda fler</button>
        </div>}
        </div>
}
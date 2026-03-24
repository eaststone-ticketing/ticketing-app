import {getArenden} from '../api.js'
import {useEffect, useState} from 'react'
import { BsTelephone } from "react-icons/bs";
import { HiOutlineMail } from "react-icons/hi";
import { IoPersonOutline } from "react-icons/io5";
import './MobileApp.css'

export default function MobileApp(user){

    const statusColor = {
    "Nytt": ["rgb(200,155,255)", "rgb(200,198,255)"],
    "Väntar svar av kund":["rgb(200,155,255)", "rgb(255, 225, 115)"],
    "Väntar svar av kyrkogård":["rgb(200,155,255)", "rgb(243, 100, 255)"],
    "Väntar svar av kund och kyrkogård":["rgb(200,155,255)", "rgb(123, 245, 200)"],
    "Godkänd av kund" : ["rgb(240, 245, 145)", "rgb(255, 225, 115)"],
    "Godkänd av kund, väntar svar av kyrkogård" : ["rgb(240, 245, 145)","rgb(243, 100, 255)"],
    "Godkänd av kyrkogård" : ["rgb(243, 145, 228)", "rgb(243, 100, 255) "],
    "Godkänd av kyrkogård, väntar svar av kund" : ["rgb(243, 145, 228)", "rgb(255, 225, 115)"],
    "Redo" : ["rgb(153, 245, 153)",  "rgb(123, 245, 200)"],
    "Stängt" : ["rgb(196, 196, 196)", "rgb(199, 199, 199)"],
    "LEGACY" : ["rgb(213, 223, 215)",  "rgb(223, 233, 225)"],
    "raderad" : ["rgb(200,155,255)", "rgb(200,198,255)"]
  }

  const typeColor = {
    "Ny sten": ["rgba(211, 229, 255, 1)", "rgba(211, 229, 255, 1)"],
    "Stabilisering": ["rgba(245, 211, 179, 1)", "rgba(245, 211, 179, 1)"],
    "Nyinskription": ["rgba(255, 211, 242, 1)", "rgba(255, 211, 242, 1)"],
    "Ommålning": ["rgba(255, 211, 211, 1)", "rgba(255, 211, 211, 1)"],
    "Rengöring": ["rgba(255, 248, 211, 1)", "rgba(255, 248, 211, 1)"],
    "Inspektering": ["rgba(252, 255, 211, 1)", "rgba(252, 255, 211, 1)"],
    "Övrigt" : ["rgba(200, 200, 200, 1)", "rgba(200, 200, 200, 1)"]
  }

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

    

    const [arende, setActiveArende] = useState(null);
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
              style={{
              '--status-color-start': statusColor[arende.status]?.[0] || 'transparent',
              '--status-color-end': statusColor[arende.status]?.[1] || 'transparent',
              '--arendeType-color-start': typeColor[arende.arendeTyp]?.[0] || 'transparent',
              '--arende-type-color-end': typeColor[arende.arendeTyp]?.[1] || 'transparent'}}>
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
        </div>
}
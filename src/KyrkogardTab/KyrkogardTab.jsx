import { useState, useEffect } from 'react'
import { removeKyrkogard } from "../api.js";
import SlaIhopMenu from '../SlaIhopMenu'
import SkapaKyrkogardsgrupp from './SkapaKyrkogardsgrupp.jsx'
import KyrkogardView from './KyrkogardView/KyrkogardView.jsx'
import KyrkogardForm from './KyrkogardForm.jsx'

export default function KyrkogardTab({kyrkogardar, setKyrkogardar, arenden, setActiveTab, setActiveArende, kyrkogardToOpen, setKyrkogardToOpen}) {

  const [formVisible, setFormVisible] = useState(false);
  const [activeKyrkogard, setActiveKyrkogard] = useState(null);
  const [redigering, setRedigering] = useState(false);
  const [kyrkogardTabState, setKyrkogardTabState] = useState(null);
  const [searchNamn, setSearchNamn] = useState("");
  const [searchGrupp, setSearchGrupp] = useState("");
  const [loadMax, setLoadMax] = useState(50);

  useEffect(() => {
    if (kyrkogardToOpen) {
      setActiveKyrkogard(kyrkogardToOpen);
      setKyrkogardTabState(kyrkogardToOpen.id);
      setKyrkogardToOpen(null);
    }
  }, [kyrkogardToOpen, setKyrkogardToOpen]);

  async function handleDelete(id) {
  try {
    await removeKyrkogard(id); // call backend
    setKyrkogardar(kyrkogardar.filter(k => k.id !== id)); // update state
  } catch (err) {
    console.error("Error deleting kyrkogård:", err);
  }
}

  const [formData, setFormData] = useState({
      namn: "",
      kontaktperson: "",
      email: "",
      telefonnummer: "",
      address: "",
      ort: "",
      postnummer: ""
    })

  return <div className = "kyrkogard-tab">
    {kyrkogardTabState === null && <div className = "kyrkogard-list-section">
    <div className = "kyrkogard-tab-buttons">
    <button onClick = {() => setFormVisible(!formVisible)} className = "add-kyrkogard-button create-button">+ Lägg till kyrkogård</button>
    <button onClick = {() => setKyrkogardTabState("skapagrupp")} className = "add-kyrkogard-button">Skapa kyrkogårdsgruppering</button>
    <button onClick = {() => setKyrkogardTabState("slaihop")} className = "add-kyrkogard-button">Slå ihop flera kyrkogårdar</button>
    </div>
    {formVisible && <KyrkogardForm kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} formData = {formData} setFormData = {setFormData} />}
  <div className = "kyrkogard-main">
      <form className = "searchbar-kyrkogard">
      <h3>Sök kyrkogård</h3>
      <div className = "input-field-searchbar-kund">
      <label>Namn på kyrkogård</label>
      <input type = "text" name = "namn" onChange = {(e) => setSearchNamn(e.target.value)}></input>
      </div>
      <div className = "input-field-searchbar-kund">
      <label>Kyrkogårdsgrupp</label>
      <input type = "text" name = "grupp" onChange = {(e) => setSearchGrupp(e.target.value)} ></input>
      </div>
      </form>
  <div className = "kyrkogard-list">
  {[...kyrkogardar].filter(k => k && k.namn && k.namn.toLowerCase().includes(searchNamn.toLowerCase()) && (k.kyrkogard_grupp?.toLowerCase().includes(searchGrupp.toLowerCase()) || searchGrupp === "")).sort((a, b) => (a.namn ?? "").localeCompare((b.namn ?? ""))).slice(0,loadMax).map((kyrkogard) => (
    <div key={kyrkogard.id} className="kyrkogard-card" onClick={() => {setActiveKyrkogard(kyrkogard); setKyrkogardTabState(kyrkogard.id); console.log(kyrkogard)}}>
      <div className = "kyrkogard-card-header">
      <h3>{kyrkogard.namn}</h3>
      <div>
      <button onClick = {() => {setRedigering(true);}} className = "edit-button">Redigera</button>    
      <button onClick = {(e) =>{e.stopPropagation(); handleDelete(kyrkogard.id);}} className = "del-button">Radera</button> 
      </div> 
      </div>
      <p>Adress: {kyrkogard.address}</p>
      <p>Kontakt: {kyrkogard.kontaktperson}</p>
      <p>Email: {kyrkogard.email}</p>
      <p>Kyrkogårdsnummer: {kyrkogard.id}</p>
    </div>
  ))}
  <button className = "load-more-button-kyrkogard" onClick = {() => setLoadMax(loadMax + 50)}>↓ Ladda fler kyrkogårdar ↓</button>
  </div>
  </div>
    </div>
}
{kyrkogardTabState === "slaihop" && <SlaIhopMenu kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} setKyrkogardTabState = {setKyrkogardTabState} />}
{kyrkogardTabState === "skapagrupp" && <SkapaKyrkogardsgrupp setKyrkogardTabState = {setKyrkogardTabState} kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar}/>}
{(activeKyrkogard !== null) && <KyrkogardView setKyrkogardTabState = {setKyrkogardTabState} activeKyrkogard = {activeKyrkogard} setRedigering = {setRedigering} setKyrkogardar = {setKyrkogardar} redigering = {redigering} setActiveKyrkogard = {setActiveKyrkogard} kyrkogardar = {kyrkogardar} arenden = {arenden} setActiveTab = {setActiveTab} setActiveArende = {setActiveArende}/>}
</div>
}

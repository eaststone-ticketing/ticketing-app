import './KyrkogardView.css'
import {useState} from 'react'
import {updateKyrkogard, getKyrkogardar } from '../../api.js'
import {addRule} from './rulehandling.js'
import RegelEntry from './RegelEntry.jsx'
import linkToArende from '../../Helpers/linkToArende.js'

export default function KyrkogardView({setKyrkogardTabState, setRedigering, setKyrkogardar, redigering, setActiveKyrkogard, activeKyrkogard, arenden = [], setActiveTab, setActiveArende}) {

  const [addRuleEnabled, setAddRuleEnabled] = useState(false)
  const [currentNewRule, setCurrentNewRule] = useState("")
  const [activeDetailTab, setActiveDetailTab] = useState("info")
  const [formData, setFormData] = useState({
    namn: activeKyrkogard.namn,
    kontaktperson: activeKyrkogard.kontaktperson,
    email: activeKyrkogard.email,
    telefonnummer: activeKyrkogard.telefonnummer,
    address: activeKyrkogard.address,
    ort: activeKyrkogard.ort,
    postnummer: activeKyrkogard.postnummer
});

  const koppladeArenden = arenden.filter((a) => a.kyrkogard === activeKyrkogard.namn && a.status !== "raderad")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })}

  async function handleUpdate (e, id) {

    try{
    e.preventDefault();
    await updateKyrkogard(id, formData)
    setActiveKyrkogard({ ...activeKyrkogard, ...formData });
    const data = await getKyrkogardar();
    setKyrkogardar(data);
    setRedigering(!redigering);

    }
    catch (err){
      console.log(err)
    }
  }
      
  return <div className = "kyrkogard-view-root">
        <div className = "sideways kyrkogard-view-layout">
        <div className = "button-panel-kyrkogard">
        <button onClick = {() => {setKyrkogardTabState(null); setActiveKyrkogard(null); setRedigering(false)}}>← Tillbaka</button>
        <button onClick = {() => {setRedigering(!redigering);}}>Redigera kyrkogård</button>
        </div>
        <div className = "kyrkogard-view-info-panel">
        <div className = "kyrkogard-view-main">
        <div className = "kyrkogard-view-header">
        <h2>{activeKyrkogard.namn}</h2>
        <div className = "kyrkogard-detail-tabs">
          <button className = {`kyrkogard-detail-tab ${activeDetailTab === "info" ? "active" : ""}`} onClick = {() => setActiveDetailTab("info")}>Info</button>
          <button className = {`kyrkogard-detail-tab ${activeDetailTab === "arenden" ? "active" : ""}`} onClick = {() => setActiveDetailTab("arenden")}>Ärenden ({koppladeArenden.length})</button>
        </div>
        </div>

        {activeDetailTab === "info" && <div className = "kyrkogard-view-info-content">
        <div>
        {redigering && <form className = "kyrkogard-info-box padded-form" onSubmit = {(e) => {handleUpdate(e, activeKyrkogard.id)}}>
          <label >Namn</label>
          <input type = "text" name = "namn" value = {formData.namn || ""}  onChange = {handleChange}></input>
          <label >Kontaktperson</label>
          <input type = "text" name = "kontaktperson" value = {formData.kontaktperson || ""}  onChange = {handleChange}></input>
          <label>Email</label>
          <input type = "text" name = "email"  value = {formData.email || ""} onChange = {handleChange}></input>
          <label>Telefonnummer</label>
          <input type = "text" name = "telefonnummer"  value = {formData.telefonnummer || ""} onChange = {handleChange}></input>
          <label>Adress</label>
          <input type = "text" name = "address" value = {formData.address || ""} onChange = {handleChange}></input>
          <label>Ort</label>
          <input type = "text" name = "ort" value = {formData.ort || ""} onChange = {handleChange}></input>
          <label>Postnummer</label>
          <input type = "text" name = "postnummer" value = {formData.postnummer || ""} onChange = {handleChange}></input>
          <div className = "edit-buttons">
          <button onClick = {() => setRedigering(false)}>Avbryt</button>
          <button type = "Submit">Bekräfta förändringar</button>
          </div>
        </form>}

        {!redigering && <div className = "kyrkogard-info-box"> 
        <div className = "arende-detail">
        <p><strong>Kontaktperson:</strong> {activeKyrkogard.kontaktperson}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Email:</strong> {activeKyrkogard.email}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Telefonnummer:</strong> {activeKyrkogard.telefonnummer}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Adress:</strong> {activeKyrkogard.address}, {activeKyrkogard.postnummer} {activeKyrkogard.ort}</p>
        </div>
        </div>}
        </div>
        <div className = "kyrkogard-rules-field">
            <h2>Regler</h2>
            <div className = "rule-box">
                {activeKyrkogard.regler.map((r, index) => 
                    <div key = {index}> 
                        <RegelEntry regel = {r} index = {index} kyrkogard = {activeKyrkogard} setActiveKyrkogard = {setActiveKyrkogard} setKyrkogardar = {setKyrkogardar}/>
                    </div>
                )}
            </div>
            {!addRuleEnabled && <button onClick = {() => setAddRuleEnabled(true)}>+ Lägg till regel</button>}
            {addRuleEnabled && <div className = "add-rules-input">
                <textarea onChange = {(e) => setCurrentNewRule(e.target.value)}></textarea>
                <button onClick = {() => setAddRuleEnabled(false)}>Avbryt</button>
                <button onClick = {async () => {setAddRuleEnabled(false); await addRule(activeKyrkogard, currentNewRule, setActiveKyrkogard, setKyrkogardar)}}>Bekräfta</button>
                </div>}
        </div>
        </div>}

        {activeDetailTab === "arenden" && <div className = "kyrkogard-arenden-list">
          {koppladeArenden.length === 0 && <p>Inga ärenden är kopplade till denna kyrkogård.</p>}
          {koppladeArenden.map((arende) => (
            <div key = {arende.id} className = "kyrkogard-arende-card" onClick = {() => linkToArende(setActiveTab, setActiveArende, arende)}>
              <h4>#{arende.id} {arende.avlidenNamn}</h4>
              <p>{arende.arendeTyp} — {arende.status}</p>
            </div>
          ))}
        </div>}
        </div>
        </div>
        </div>
        </div>   
}

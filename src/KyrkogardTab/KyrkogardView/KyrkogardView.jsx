import './KyrkogardView.css'
import {useState} from 'react'
import {updateKyrkogard, getKyrkogardar, getArenden } from '../../api.js'
import {addRule} from './rulehandling.js'
import RegelEntry from './RegelEntry.jsx'

export default function KyrkogardView({setKyrkogardTabState, setRedigering, setKyrkogardar, redigering, setActiveKyrkogard, activeKyrkogard}) {

  const [addRuleEnabled, setAddRuleEnabled] = useState(false)
  const [currentNewRule, setCurrentNewRule] = useState("")
  const [formData, setFormData] = useState({
    namn: activeKyrkogard.namn,
    kontaktperson: activeKyrkogard.kontaktperson,
    email: activeKyrkogard.email,
    telefonnummer: activeKyrkogard.telefonnummer,
    address: activeKyrkogard.address,
    ort: activeKyrkogard.ort,
    postnummer: activeKyrkogard.postnummer
});

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
      
  return <div>
        <div className = "sideways">
        <div className = "button-panel-kyrkogard">
        <button onClick = {() => {setKyrkogardTabState(null); setActiveKyrkogard(null); setRedigering(false)}}>← Tillbaka</button>
        <button onClick = {() => {setRedigering(!redigering);}}>Redigera kyrkogård</button>
        </div>
        <div className = "kyrkogard-view-info-panel">
        <div>
        <h2>{activeKyrkogard.namn}</h2>
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
                    <div> 
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
        </div>
        </div>
        </div>   
}

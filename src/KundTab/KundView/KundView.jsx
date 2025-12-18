import { useState } from 'react'
import { KundUpdateForm } from './KundUpdateForm'
import './KundView.css'

export default function KundView({setActiveTab, setActiveArende, activeKund, setActiveKund, arenden, setKunder}) {

    const [edit, setEdit] = useState(false)

    return <div className = "kund-menu">
      <div className = "button-panel-kund">
        <button onClick = {() => {setActiveKund(null)}}>Tillbaka</button>
        <button onClick = {() => {setEdit(!edit)}}>Redigera</button>
      </div>
      
      <div className = "main-kund"> 
        <h2> {activeKund.bestallare}</h2>
        <div className = "kund-info-grid">
        {!edit && <div className = "kund-info-field">
        <h3>Kontaktinformation</h3>
        <p><strong>Telefon:</strong> {activeKund.telefonnummer}</p>
        <p><strong>Email:</strong> {activeKund.email}</p>
        </div>}
        {edit && <KundUpdateForm kund = {activeKund} setActiveKund = {setActiveKund} setEdit = {setEdit} setKunder = {setKunder}/>}
            <div>
                <h3>{activeKund.bestallare}s ärenden:</h3>
                {arenden.filter(a => a.bestallare === activeKund.bestallare).map(a => <div>
                <p className = "kund-to-arende-link" onClick = {() => {setActiveTab('Ärenden'); setActiveArende(a); setActiveKund(null)}}><strong>#{a.id} {a.avlidenNamn}</strong></p>
                </div>
                )}
            </div>
        </div> 
        </div>
      </div>
}
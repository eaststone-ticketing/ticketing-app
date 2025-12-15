import { useState } from 'react'
import './KundView.css'

export default function KundView({setActiveTab, setActiveArende, activeKund, setActiveKund, arenden}) {
    return <div>
      <div className = "kund-menu">
        <div className = "kund-info-field">
        <h4> {activeKund.bestallare}</h4>
        <p><strong>Telefon:</strong> {activeKund.telefonnummer}</p>
        <p><strong>E-post:</strong> {activeKund.email}</p>
        </div>
            <div>
                <h4>{activeKund.bestallare}s ärenden:</h4>
                {arenden.filter(a => a.bestallare === activeKund.bestallare).map(a => <div>
                <p className = "kund-to-arende-link" onClick = {() => {setActiveTab('Ärenden'); setActiveArende(a); setActiveKund(null)}}><strong>#{a.id} {a.avlidenNamn}</strong></p>
                </div>
                )}
            </div>
        </div>
      <button onClick = {() => {setActiveKund(null)}}>Tillbaka</button>
      </div>
}
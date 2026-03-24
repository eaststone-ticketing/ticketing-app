import {getKommentarer} from '../api.js'
import {useState} from 'react'
import MobileBildView from './MobileBildView.jsx'

let kommentarer = []

try {
    kommentarer = await getKommentarer();
} catch(err){
    console.error(err)
}

export default function MobileDetailView({arende, setActiveArende}){
    const relevantKommentarer = kommentarer.filter((kommentar) => kommentar.arendeID === arende.id)
    const [view, setView] = useState('oversikt')
    return <div>
        <div className = "button-panel">
        <button onClick = {() => {setActiveArende(null); setView('oversikt')}}>
            Tillbaka
        </button>
        <button onClick = {() => setView('oversikt')}>
            Översikt
        </button>
        <button onClick = {() => setView('bilder')}>
            Bilder
        </button>
        </div>
        {view === 'oversikt' && <div>
        <div className = "mobile-detail-view">
        <div className = "mobile-info-box">
        <h3>{arende.avlidenNamn}</h3>
        <p>Kyrkogård: <strong>{arende.kyrkogard}</strong></p>
        <p>Kvarter: <strong>{arende.kvarter}</strong></p>
        <p>Gravnummer <strong>{arende.gravnummer}</strong></p>
        <p>Beställare: <strong>{arende.bestallare}</strong></p>
        <p>Telefon: <strong>{arende.tel}</strong></p>
        <p>E-post: <strong>{arende.email}</strong></p>
        </div>
        </div>
        <div className = "comment-field-mobile">
            <h3>Kommentarer</h3>
            {relevantKommentarer.map(k => <div className = "kommentar-card">
            <p><pre>{k.innehall}</pre></p>
          </div>)}
          </div>
        </div>}
        {view === 'bilder' && <MobileBildView arende = {arende}/>}
    </div>
}
import './ArendeComponentPage.css'
import { useState } from 'react'

import StenEntries from './Entries/StenEntries.jsx'
import SockelEntries from './Entries/SockelEntries.jsx'
import PorslinEntries from './Entries/PorslinEntries.jsx'
import BronsEntries from './Entries/BronsEntries.jsx'
import VasEntries from './Entries/VasEntries.jsx'
import tilldelaKomponent from './tilldelaKomponent.jsx'


function GenerateEntries({type, setKomponent}){
    return <div>
        {type === "Sten" && <StenEntries setKomponent = {setKomponent}/>}
        {type === "Sockel" && <SockelEntries setKomponent = {setKomponent}/>}
        {type === "Porslinsporträtt" && <PorslinEntries setKomponent = {setKomponent}/>}
        {type === "Brons" && <BronsEntries setKomponent = {setKomponent}/>}
        {type === "Vas" && <VasEntries setKomponent = {setKomponent}/>}
    </div>
}

async function addKomponent(komponent, setSkapaKomponent, arende){
    setSkapaKomponent(false)
    await tilldelaKomponent(komponent, arende)
}

const components = [
    {namn: "Porslinsporträtt 16cmx10cm, rund", type: "Porslinsporträtt", attributeA: "whatever", attributeB: 23},
    {namn: "Gravsten 60cmx60cmx10cm Shanxi Black", type: "Porslinsporträtt", differentAttributeA: "badab", differentAttributeB: true},
]

export default function ArendeComponentPage({arende}) {
    
    const [skapaKomponent, setSkapaKomponent] = useState(null);
    const [typ, setTyp] = useState(null)
    const [komponent, setKomponent] = useState(null)

    return <div>
        {!skapaKomponent && <div className = "main">
        <h3>Att beställa</h3>
        <div className = "component-entry-field">
        {components.map( c => <div className = "component-entry">
            <p>{c.namn}</p>
            </div>)}
        </div>
        <button onClick = {() => setSkapaKomponent(true)}><strong>+ Lägg till</strong></button>
        </div>}
        {skapaKomponent && <div className = "skapa-komponent">
            <div className = "skapa-komponent-innehall">
            <select onChange = {(e) => setTyp(e.target.value)} className = "special-select">
                <option value = "">Välj typ</option>
                <option>
                    Sten
                </option>
                <option>
                    Sockel
                </option>
                <option>
                    Porslinsporträtt
                </option>
                <option>
                    Brons
                </option>
                <option>
                    Vas
                </option>
            </select>
            <GenerateEntries type = {typ} setKomponent = {setKomponent}/>
            <div className = "buttons">
            <button onClick = {() => {setSkapaKomponent(false); setTyp(null)}}><strong>Avbryt</strong></button>
            <button onClick = {async () => await addKomponent(komponent, setSkapaKomponent, arende)}>Lägg till</button>
            </div>
            </div>
            </div>}
    </div>
}
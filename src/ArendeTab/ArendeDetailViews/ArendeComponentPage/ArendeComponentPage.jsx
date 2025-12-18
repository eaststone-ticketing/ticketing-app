import './ArendeComponentPage.css'
import { useEffect, useState } from 'react'
import {getKomponenter} from '../../../api.js'

import StenEntries from './Entries/StenEntries.jsx'
import SockelEntries from './Entries/SockelEntries.jsx'
import PorslinEntries from './Entries/PorslinEntries.jsx'
import BronsEntries from './Entries/BronsEntries.jsx'
import VasEntries from './Entries/VasEntries.jsx'
import LyktaEntries from './Entries/LyktaEntries.jsx'
import LykthusEntries from './Entries/LykthusEntries.jsx'
import MarmorEntries from './Entries/MarmorEntries'
import tilldelaKomponent from './tilldelaKomponent.jsx'
import {ComponentEntry} from './ComponentEntry.jsx'


function GenerateEntries({type, setKomponent}){
    return <div>
        {type === "Sten" && <StenEntries setKomponent = {setKomponent}/>}
        {type === "Sockel" && <SockelEntries setKomponent = {setKomponent}/>}
        {type === "Porslinsporträtt" && <PorslinEntries setKomponent = {setKomponent}/>}
        {type === "Brons" && <BronsEntries setKomponent = {setKomponent}/>}
        {type === "Vas" && <VasEntries setKomponent = {setKomponent}/>}
        {type === "Lykta" && <LyktaEntries setKomponent = {setKomponent}/> }
        {type === "Lykthus" && <LykthusEntries setKomponent = {setKomponent}/>}
        {type === "Marmor" && <MarmorEntries setKomponent = {setKomponent}/>}
    </div>
}

async function addKomponent(komponent, setSkapaKomponent, arende){
    if (!komponent || Object.keys(komponent).length === 0) return;
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
    const [leverantor, setLeverantor] = useState(null)
    const [komponent, setKomponent] = useState({}) //Komponent att lägga till
    const [komponenter, setKomponenter] = useState([]) //Lista av redan existerande komponenter

    useEffect(() => {
            async function loadKomponenter() {
            const dataKomponenter = await getKomponenter()
            const arendeKomponenter = dataKomponenter?.filter(k => k.arendeID === arende.id)
            setKomponenter(arendeKomponenter)
            console.log(arendeKomponenter)
            }
            loadKomponenter()
        }, [setKomponent])

    return <div>
        {!skapaKomponent && <div className = "main-arende-component">
        <h3>Att beställa</h3>
        <div className = "component-entry-field">
        {komponenter.map( c => <ComponentEntry component = {c}/>)}
        </div>
        <button onClick = {() => setSkapaKomponent(true)}><strong>+ Lägg till</strong></button>
        </div>}
        {skapaKomponent && <div className = "skapa-komponent">
            <div className = "skapa-komponent-innehall">
            <select onChange = {(e) => setTyp(e.target.value)} className = "special-select">
                <option value = "">Välj typ</option>
                <option>
                    Brons
                </option>
                <option>
                    Lykta
                </option>
                <option>
                    Lykthus
                </option>
                <option>
                    Marmor
                </option>
                <option>
                    Porslinsporträtt
                </option>
                <option>
                    Sockel
                </option>
                <option>
                    Sten
                </option>
                <option>
                    Vas
                </option>
            </select>
            <GenerateEntries type = {typ} setKomponent = {setKomponent}/>
            <select onChange = {(e) => {setLeverantor(e.target.value); console.log(leverantor)}}>
                <option value = "">Välj leverantör</option>
                <option>
                    Haobo
                </option>
                <option>
                    Siedlecki
                </option>
                <option>
                    Paasikivi
                </option>
                <option>
                    Sverige
                </option>
            </select>
            <div className = "buttons">
            <button onClick = {() => {setSkapaKomponent(false); setTyp(null)}}><strong>Avbryt</strong></button>
            <button onClick = {async () => {const fullKomponent = {typ: typ, ...komponent, leverantor: leverantor}; 
                                            console.log(fullKomponent); 
                                            await addKomponent(fullKomponent, setSkapaKomponent, arende); 
                                            setKomponent({});
                                            const updatedKomponenter = await getKomponenter();
                                            setKomponenter(updatedKomponenter);
                                            }}>Lägg till</button>
            </div>
            </div>
            </div>}
    </div>
}
import {useState} from 'react'

import {StenViewForm} from './StenViewForm.jsx'
import './StenView.css'

export default function StenView({activeArende, setActiveArende}){

//Format is {label : variableName} where variableName is what it is called in the arende object

const [editSten, setEditSten] = useState(false) 

const fields = [{label: "Framsida", type: "text", name: "framsida"},
                {label: "Kanter", type:"text", name: "kanter"},
                {label: "Sockel", type:"text", name: "sockelBearbetning"},
                {label: "Modell", type:"text", name: "modell"},
                {label: "Material", type:"text", name:"material"}
]   

return <div className = "sten-info-container">
{!editSten && <div>
    <h4>Sten</h4>
    {fields.map((field) => <p>{field.label}: {activeArende[field.name]}  </p>)}
</div>}

{editSten && <div> 
    <StenViewForm fields = {fields} activeArende = {activeArende} setActiveArende = {setActiveArende} setEditSten = {setEditSten}/>
    </div>}
    <button onClick = {() => setEditSten(!editSten)}>Redigera</button>
</div>}
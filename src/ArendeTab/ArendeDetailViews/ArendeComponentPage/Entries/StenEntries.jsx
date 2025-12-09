import './Entries.css'
import {useState} from 'react'

export default function StenEntries({setKomponent}){

    const [formData, setFormData] = useState({
        Stentyp : "-",
        Höjd : "",
        Bredd : "",
        Djup : ""
    })

    function handleChange(label, value){
        const updated = { ...formData, [label]: value };
        setFormData(updated);
        setKomponent(updated);
    }

    const entries = [
        {
            label: "Stentyp",
            options: ["Shanxi Black", "China Crystal", "Imperial red", "Bohus Grå", "Bohus röd"]
        },
        {
            label: "Höjd",
            options: []
        },
        {
            label: "Bredd",
            options: []
        },
        {
            label: "Djup",
            options: []
        }
        
    ]

    return <div>
        {entries.map( e =>
            <div key={e.label}> 
                {(e.options.length < 1) && <div>
                <label className = "entry"> {e.label}
                    <input onChange={(ev) => {handleChange(e.label, ev.target.value)}}
                    value = {formData[e.label]}></input>
                </label>
                </div>}
                {e.options.length >= 1 && <div>
                    <label className = "entry">{e.label} 
                    <select onChange={(ev) => {handleChange(e.label, ev.target.value)}}
                            value={formData[e.label]}>
                        <option>Välj {e.label.toLowerCase()}</option>
                        {e.options.map( o =>
                            <option>{o}</option>
                        )}
                    </select>
                    </label>
                    </div>}
            </div>
        )}
    </div>
}
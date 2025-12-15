import './Entries.css'
import {useState} from 'react'

export default function MarmorEntries({setKomponent}) {
    const [formData, setFormData] = useState({
        Välj : "",
        leverantor: null
    })

    function handleChange(label, value){
        const updated = { ...formData, [label]: value };
        setFormData(updated);
        setKomponent(updated);
    }

        const entries = [
        {
            label: "Välj",
            options: ["Duva, vit", "Duva, guld", "Duva, brons", "Sparv", "Ängel, stående", "Ängel, sittande", "Ängel, huvud", "Övrigt"]
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


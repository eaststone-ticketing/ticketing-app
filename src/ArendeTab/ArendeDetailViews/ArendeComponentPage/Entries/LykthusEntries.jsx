import './Entries.css'
import {useState} from 'react'

export default function LykthusEntries({setKomponent}) {
    const [formData, setFormData] = useState({
        Form : "-",
        Storlek : "",
        Färg : "",
        Glasfärg : "",
        Glasmönster : "",
        leverantor: null
    })

    function handleChange(label, value){
        const updated = { ...formData, [label]: value };
        setFormData(updated);
        setKomponent(updated);
    }

        const entries = [
        {
            label: "Form",
            options: ["Valvram", 
            "Gotisk", 
            "Fyrkant", 
            "Oval", 
            "Hjärta", 
            "Övrigt"]
        },
        {
            label: "Storlek",
            options: ["Mini 12 bred 24/25 h", "Liten 14 bred 32/33 h", "Normal 18 bred 37/38 h", "18 cm oval", "18 cm hjärta", "21 cm hjärta", "Övrigt"]
        },
        {
            label: "Färg",
            options: ["Ljus hållbarhetslackerad", "Guldpläterad", "Silver blank", "Silver kulblästrad", "Mörkpatinerad", "Övrigt"]
        },
        {
            label: "Glasfärg",
            options: ["Klart", "Gul"]
        },
        {
            label: "Glasmönster",
            options: ["Slätt", "Mönstrat"]
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


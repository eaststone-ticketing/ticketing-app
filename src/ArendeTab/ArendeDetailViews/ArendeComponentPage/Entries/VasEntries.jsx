import './Entries.css'
import {useState} from 'react'

export default function VasEntries({setKomponent}) {
    const [formData, setFormData] = useState({
        Material : "-",
        Modell : "",
        Storlek : "",
    })

    function handleChange(label, value){
        const updated = { ...formData, [label]: value };
        setFormData(updated);
        setKomponent(updated);
    }

        const entries = [
        {
            label: "Material",
            options: ["Black", 
            "Swedish Black", 
            "Impala", 
            "Pandang", 
            "Imperial", 
            "Romantic red", 
            "Vånga", 
            "Multired", 
            "Bohus red", 
            "Blue pearl", 
            "Black pearl", 
            "Bahama Blue", 
            "Paradiso", 
            "Himalaya",
            "Crystal",
            "Bohus silver", 
            "Övrigt"]
        },
        {
            label: "Modell",
            options: ["A", "B", "C", "D", "E", "F", "Övrigt"]
        },
        {
            label: "Storlek",
            options: ["12,5 x 25", "15 x 25", "17,5 x 30", "Övrigt"]
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


        import './Entries.css'
        import {useState} from 'react'

export default function PorslinEntries(){

            const [formData, setFormData] = useState({
                Form : "",
                Storlek : "",
                Färg : "",
                Kant : "",
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
                    options: ["Oval", "Square", "Övrigt"]
                },
                {
                    label: "Storlek",
                    options: ["7 x 9", "8 x 10", "9 x 12", "10 x 13", "11 x 15", "13 x 18", "18 x 24", "Annan storlek"]
                },
                {
                    label: "Färg",
                    options: ["Colour", "B/W", "Sepia", "Övrigt"]
                },
                {
                    label: "Kant",
                    options: ["Gold", "Silver", "White", "Black", "White edge with thin line", "Övrigt"]
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
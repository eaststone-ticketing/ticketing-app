import {useState} from 'react'
import { updateArende } from '../../../api.js';

export default function StenView({activeArende, setActiveArende}){

const [formData, setFormData] = useState({
    framsida: activeArende.framsida,
    kanter: activeArende.kanter,
    sockelBearbetning: activeArende.sockelBearbetning
})

const [editSten, setEditSten] = useState(false) 

function onSubmit() {
        const newArende = {
            ...activeArende,
            ...formData
        };

        updateArende(activeArende.id, newArende);
        setActiveArende(newArende);
        setEditSten(false);
    }

return <div>
{!editSten && <div>
    <p>Framsida: <strong>{activeArende.framsida}</strong></p>
    <p>Kanter: <strong>{activeArende.kanter}</strong></p>
    <p>Sockel: <strong>{activeArende.sockelBearbetning}</strong></p>
</div>}

{editSten && <div> 
       <form
            className="design-edit-form"
            onSubmit={(e) => { e.preventDefault(); onSubmit() }}
            >

                <div className="edit-form-entry">
                    <label><strong>Framsida:</strong></label>
                    <input
                        name="framsida"
                        value={formData.framsida}
                        onChange={(e) => setFormData({ ...formData, framsida: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Kanter:</strong></label>
                    <input
                        name="kanter"
                        value={formData.kanter}
                        onChange={(e) => setFormData({ ...formData, kanter: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Sockel:</strong></label>
                    <input
                        name="sockelBearbetning"
                        value={formData.sockelBearbetning}
                        type = "text"
                        onChange={(e) => {setFormData({ ...formData, sockelBearbetning: e.target.value})}}
                    />
                </div>
            <button type = "submit">Bekräfta</button>
            </form>

    
    </div>}
    <button onClick = {() => setEditSten(!editSten)}>Redigera</button>
</div>}
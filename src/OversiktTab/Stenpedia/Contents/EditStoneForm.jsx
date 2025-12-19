
import {updateSten, getStenar} from '../../../api.js'
import {useState} from 'react'
import './EditStoneForm.css'

export function EditStoneForm({sten, setEditStoneEntry, setStenar}) {
    const [formData, setFormData] = useState({
        namn: sten.namn,
        info: sten.info
    })

    async function onSubmit(e) {
        e.preventDefault();
        const newStone = {...sten, namn: formData.namn, info: formData.info}
        try {
        await updateSten(sten.id, newStone)
        const stenar = await getStenar();
        setStenar(stenar)
        setEditStoneEntry(false)
        } catch(err){
            console.error(err)
        }
    }

    return <div>
    <form className = "edit-stone-form" onSubmit = {async (e) => {onSubmit(e)}}>
    <label className = "edit-stone-form-label"> Namn
        <input value = {formData.namn} onChange = {(e) => setFormData({...formData, namn: e.target.value})}></input>
    </label>
    <label className = "edit-stone-form-label"> Infotext
        <textarea value = {formData.info} onChange = {(e) => setFormData({...formData, info: e.target.value})}></textarea>
    </label>
    <button type = "submit">Spara ändringar</button>
    </form>
    </div>
}
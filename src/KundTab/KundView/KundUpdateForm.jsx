import {useState} from 'react'
import {updateKund, getKunder} from '../../api.js'

export function KundUpdateForm({kund, setActiveKund, setEdit, setKunder}) {

    const [formData, setFormData] = useState(
        {
            bestallare: kund.bestallare,
            telefonnummer: kund.telefonnummer,
            email: kund.email
        }
    );

    async function onSubmit() {
        const nyKund = {...kund, ...formData}
        setActiveKund(nyKund)
        await updateKund(kund.id, nyKund)
        setEdit(false)
        const updatedKunder = await getKunder();
        setKunder(updatedKunder)
    }

    return <form
            className = "kund-update-form"
            onSubmit = {(e) => { e.preventDefault(); onSubmit() }}>
        <div>
            <label><strong>Namn</strong></label>
            <input
                name = "bestallare"
                value = {formData.bestallare}
                onChange = {(e) => setFormData({...formData, bestallare: e.target.value})} />
        </div>

        <div>
            <label><strong>Telefon</strong></label>
            <input
                name = "telefonnummer"
                value = {formData.telefonnummer}
                onChange = {(e) => setFormData({...formData, telefonnummer: e.target.value})} />
        </div>

        <div>
            <label><strong>Email</strong></label>
            <input
                name = "email"
                value = {formData.email}
                onChange = {(e) => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className = "kund-update-form-buttons">
        <button type="button" onClick = {() => setEdit(false)}>Avbryt</button>
        <button type = "submit">Bekräfta ändringar</button> 
        </div>  
        </form>
}

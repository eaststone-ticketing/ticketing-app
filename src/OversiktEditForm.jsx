import { updateArende, getKyrkogardar } from './api';
import './OversiktEditForm.css'
import {useState} from 'react'

export default function OverSiktEditForm({arende, setOversiktEdit, setActiveArende, kyrkogardar}){

    const [formData, setFormData] = useState({
    avlidenNamn: arende.avlidenNamn,
    fodelseDatum: arende.fodelseDatum,
    dodsDatum: arende.dodsDatum,
    kyrkogard: arende.kyrkogard,
    kvarter: arende.kvarter,
    gravnummer: arende.gravnummer
    })

    async function onSubmit(){
        const newArende = {
        ...arende, 
        avlidenNamn: formData.avlidenNamn,
        fodelseDatum: formData.fodelseDatum, 
        dodsDatum: formData.dodsDatum,
        kyrkogard: formData.kyrkogard,
        kvarter: formData.kvarter,
        gravnummer: formData.gravnummer
    };
        await updateArende(arende.id, newArende)
        setActiveArende(newArende)
        setOversiktEdit(false)
    }

    return <div>
        <form className = "oversikt-edit-form" onSubmit = {(e) => {e.preventDefault(); onSubmit()}}>
            <div className = "edit-form-entry">
                <label><strong>Namn:</strong></label>
                <input value = {formData.avlidenNamn} onChange = {(e) => setFormData({...formData, [e.target.name]: e.target.value})} name = "avlidenNamn"></input>
            </div>
            <div className = "edit-form-entry">
                <label><strong>Dödsdatum:</strong></label>
                <input type ="date" value = {formData.dodsDatum} onChange = {(e) => setFormData({...formData, [e.target.name]: e.target.value})} name = "dodsDatum"></input>
            </div>
            <div  className = "edit-form-entry">
                <label><strong>Födelsedatum:</strong></label>
                <input type ="date" value = {formData.fodelseDatum} onChange = {(e) => setFormData({...formData, [e.target.name]: e.target.value})} name = "fodelseDatum"></input>
            </div>
            <div  className = "edit-form-entry">
                <label><strong>Beställare: {arende.bestallare}</strong></label>
            </div>
            <div  className = "edit-form-entry">
                <label><strong>Email: {arende.email}</strong></label>
            </div>
            <div  className = "edit-form-entry">
                <label><strong>Telefonnummer: {arende.tel}</strong></label>
            </div>
            <div className = "edit-form-entry">
                <label><strong>Kyrkogård:</strong></label>
                <select onChange = {(e) => setFormData({...formData, [e.target.name]: e.target.value})} name = "kyrkogard">
                    <option>{arende.kyrkogard}</option>
                    {[...kyrkogardar].sort((a,b) => (a.namn ?? "").localeCompare((b.namn ?? ""))).map(k => <option>{k.namn}</option>)}
                </select>
            </div>
            <div className = "edit-form-entry">
                <label><strong>Kvarter:</strong></label>
                <input value = {formData.kvarter} onChange = {(e) => setFormData({...formData, [e.target.name]: e.target.value})} name = "kvarter"></input>
            </div>
            <div className = "edit-form-entry">
                <label><strong>Gravnummer:</strong></label>
                <input value = {formData.gravnummer} onChange = {(e) => setFormData({...formData, [e.target.name]: e.target.value})} name = "gravnummer"></input>
            </div>
            <div className = "button-panel">
            <button onClick = {() => setOversiktEdit(false)}>Avbryt</button>
            <button type = "submit">Bekräfta</button>
            </div>
        </form>
    </div>
}

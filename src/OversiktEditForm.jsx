import { updateArende, getKyrkogardar, getGodkannanden, removeGodkannande } from './api';
import './OversiktEditForm.css'
import {useState} from 'react'

export default function OverSiktEditForm({arende, setOversiktEdit, setActiveArende, kyrkogardar}){

    const [formData, setFormData] = useState({
    avlidenNamn: arende.avlidenNamn,
    fodelseDatum: arende.fodelseDatum,
    dodsDatum: arende.dodsDatum,
    kyrkogard: arende.kyrkogard,
    kvarter: arende.kvarter,
    gravnummer: arende.gravnummer,
    arendeTyp: arende.arendeTyp,
    ursprung: arende.ursprung
    })

    async function onSubmit(){

    let newStatus = arende.status
    
    //Delete godkännanden if changing into a type that should not have godkännanden
        if (formData.arendeTyp !== 'Ny sten' && 
            formData.arendeTyp !== 'Nyinskription' && 
            (arende.arendeTyp === 'Ny sten' || arende.arendeTyp === 'Nyinskription')){
            const godkannanden = await getGodkannanden();
            const toDelete = godkannanden.filter(g => g.arendeID === arende.id);
            newStatus = "Nytt"
        
            // WAIT for all delete requests to finish
            await Promise.all(toDelete.map(g => removeGodkannande(g.id)));
        }

        const newArende = {
        ...arende, 
        avlidenNamn: formData.avlidenNamn,
        fodelseDatum: formData.fodelseDatum, 
        dodsDatum: formData.dodsDatum,
        kyrkogard: formData.kyrkogard,
        kvarter: formData.kvarter,
        gravnummer: formData.gravnummer,
        arendeTyp: formData.arendeTyp,
        ursprung: formData.ursprung,
        status: newStatus
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
                <label>Ärendetyp</label>
                <select value = {formData.arendeTyp} onChange = {(e) => setFormData({...formData, arendeTyp: e.target.value})}>
                    <option value = "Övrigt">Välj ärendetyp</option>
                    <option>Ny sten</option>
                    <option>Nyinskription</option>
                    <option>Stabilisering</option>
                    <option>Rengöring</option>
                    <option>Inspektering</option>
                    <option>Ommålning</option>
                    <option>Övrigt</option>
                </select>
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
            <div className = "edit-form-entry">
                <label><strong>Ursprung</strong></label>
                <select value = {formData.ursprung} onChange = {(e) => setFormData({...formData, [e.target.name]: e.target.value})} name = "ursprung">
                    <option>
                        Eaststone
                    </option>
                    <option>
                        Stockholms Gravstenar
                    </option>
                </select>
            </div>
            <div className = "button-panel">
            <button onClick = {() => setOversiktEdit(false)}>Avbryt</button>
            <button type = "submit">Bekräfta</button>
            </div>
        </form>
    </div>
}

import { useState, useEffect } from 'react';
import { getKyrkogardar, updateArende } from '../../../api.js'

export function InfoboxForm({activeArende, setActiveArende, setEdit, fields}){
    
    const [kyrkogardar, setKyrkogardar] = useState([]);
    
    useEffect(() => {
        (async () => {
        try {
            const data = await getKyrkogardar();
            setKyrkogardar(data ?? []);
        } catch (e) {
            console.error(e);
            setKyrkogardar([]);
        }
        })();
    }, []);

   const [formData, setFormData] = useState(() =>
        Object.fromEntries(
            fields.map(([_, key]) => [key, activeArende?.[key] ?? ""])
        )
    );

    async function onSubmit(e){
        e.preventDefault();
        const newArende = {
        ...activeArende,
        ...Object.fromEntries(
            fields.map(([_, key]) => [key, formData?.[key] ?? ""])
        )
        };        
        try {
            await updateArende(activeArende.id, newArende)
            setActiveArende(newArende)
            setEdit(false)
            } catch(err) {
            console.error(err)
            }
    }


    return <form onSubmit = {async (e) => {onSubmit(e)}}>
        {fields.map(([label, key, type]) => <div className = "bestallare-infobox-form-entry">
            {type === "kyrkogard" && <select value = {formData?.[key]} onChange = {(e) => setFormData({...formData, [key]: e.target.value})}>
                {kyrkogardar.map((k) => <option value = {k.namn}>{k.namn}</option>)}
                </select>}
            
            {type === "text" && <label>
                <strong>{label}: </strong>
                <input value = {formData?.[key]} onChange = {(e) => setFormData({...formData, [key]: e.target.value})} type = "text" />
            </label>}
        </div>)}
        <button type = "submit">Bekräfta ändringar</button>
    </form>
}
    
import { FaRegEdit } from "react-icons/fa";
import { useState } from 'react';
import { InfoboxForm } from './InfoboxForm.jsx'
import './Infobox.css'

    export function Infobox({activeArende, setActiveArende, header, fields, editAllowed = true}){
        
        const [edit, setEdit] = useState(false);

        return <div className = "arende-detail-bestallare-infobox">
            <div className = "arende-detail-infobox-header-and-edit-button">
                <h3>{header}</h3>
                {editAllowed && <button onClick = {() => setEdit(!edit)}><FaRegEdit /></button>}
            </div>
            {edit && <InfoboxForm activeArende = {activeArende} setActiveArende = {setActiveArende} setEdit = {setEdit} fields = {fields}/>}
            {!edit && fields.map(([label, key, _]) => 
                <div className = "arende-detail"> 
                    <p>{label && <span className = "infobox-label">{label}:</span>} <span className = {label ? "infobox-content": "infobox-content-header"}>{activeArende?.[key]}</span></p>
                </div>
            )}
        </div>
    }

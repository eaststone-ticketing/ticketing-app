    
import { FaRegEdit } from "react-icons/fa";
import { useState } from 'react';
import { InfoboxForm } from './InfoboxForm.jsx'

    export function Infobox({activeArende, setActiveArende, header, fields}){
        
        const [edit, setEdit] = useState(false);

        return <div className = "arende-detail-bestallare-infobox">
            <div className = "arende-detail-infobox-header-and-edit-button">
                <h3>{header}</h3>
                <button onClick = {() => setEdit(!edit)}><FaRegEdit /></button>
            </div>
            {edit && <InfoboxForm activeArende = {activeArende} setActiveArende = {setActiveArende} setEdit = {setEdit} fields = {fields}/>}
            {!edit && fields.map(([label, key, _]) => 
                <div className = "arende-detail"> 
                    <p><strong>{label}: </strong>{activeArende?.[key]}</p>
                </div>
            )}
        </div>
    }

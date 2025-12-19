import { FaRegEdit } from "react-icons/fa";
import {useState} from 'react';
import './StenEntry.css';
import { EditStoneForm } from "./EditStoneForm";

export function StenEntry({sten, setStenar}){
    
    const [editStoneEntry, setEditStoneEntry] = useState(false)

    return <div className = "sten-entry-main">
        <div className = "header-and-edit">
        <h2>{sten.namn}</h2>
        <button onClick = {() => setEditStoneEntry(true)}><FaRegEdit /></button>
        </div>
        {!editStoneEntry && <p className = "info-text">{sten.info}</p>}
        {editStoneEntry && <EditStoneForm sten = {sten} setEditStoneEntry={setEditStoneEntry} setStenar = {setStenar} />}
    </div>
}
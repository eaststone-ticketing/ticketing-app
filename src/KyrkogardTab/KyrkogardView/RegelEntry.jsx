import {removeRule, editRule} from './rulehandling.js'
import './RegelEntry.css'
import { FaRegTrashAlt } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { useState } from 'react';



export default function RegelEntry({regel, kyrkogard, index, setActiveKyrkogard, setKyrkogardar}) {
    const [edit, setEdit] = useState(false)
    const [newRegel, setNewRegel] = useState(regel)
    return <div>
        {!edit && <div className = "regel-entry">
        <p className = "regel-entry-text">{regel}</p>
        <div className = "regel-entry-buttons">
        <button className = "regel-entry-edit-button" onClick = {() => setEdit(true)}><FaRegEdit /></button>
        <button className = "regel-entry-trashcan" onClick = {() => removeRule(kyrkogard, index, setActiveKyrkogard, setKyrkogardar)}><FaRegTrashAlt /></button>
        </div>
        </div>}
        {edit && <form>
            <textarea value = {newRegel} onChange = {(e) => setNewRegel(e.target.value)}></textarea>
            <button onClick = {async (e) => {e.preventDefault(); await editRule(kyrkogard, index, newRegel, setActiveKyrkogard, setKyrkogardar); setEdit(false)}}>✓</button>
            <button onClick = {() => setEdit(false)}>X</button>       
        </form>
        }
    </div>
}
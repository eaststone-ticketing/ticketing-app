import { FaRegTrashAlt } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import './ComponentEntry.css'

export function ComponentEntry ({component}) {
    return <div className = "component-entry">
            <p>{component.body.name}</p>
            <div className = "component-entry-buttons">
            <button className = "component-entry-edit-button"><FaRegEdit /></button>
            <button className = "component-entry-trashcan"><FaRegTrashAlt /></button>       
            </div>
        </div>
}
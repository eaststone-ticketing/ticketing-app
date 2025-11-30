import { useState } from 'react'

const searchField = (label,  setFunction) => {
    return <div className = "input-field-searchbar-kund">
        <label>{label}</label>
        <input type = "text" onChange={(e) => setFunction(e.target.value)} ></input>
    </div>
}

export default function LeveranserSearchMenu({setLeverantor, setLeverantorId}) {
    return <div className = "search-menu-leverans">
        <h3>Sök leveranser</h3>
        {searchField("ID", setLeverantorId)}
        {searchField("Leverantör", setLeverantor)}
    </div>
}
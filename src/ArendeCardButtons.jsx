import { useState } from 'react'

export default function ArendeCardButtons({arende, updateArendeStatus}) {
    if (arende.status === 'Nytt'){
        if (arende.arendeTyp === 'Nyinskription' || arende.arendeTyp === 'Ny sten'){
            return <div>
                <button className = "send-button" 
                onClick = {() => 
                updateArendeStatus("Väntar svar av kund", arende)}>Skickat skiss →→
                </button>
                <button className = "send-button"
                onClick = {() =>
                updateArendeStatus("Väntar svar av kyrkogård", arende)}>Skickat ansökan →→
                </button>
            </div>
        } else if (arende.arendeTyp === "Stabilisering" || arende.arendeTyp === "Rengöring" || arende.arendeTyp === "Ommålning" || arende.arendeTyp === "Inspektering"){
            return <div>
                <button className = "send-button" onClick = {() => updateArendeStatus("Stängt", arende)}>Arbete utfört</button>
            </div>
        } else {
            console.log(`${arende.arendeTyp} is missing button definition at status ${arende.status}`)
            return
        }
    }

    if (arende.status === 'Godkänd av kund') {
        if (arende.arendeTyp === 'Nyinskription' || arende.arendeTyp === 'Ny sten'){
            return <div>
                <button
                className = "send-button"
                onClick = {() => 
                updateArendeStatus("Godkänd av kund, väntar svar av kyrkogård", arende)}>Skickat ansökan →→
                </button>
            </div>
        } else {
            console.log(`Should tickets of type ${arende.arendeTyp} really have the status ${arende.status}?`)
            console.log(`${arende.arendeTyp} is missing button definition at status ${arende.status}`)
            return
        }
    }

    if (arende.status === 'Godkänd av kyrkogård') {
        if (arende.arendeTyp === 'Nyinskription' || arende.arendeTyp === 'Ny sten'){
            return <div>
                <button
                className = "send-button"
                onClick = {() => 
                updateArendeStatus("Godkänd av kyrkogård, väntar svar av kund", arende)}>Skickat skiss →→
                </button>
            </div>
        } else {
            console.log(`Should tickets of type ${arende.arendeTyp} really have the status ${arende.status}?`)
            console.log(`${arende.arendeTyp} is missing button definition at status ${arende.status}`)
            return
        }
    }

    if (arende.status === 'Väntar svar av kyrkogård') {
        if (arende.arendeTyp === 'Nyinskription' || arende.arendeTyp === 'Ny sten'){
            return <div>
                <button
                className = "send-button"
                onClick = {() => 
                updateArendeStatus("Väntar svar av kund och kyrkogård", arende)}>Skickat skiss →→
                </button>
            </div>}else {
            console.log(`Should tickets of type ${arende.arendeTyp} really have the status ${arende.status}?`)
            console.log(`${arende.arendeTyp} is missing button definition at status ${arende.status}`)
            return
        }
    }

    if (arende.status === 'Väntar svar av kund') {
        if (arende.arendeTyp === 'Nyinskription' || arende.arendeTyp === 'Ny sten'){
            return <div>
                <button
                className = "send-button"
                onClick = {() => 
                updateArendeStatus("Väntar svar av kund och kyrkogård", arende)}>Skickat ansökan →→
                </button>
            </div>
        }else {
            console.log(`Should tickets of type ${arende.arendeTyp} really have the status ${arende.status}?`)
            console.log(`${arende.arendeTyp} is missing button definition at status ${arende.status}`)
            return
        }
    }

    if (arende.status === 'Redo'){
            return <button className = "send-button" onClick = {() => updateArendeStatus("Stängt", arende)}>Arbete utfört</button>
        }
}
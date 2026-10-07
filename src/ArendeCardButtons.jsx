import { useState } from 'react'
import getTypes from './Helpers/getTypes.js'
import hasType from './Helpers/hasType.js'

export default function ArendeCardButtons({arende, updateArendeStatus}) {

    const arendeTypes = getTypes(arende.arendeTyp);
    const hasNySten = arendeTypes.some(type => type === "Ny sten");
    const hasNyinskription = arendeTypes.some(type => type === "Nyinskription");

    if (arende.status === 'Nytt'){
        if (hasNySten || hasNyinskription){
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
        } else {
            console.log(`${arende.arendeTyp} is missing button definition at status ${arende.status}`)
            return
        }
    }

    if (arende.status === 'Godkänd av kund') {
        if (hasNySten || hasNyinskription){
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
        if (hasNySten || hasNyinskription){
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
        if (hasNySten || hasNyinskription){
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
        if (hasNySten || hasNyinskription){
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
}
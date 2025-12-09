import {addTraces} from './api.js'
  
export default async function laggTillTrace(meddelande, arende) {
    const time = new Date();
    const timestamp = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}, ${time.getHours()}:${time.getMinutes() > 9 ? time.getMinutes(): `0${time.getMinutes()}`}`
    const user = JSON.parse(localStorage.getItem('user')) ?? "Okänd användare"
    const username = user.userName.charAt(0).toUpperCase() + user.userName.slice(1)
    const traceMessage = `${timestamp}, ${username} ${meddelande}`

    await addTraces({arendeID: arende.id, body: traceMessage})
}
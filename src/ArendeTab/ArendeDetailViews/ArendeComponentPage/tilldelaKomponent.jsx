import { addKomponenter, getLeveranser, addLeveranser, updateLeverans } from '../../../api.js'

function createKomponentName(komponent){
    const { leverantor, ...rest } = komponent;
    const name = Object.values(rest).join(", ")
    return name
}

async function createNewLeverans(leverantor){
    const leveransToAdd = {namn: leverantor, leverantor: leverantor, innehall: [], arenden: [], status: "Ny"}
    const newLeverans = await addLeveranser(leveransToAdd)
    console.log(newLeverans)
    return newLeverans;
}

async function getLeverans(leverantor){
    const leveranser = await getLeveranser();
    const leverans = leveranser.find(l => l.leverantor === leverantor && l.status !== "Beställd")
    if (leverans) {
        return leverans;
    }

    else {
        const newLeverans = await createNewLeverans(leverantor)
        return newLeverans;
    }
}

export default async function tilldelaKomponent(komponent, arende){

    const leverantor = komponent.leverantor
        if (!leverantor) {
            console.log("Okänd leverantör")
            return
        }

    const leverans = await getLeverans(leverantor); //ATT GÖRA (codex go to hell!)
    const leveransID = leverans.id
    const arendeID = arende.id;
    const komponentName = createKomponentName(komponent);
    const newKomponent = {leveransID: leveransID, arendeID: arendeID, body: {...komponent, name: komponentName}}
    await addKomponenter(newKomponent)
    if (!leverans.arenden.includes(arendeID)){
    await updateLeverans(leveransID, {...leverans, arenden: [...leverans.arenden, arendeID]})
}
}
import { addKomponenter, getLeveranser, addLeveranser } from '../../../api.js'

const stentypLeverantorKey = {
    "Shanxi Black" : "Haobo",
    "China Crystal" : "Haobo",
    "Imperial red" : "Siedlecki",
    "Bohus Grå" : "Sverige",
    "Bohus Röd" : "Sverige"
}

async function createNewLeverans(leverantor){
    const newLeverans = {namn: leverantor, leverantor: leverantor, innehall: [], arenden: [], status: "Ny"}
    await addLeveranser(newLeverans)
    return newLeverans;
}

async function getLeveransID(leverantor){
    const leveranser = await getLeveranser();
    const leverans = leveranser.find(l => l.leverantor === leverantor && l.status !== "Beställd")
    if (leverans) {
        return leverans.id;
    }

    else {
        const newLeverans = await createNewLeverans(leverantor)
        return newLeverans.id;
    }
}

export default async function tilldelaKomponent(komponent, arende){
    if (komponent.Stentyp){
        const leverantor = stentypLeverantorKey[komponent.Stentyp]
        if (!leverantor) {
            console.log("Okänd stentyp")
        }

    const leveransID = await getLeveransID(leverantor); //ATT GÖRA (codex go to hell!)
    const arendeID = arende.id;

    const newKomponent = {leveransID: leveransID, arendeID: arendeID, body: komponent}

    await addKomponenter(newKomponent)

    } else {
        console.log("Okänd leverantör")
        return 
    }


}
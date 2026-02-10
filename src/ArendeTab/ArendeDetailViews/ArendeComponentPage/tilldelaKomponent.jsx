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

    const arendeID = arende.id;
    const komponentName = createKomponentName(komponent);

    const leverantor = komponent.leverantor
        if (!leverantor || leverantor === "") {
            return
        }
    
    let leveransID = null;
    if (leverantor !== "N/A"){
        const leverans = await getLeverans(leverantor);
        leveransID = leverans.id
        if (!leverans.arenden.includes(arendeID)){
            try {
            await updateLeverans(leveransID, {...leverans, arenden: [...leverans.arenden, arendeID]})
            } catch (error) {
                console.error(error)
            }
        }
    }
    
    
    const newKomponent = {leveransID: leveransID, arendeID: arendeID, body: {...komponent, name: komponentName}}
    await addKomponenter(newKomponent)

}
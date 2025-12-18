import {getKyrkogardar, updateKyrkogard} from '../../api.js'

export async function addRule(kyrkogard, regel, setActiveKyrkogard, setKyrkogardar) {
    const newKyrkogardData = {...kyrkogard, regler: [...(kyrkogard.regler ?? []), regel]}
    console.log("setKyrkogardar in addRule:", setKyrkogardar);
    try {
        await updateKyrkogard(kyrkogard.id, newKyrkogardData)
        setActiveKyrkogard(newKyrkogardData)
        const updatedKyrkogardar = await getKyrkogardar()
        setKyrkogardar(updatedKyrkogardar)
    } catch(err){
        console.error(err)
    }
}

export async function removeRule(kyrkogard, index, setActiveKyrkogard, setKyrkogardar) {
    const newKyrkogardData = {...kyrkogard, regler: [...kyrkogard.regler.slice(0,index), ...kyrkogard.regler.slice(index + 1)]}
    console.log("setKyrkogardar in removeRule:", setKyrkogardar);
    try {
        await updateKyrkogard(kyrkogard.id, newKyrkogardData)
        setActiveKyrkogard(newKyrkogardData)
        const updatedKyrkogardar = await getKyrkogardar()
        setKyrkogardar(updatedKyrkogardar)
    } catch(err){
        console.error(err)
    }
}

export async function editRule(kyrkogard, index, newRule, setActiveKyrkogard, setKyrkogardar) {
    console.log("setKyrkogardar in editRule:", setKyrkogardar);
    if (kyrkogard.regler[index] === newRule) return;

    const newKyrkogardData = {...kyrkogard, regler: kyrkogard.regler.map((r, ind) => ind === index ? newRule : r)}
    try {
        await updateKyrkogard(kyrkogard.id, newKyrkogardData)
        setActiveKyrkogard(newKyrkogardData)
        const updatedKyrkogardar = await getKyrkogardar()
        setKyrkogardar(updatedKyrkogardar)
    } catch(err){
        console.error(err)
    }
}
/* 
Handles the filtering in three dimensions (ursprung, type and status) applied by the user in the Arende tab.

We don't return 0 in the end upon not finding a filter because that is a proper amount and we have gotten an improper result
*/

// FILTER :                    FILTERING RULE

const statusMap = {
    "all":                      r => r.status !== "raderad",
    "Nytt":                     r => r.status === "Nytt" || r.status === "Väntar svar av kund" || r.status === "Väntar svar av kyrkogård" || r.status === "Väntar svar av kund och kyrkogård",
    "Godkänd av kund":          r => r.status?.includes("Godkänd av kund"),
    "Godkänd av kyrkogård":     r => r.status?.includes("Godkänd av kyrkogård"),
    "Väntande":                 r => r.status?.toLowerCase().includes("vänt"), 
    //^^^ This must use .toLowerCase() because "vänt" can occur both capitalized and not 
    //(Example: Godkänd av kund, väntar svar av kyrkogård and Väntar svar av kund, godkänd av kyrkogård)
    "Redo":                     r => r.status === "Redo"
}

export default function findTicketAmount(filter, results, typeToSearch, ursprungToSearch){

    //Filter the results by URSPRUNG

    const filteredByUrsprung = results.filter(r => r.ursprung === ursprungToSearch || ursprungToSearch === "");

    //Filter the results by TYPE

    const filteredByType = filteredByUrsprung.filter(r => r.arendeTyp === typeToSearch || typeToSearch === "");

    //Filter the results by STATUS

    const filterFunction = statusMap[filter]

    if(!filterFunction){
        console.log("Filtering failed, filter applied not found in findTicketAmount.jsx")
        return
    }

    return filteredByType.filter(filterFunction).length
}
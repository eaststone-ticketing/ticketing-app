export async function getKyrkogardar() {
    const res = await fetch ("http://localhost:5000/kyrkogardar");
    return res.json();
}

export async function addKyrkogard(kyrkogard) {
    const res = await fetch ("http://localhost:5000/kyrkogardar", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(kyrkogard)
    });
    return res.json();
}

export async function removeKyrkogard(id) {
    const res = await fetch (`http://localhost:5000/kyrkogardar/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
    });
    return res.json(
    )
}

export async function getArenden() {
    const res = await fetch ("http://localhost:5000/arenden")
    return res.json();
}

export async function addArende(arende) {
    const res = await fetch ("http://localhost:5000/arenden", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(arende)      
    });
    return res.json();
}

export async function removeArende(id) {
    const res = await fetch (`http://localhost:5000/arenden/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"}
    });
    return res.json();
}

export async function getKunder() {
    const res = await fetch ("http://localhost:5000/kunder")
    return res.json();
}

export async function addKund(kund) {
    const res = await fetch ("http://localhost:5000/kunder", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(kund)      
    });
    return res.json();
}

export async function removeKunder(id) {
    const res = await fetch (`http://localhost:5000/kunder/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"}
    });
    return res.json();
}
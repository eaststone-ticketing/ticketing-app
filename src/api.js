export async function getKyrkogardar() {
    const res = await fetch ("http://192.168.8.171:5000/kyrkogardar");
    return res.json();
}

export async function addKyrkogard(kyrkogard) {
    const res = await fetch ("http://192.168.8.171:5000/kyrkogardar", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(kyrkogard)
    });
    return res.json();
}

export async function removeKyrkogard(id) {
    const res = await fetch (`http://192.168.8.171:5000/kyrkogardar/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
    });
    return res.json(
    )
}

export async function getArenden() {
    const res = await fetch ("http://192.168.8.171:5000/arenden")
    return res.json();
}

export async function addArende(arende) {
    const res = await fetch ("http://192.168.8.171:5000/arenden", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(arende)      
    });
    return res.json();
}

export async function removeArende(id) {
    const res = await fetch (`http://192.168.8.171:5000/arenden/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"}
    });
    return res.json();
}

export async function getKunder() {
    const res = await fetch ("http://192.168.8.171:5000/kunder")
    return res.json();
}

export async function addKund(kund) {
    const res = await fetch ("http://192.168.8.171:5000/kunder", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(kund)      
    });
    return res.json();
}

export async function removeKunder(id) {
    const res = await fetch (`http://192.168.8.171:5000/kunder/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"}
    });
    return res.json();
}

export async function getGodkannanden() {
    const res = await fetch ("http://192.168.8.171:5000/godkannanden");

    if (!res.ok) {
        console.log(`Error: ${res.status} - ${res.statusText}`);
        throw new Error(`Failed to fetch godkannanden: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

export async function addGodkannande(godkannande) {
    const res = await fetch ("http://192.168.8.171:5000/godkannanden", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(godkannande)      
    });
    return res.json();
}

export async function removeGodkannande(id) {
    const res = await fetch (`http://192.168.8.171:5000/godkannanden/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"}
    });
    return res.json();
}

export async function getKommentarer() {
    const res = await fetch ("http://192.168.8.171:5000/kommentarer");

    if (!res.ok) {
        console.log(`Error: ${res.status} - ${res.statusText}`);
        throw new Error(`Failed to fetch godkannanden: ${res.status} ${res.statusText}`);
    }
    return res.json();
}

export async function addKommentarer(kommentar) {
  try {
    const res = await fetch("http://192.168.8.171:5000/kommentarer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kommentar),
    });

    if (!res.ok) {
      throw new Error(`Failed to add kommentar: ${res.statusText}`);
    }

    const newKommentar = await res.json();
    return newKommentar;
  } catch (error) {
    console.error("Error adding kommentar:", error);
    throw error;  // You can re-throw or handle the error here
  }
}


export async function removeKommentarer(id) {
    const res = await fetch (`http://192.168.8.171:5000/kommentarer/${id}`, {
        method: "DELETE",
        hearders: {"Content-Type": "application/json"}
    });
    return res.json();
}

export async function updateGodkannande(id,data) {
    const res = await fetch(`http://192.168.8.171:5000/godkannanden/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateKyrkogard(id, data) {
  const res = await fetch(`http://192.168.8.171:5000/kyrkogardar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateArende(id, data) {
  const res = await fetch(`http://192.168.8.171:5000/arenden/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateKund(id, data) {
  const res = await fetch(`http://192.168.8.171:5000/kunder/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateKommentar(id, data) {
  const res = await fetch(`http://192.168.8.171:5000/kommentarer/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.8.171:5000";

async function getToken() {

  const user = localStorage.getItem('user'); 
  let token = user ? JSON.parse(user).token : null; 

  if(!token) return null;
  
  if (isTokenExpired(token)){
        try {
            const res = await fetch(`${API_URL}/refresh-token`, {
                method: 'POST',
                credentials: 'include', // send HTTP-only cookie
            });

            if (!res.ok) {
                console.error('Refresh token failed');
                return null;
            }

            const data = await res.json();
            // Save the new token in localStorage
            localStorage.setItem('user', JSON.stringify({ ...JSON.parse(user), token: data.accessToken }));
            token = data.accessToken;
        } catch (err) {
            console.error('Error refreshing token:', err);
            return null;
        }
  }
  
    return token;
}

function isTokenExpired(token) {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1])); // decode JWT payload
    const now = Date.now() / 1000; // current time in seconds
    return payload.exp < now + 30; // consider it expired if less than 30s left
}

export async function getKyrkogardar() {
    const res = await fetch (`${API_URL}/kyrkogardar`, {
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`,
                },
              credentials: 'include'
              });
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    
    return res.json();
}

export async function addKyrkogard(kyrkogard) {
    const res = await fetch (`${API_URL}/kyrkogardar`, {
        method: "POST",
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`} ,
        credentials: 'include',
        body: JSON.stringify(kyrkogard)
    });

    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function removeKyrkogard(id) {
    const res = await fetch (`${API_URL}/kyrkogardar/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`
                },
          credentials: 'include',});

    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json(
    )
}

export async function getArenden() {
    const res = await fetch (`${API_URL}/arenden`, {
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`,
                },
        credentials: 'include',});

    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function addArende(arende) {
    const res = await fetch (`${API_URL}/arenden`, {
        method: "POST",
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
        body: JSON.stringify(arende),
        credentials: 'include',      
    });

    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function removeArende(id) {
    const res = await fetch (`${API_URL}/arenden/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
        credentials: 'include'});

    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function getKunder() {
    const res = await fetch (`${API_URL}/kunder`, {
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`,},
                credentials: 'include'});

    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function addKund(kund) {
    const res = await fetch (`${API_URL}/kunder`, {
        method: "POST",
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
        credentials: 'include',
        body: JSON.stringify(kund)      
    });

    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function removeKunder(id) {
    const res = await fetch (`${API_URL}/kunder/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`
    }, credentials: 'include'});

    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function getGodkannanden() {
    const res = await fetch (`${API_URL}/godkannanden`, {
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                  credentials: 'include'
                });

    if (!res.ok) {
        console.log(`Error: ${res.status} - ${res.statusText}`);
        throw new Error(`Failed to fetch godkannanden: ${res.status} ${res.statusText}`);
    }
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function addGodkannande(godkannande) {
    const res = await fetch (`${API_URL}/godkannanden`, {
    method: "POST",
    headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                  credentials: 'include',
    body: JSON.stringify(godkannande)      
    });
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function removeGodkannande(id) {
    const res = await fetch (`${API_URL}/godkannanden/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                credentials: 'include'});
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function getKommentarer() {
    const res = await fetch (`${API_URL}/kommentarer`, {
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                  credentials: 'include'
                 });

    if (!res.ok) {
        console.log(`Error: ${res.status} - ${res.statusText}`);
        throw new Error(`Failed to fetch kommentarer: ${res.status} ${res.statusText}`);
    }
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function addKommentarer(kommentar) {
  try {
    const res = await fetch(`${API_URL}/kommentarer`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                credentials: 'include',
      body: JSON.stringify(kommentar),
    });

    if (!res.ok) {
      throw new Error(`Failed to add kommentar: ${res.statusText} This is the object ${JSON.stringify(kommentar)}`);
    }

    const newKommentar = await res.json();
    return newKommentar;
  } catch (error) {
    console.error("Error adding kommentar:", error);
    throw error;  // You can re-throw or handle the error here
  }
}

export async function removeKommentarer(id) {
    const res = await fetch (`${API_URL}/kommentarer/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                credentials: 'include'});
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function getLeveranser() {
    const res = await fetch (`${API_URL}/leveranser`, {
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                  credentials: 'include'
                 });

    if (!res.ok) {
        console.log(`Error: ${res.status} - ${res.statusText}`);
        throw new Error(`Failed to fetch leveranser: ${res.status} ${res.statusText}`);
    }
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function addLeveranser(leverans) {
  try {
    const res = await fetch(`${API_URL}/leveranser`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                credentials: 'include',
      body: JSON.stringify(leverans),
    });

    if (!res.ok) {
      throw new Error(`Failed to add leverans: ${res.statusText} This is the object ${JSON.stringify(leverans)}`);
    }

    const newLeverans = await res.json();
    return newLeverans;
  } catch (error) {
    console.error("Error adding leverans:", error);
    throw error;  // You can re-throw or handle the error here
  }
}

export async function removeLeveranser(id) {
    const res = await fetch (`${API_URL}/leveranser/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                credentials: 'include'});
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}


export async function getKomponenter() {
    const res = await fetch (`${API_URL}/komponenter`, {
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                  credentials: 'include'
                 });

    if (!res.ok) {
        console.log(`Error: ${res.status} - ${res.statusText}`);
        throw new Error(`Failed to fetch komponenter: ${res.status} ${res.statusText}`);
    }
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function addKomponenter(komponent) {
  try {
    const res = await fetch(`${API_URL}/komponenter`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                credentials: 'include',
      body: JSON.stringify(komponent),
    });

    if (!res.ok) {
      throw new Error(`Failed to add komponent: ${res.statusText} This is the object ${JSON.stringify(komponent)}`);
    }

    const newKomponent = await res.json();
    return newKomponent;
  } catch (error) {
    console.error("Error adding komponent:", error);
    throw error;  
  }
}

export async function removeKomponenter(id) {
    const res = await fetch (`${API_URL}/komponenter/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                credentials: 'include'});
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}


export async function getTraces() {
    const res = await fetch (`${API_URL}/traces`, {
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                  credentials: 'include'
                 });

    if (!res.ok) {
        console.log(`Error: ${res.status} - ${res.statusText}`);
        throw new Error(`Failed to fetch traces: ${res.status} ${res.statusText}`);
    }
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}

export async function addTraces(trace) {
  try {
    const res = await fetch(`${API_URL}/traces`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                credentials: 'include',
      body: JSON.stringify(trace),
    });

    if (!res.ok) {
      throw new Error(`Failed to add trace: ${res.statusText} This is the object ${JSON.stringify(trace)}`);
    }

    const newTrace = await res.json();
    return newTrace;
  } catch (error) {
    console.error("Error adding trace:", error);
    throw error;  
  }
}

export async function removeTraces(id) {
    const res = await fetch (`${API_URL}/traces/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
                credentials: 'include'});
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
    return res.json();
}



export async function updateGodkannande(id,data) {
    const res = await fetch(`${API_URL}/godkannanden/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`},
    credentials: 'include',
    body: JSON.stringify(data)
  });

  const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
  return res.json();
}

export async function updateKyrkogard(id, data) {
  const res = await fetch(`${API_URL}/kyrkogardar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`} ,
    credentials: 'include',
    body: JSON.stringify(data)
  });

  const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
  return res.json();
}

export async function updateArende(id, data) {
  const res = await fetch(`${API_URL}/arenden/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`} ,
    credentials: 'include',
    body: JSON.stringify(data)
  });
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
  return res.json();
}

export async function updateKund(id, data) {
  const res = await fetch(`${API_URL}/kunder/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()}`} ,
    credentials: 'include',
    body: JSON.stringify(data)
  });
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
  return res.json();
}

export async function updateKommentar(id, data) {
  const res = await fetch(`${API_URL}/kommentarer/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()} `},
    credentials: 'include',
    body: JSON.stringify(data)
  });
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
  return res.json();
}

export async function updateLeverans(id, data) {
  const res = await fetch(`${API_URL}/leveranser/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()} `},
    credentials: 'include',
    body: JSON.stringify(data)
  });
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
  return res.json();
}

export async function updateKomponent(id, data) {
  const res = await fetch(`${API_URL}/komponenter/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()} `},
    credentials: 'include',
    body: JSON.stringify(data)
  });
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
  return res.json();
}

export async function updateTrace(id, data) {
  const res = await fetch(`${API_URL}/traces/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${await getToken()} `},
    credentials: 'include',
    body: JSON.stringify(data)
  });
    const newToken = res.headers.get("Authorization");
    if (newToken && newToken.startsWith("Bearer ")) {
        localStorage.setItem('user', JSON.stringify({ token: newToken.split(" ")[1] }));
    }
  return res.json();
}

export async function updatePassword(user, passwordIn, passwordCheckerIn){

  const password = passwordIn.trim()
  const passWordChecker = passwordCheckerIn.trim()

  if (password !== passWordChecker){
    window.alert("Lösenorden är inte likadana")
    return
  }

  if (password.length < 5){
    window.alert("Please choose a password that contains 5 characters or more")
    return
  }
  const data = {username:user.username, password:password}
  console.log(user.userId)
  const res = await fetch(`${API_URL}/users/${user.userId}`,
    {
      method: "PUT",
      headers: {"Content-Type": "application/json",
                "Authorization": `Bearer ${await getToken()}`
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!res.ok) {
    const text = await res.text(); // will show HTML or error text
    console.error("Password update failed:", text);
    return;
  }

      return res.json();
}
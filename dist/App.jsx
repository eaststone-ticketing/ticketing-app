import { useState, useEffect } from 'react'
import { getKyrkogardar, addKyrkogard, removeKyrkogard, getArenden, addArende, removeArende, getKunder, addKund, removeKunder } from "./api.js";
import './App.css'



function NewStoneForm({arenden, setArenden, kyrkogardar, kunder, setKunder}) {
    const [sockel, setSockel] = useState(false);
    const [staende, setStaende] = useState(false);
    const [GRO, setGRO] = useState(false);
    const [arendeTyp, setArendeTyp] = useState("");

    const [formData, setFormData] = useState({
    arendetyp: "",
    avlidenNamn: "",
    fodelseDatum: "",
    dodsDatum: "",
    fakturaTillDodsbo: "",
    bestallare: "",
    adress: "",
    ort: "",
    postnummer: "",
    tel: "",
    email: "",
    kyrkogard: "",
    kvarter: "",
    gravnummer: "",
    modell: "",
    material: "",
    symboler:"",
    beteckning:"",
    staende: "",
    framsida: "",
    kanter: "",
    sockelBearbetning: "",
    typsnitt: "",
    forsankt: "",
    farg: "",
    dekor: "",
    platsForFlerNamn: "",
    minnesord: "",
    pris: "",
    tillbehor: "",
    GRO: ""
  })
  async function createTicket(e) {
    try {
     e.preventDefault()
    
    const newArende = await addArende({...formData, sockel, staende, GRO})
    
    setArenden([...arenden,newArende]);
    
    const kundNamn = formData.bestallare;
    const kundTel = formData.tel;
    // If kund doesn't already exist, add to kunder
    if (!kunder.some(k => k.namn === kundNamn && k.tel === kundTel)) {
      const newKund = await addKund({bestallare: formData.bestallare, email: formData.email, telefonnummer: formData.tel, adress: formData.address})
      console.log(newKund)
      setKunder([...kunder, newKund])
    }

  }
  catch(err){
    console.log(err)
  }
    // Clear the form
    setFormData({
    arendeTyp: "",
    avlidenNamn: "",
    fodelseDatum: "",
    dodsDatum: "",
    fakturaTillDodsbo: "",
    bestallare: "",
    adress: "",
    ort: "",
    postnummer: "",
    tel: "",
    email: "",
    kyrkogard: "",
    kvarter: "",
    gravnummer: "",
    modell: "",
    material: "",
    symboler:"",
    beteckning:"",
    staende: "",
    framsida: "",
    kanter: "",
    sockelBearbetning: "",
    typsnitt: "",
    forsankt: "",
    farg: "",
    dekor: "",
    platsForFlerNamn: "",
    minnesord: "",
    pris: "",
    tillbehor: "",
    GRO: ""
    })
    setGRO(false)
    setSockel(false)
    setStaende(false)
  }
  const avlidenEntries = [
    {label:"Namn", type: "text", name: "avlidenNamn"},
    {label:"Födelsedatum", type:"date", name:"fodelseDatum"},
    {label:"Dödsdatum", type: "date", name: "dodsDatum"},
  ]

  const bestallareEntries = [
    {label:"Namn", type:"text", name:"bestallare"},
    {label:"Adress", type:"text", name: "adress"},
    {label:"Postnummer", type:"text", name:"postnummer"},
    {label:"Ort", type:"text", name:"ort"},
    {label:"Email", type:"text", name:"email"},
    {label:"Telefonnummer", type:"text", name:"tel"},
  ]

  const gravstenEntries = [
    {label: "Modell", type:"text", name:"modell"},
    {label: "Material", type:"text", name: "material"},
    {label: "Symboler vid datum", type: "text", name: "symboler"},
    {label: "Beteckning, baksida", type: "text", name: "beteckning"}
  ]

  const bearbetningEntries = [
    {label: "Framsida", type: "text", name: "framsida"},
    {label: "Kanter", type: "text", name: "kanter"},
    {label: "Sockel", type: "text", name: "sockelBearbetning"}
  ]

  const utsmyckningEntries = [
    {label: "Typsnitt", type: "text", name: "typsnitt"},
    {label: "Färg", type: "text", name: "farg"},
    {label: "Dekor", type: "text", name: "dekor"},
    {label: "Plats för fler namn", type: "text", name: "platsForFlerNamn"},
    {label: "Minnesord", type: "text", name: "minnesord"}
  ]

  const prisEntries = [
    {label: "Pris", type: "text", name: "price"}
  ]

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    });
  };

  return <form onSubmit = {createTicket} className = "form">
    <div>
    <select name = "arendeTyp" onChange = {e => {{handleChange(e); setArendeTyp(e.target.value)}}} value = {formData.arendeTyp}>
    <option>Välj ärendetyp</option>
    <option>Ny sten</option>
    <option>Nyinskription</option>
    <option>Stabilisering</option>
    <option>Rengöring</option>
    </select>
    </div>
    <div>{arendeTyp !== "Ny sten" && arendeTyp !== "Välj ärendetyp" && <div> <label>Nuvarande text</label> <input name = "nuvarandeText" onChange = {handleChange} value = {formData.nuvarandeText}/> </div>}</div>
    <div></div>
    <div className = "avliden-gravsten">
    <div className = "avliden-entries">
    <h4>Avliden</h4>
    {avlidenEntries.map((entry, index) => (
      <div key = {index} className = "form-entry">
        <label>{entry.label}</label>
        <input type = {entry.type} name = {entry.name} onChange = {handleChange} value = {formData[entry.name]}></input>
      </div>
    ))}
    </div>
    <label>Faktura till dödsbo?</label>
    <input name = "fakturaTillDodsbo" type = "checkbox" checked = {formData.fakturaTillDodsbo === 1} onChange = {handleChange}></input>
        <div className = "gravsten-entries">
      <h4>Gravsten</h4>
      {gravstenEntries.map((entry, index) => (
        <div key = {index} className = "form-entry">
          <label>{entry.label}</label>
          <input type = {entry.type} name = {entry.name} onChange = {handleChange} value = {formData[entry.name]}></input>
        </div>
      ))}
      <label>Sockel?</label>
      <input type="checkbox" checked={sockel} onChange={(e) => setSockel(e.target.checked)}/>
      <div></div>
      <label>Stående?</label>
      <input type="checkbox" checked={staende} onChange={(e) => setStaende(e.target.checked)}/>
    </div>
    </div>

     <div>
    <div className = "bestallare-entries">
      <h4>Beställare</h4>
      {bestallareEntries.map((entry, index) => (
      <div key = {index} className = "form-entry">
        <label>{entry.label}</label>
        <input type = {entry.type} name = {entry.name} onChange = {handleChange} value = {formData[entry.name]}></input>
      </div>
      ))}
    </div>
    <div className = "bearbetning-entries">
      <h4>Bearbetning</h4>
      {bearbetningEntries.map((entry, index) => (
        <div key = {index} className = "form-entry">
          <label>{entry.label}</label>
          <select name = {entry.name} onChange = {handleChange} value = {formData[entry.name]}>
            <option>Välj bearbetning</option>
            <option>Blankpolerad</option>
            <option>Mattpolerad</option>
            <option>Krysshamrad</option>
            <option>Råhuggen</option>
          </select>
        </div>
      ))}
    </div>
    </div>

    <div>
    <div className = "begravningsplats-entries">
      <h4>Begravningsplats</h4>
      <label>Begravningsplats</label>
      <select
        name="kyrkogard"
        onChange={handleChange}
        value={formData.kyrkogard}
      >
        <option value="">Välj begravningsplats</option>
        {kyrkogardar.map((k) => (
          <option key={k.id} value={k.namn}>
            {k.namn}
          </option>
        ))}
      </select>
      <div className = "form-entry">
      <label>Kvarter</label>
      <input type = "text" name = "kvarter" onChange = {handleChange} value = {formData["kvarter"]}></input>
      </div>
      <div className = "form-entry">
      <label>Gravnummer</label>
      <input type = "text" name = "gravnummer" onChange = {handleChange} value = {formData["gravnummer"]}></input>
      </div>
    <div className = "utsmyckning-entries">
      <h4>Utsmyckning</h4>
      {utsmyckningEntries.map((entry, index) => (
        <div key = {index} className = "form-entry">
          <label>{entry.label}</label>
          <input type = {entry.type} name = {entry.name} onChange = {handleChange} value = {formData[entry.name]}></input>
        </div>
      ))}
    <label>Förhöjd/Försänkt</label>
    <select
        name="forsankt"
        onChange={handleChange}
        value={formData.forsankt}>
      <option>Förhöjd/Försänkt</option>
      <option>Förhöjd</option>
      <option>Försänkt</option>
    </select>
    </div>
    </div>
    </div>
    <div>
    <label><strong>Pris</strong></label>
    <input type = "text" name = "pris"  onChange = {handleChange} value = {formData["pris"]}/>
    </div>
    <div>
    <label>Kommentar</label>
    <input type = "text" name = "kommentar"  onChange = {handleChange} value = {formData["kommentar"]}/>
    </div>
    <div></div>
    <div>
    <label>GRO-sockel?</label>
    <input type="checkbox" checked={GRO} onChange={(e) => setGRO(e.target.checked)}/>
    </div>
    <button type = "submit">Skapa ärende</button>
  </form>
}

function SearchArenden({ arenden }) {
  const [avlidenNamn, setAvlidenNamn] = useState("");
  const [ID, setID] = useState("");
  const [filtered, setFiltered] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Trim inputs to ignore accidental spaces
    const name = avlidenNamn.trim().toLowerCase();
    const id = ID;

    // If both are empty, don't show anything
    if (!name && !id) {
      setFiltered([]);
      return;
    }

    const result = arenden.filter((arende) => {
      const matchName = name
        ? arende.avlidenNamn.toLowerCase().includes(name)
        : true;
      const matchId = id ? String(arende.id) === id : true;
      return matchName && matchId;
    });

    setFiltered(result);
  };

  return (
    <div className="search-arenden-menu">
      <div className = "search-inputs">
      <h3>Sök ärende</h3>
      <form onSubmit={handleSubmit}>
        <label>Avlidens namn</label>
        <input
          type="text"
          value={avlidenNamn}
          onChange={(e) => setAvlidenNamn(e.target.value)}
        />
        <label>Ärendenummer</label>
        <input
          type="text"
          value={ID}
          onChange={(e) => setID(e.target.value)}
        />
        <button type="submit" className = "search-button">Sök</button>
      </form>
      </div>
      <div className="arenden-list">
        {filtered.length === 0 ? (
          <div></div>
        ) : (
          filtered.map((arende) => (
            <div key={arende.id} className = "arende-search-result">
              <p>{arende.id}: {arende.avlidenNamn}</p>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EmailTab({arenden, setArenden, kyrkogardar, kunder, setKunder}) {
    const emails = [
    {
      id: 1,
      sender: 'Anna Svensson',
      subject: 'Möte på torsdag',
      preview: 'Hej! Kan vi flytta mötet till kl 14 istället?',
      date: '2025-10-12',
    },
    {
      id: 2,
      sender: 'Jonas Eriksson',
      subject: 'Faktura #12345',
      preview: 'Här kommer fakturan för oktober...',
      date: '2025-10-11',
    },
    {
      id: 3,
      sender: 'Maria Lind',
      subject: 'Tack för senast!',
      preview: 'Det var trevligt att ses på eventet.',
      date: '2025-10-10',
    },
  ]

const [activeEmail, setActiveEmail] = useState(null)
const [selectedForm, setSelectedForm] = useState('')

return (
  <div className="email-feed">

    {activeEmail === null && (
    <div className = "email-list">
    {emails.map((email) => (
      
      <div key={email.id} className={`email-item ${activeEmail === email.id ? 'active' : ''}`} 
      onClick={() => setActiveEmail(activeEmail === email.id ? null : email.id)}>
        
        <div
          className="email-header">
          <strong>{email.sender}</strong>
          <span className="email-date">{email.date}</span>
          <span className="email-subject">{email.subject}</span>
        </div>
      </div>
    ))}
  </div>
    )}

    {activeEmail !== null && (
      <div className = "email-detail">
        {(() => {
          const email = emails.find((e) => e.id === activeEmail)
          const renderForm = () => {
            switch (selectedForm) {
              case 'newStone':
                return <NewStoneForm arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder}/>
              case 'newStoneStockholm':
                return <NewStoneStockholmForm arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar}/>
              case 'smallJob':
                return <SmallJobForm arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar}/>
              case 'searchArenden':
                return <SearchArenden arenden = {arenden}/>
              default:
                return null
              
            }
          }
          return (
            <div className="email-content">
              <div>
              <div className = "subject-and-create-new-form">
                <h2>{email.subject}</h2>
                <div>
                <button onClick = {() => setSelectedForm("searchArenden")}>Bifoga i ärende</button>
                <button onClick = {() => setSelectedForm("newStone")}>Skapa ärende</button>
                </div>
              </div>

              <p><strong>From:</strong> {email.sender}</p>
              <p><strong>Date:</strong> {email.date}</p>
              <hr />
              <p>{email.preview}</p>
              </div>
              <div className="form-container">{renderForm()}</div>
            </div>
          )
        })()}
        <button onClick = {() => {setActiveEmail(null) 
                                  setSelectedForm('')}}>Back</button>
      </div>
    )}
    </div>
)
}

function ArendeTab({ arenden, setArenden, kyrkogardar, kommentarer, setKommentarer }) {

  const [avlidenNamn, setAvlidenNamn] = useState("");
  const [id, setID] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [kyrkogard, setKyrkogard] = useState("");
  const [gravrattsinnehavare, setGravrattsinnehavare] = useState("");
  const [bestallare, setBestallare] = useState("");
  const [activeArendeBestallare, setActiveArendeBestallare] = useState(false);
  const [activeArendeKyrkogard, setActiveArendeKyrkogard] = useState(false);
  const [activeKyrkogard, setActiveKyrkogard] = useState("");
  
  /*För att slutföra ärende skicka in bild på färdig sten*/
  const [status, setStatus] = useState("Ofärdigt formulär");
  const [activeArende, setActiveArende] = useState(null);

  async function handleDelete(id) {
  try {
    await removeArende(id); // call backend
    setArenden(arenden.filter(a => a.id !== id)); // update state
  } catch (err) {
    console.error("Error deleting arende:", err);
  }
  }

function findKyrkogard(arende, kyrkogardar) {
  const kyrkogardString = arende.kyrkogard;
  return kyrkogardar.find(k => k.namn === kyrkogardString);
}

  const result = arenden.filter((arende) => {
    const matchName = avlidenNamn
      ? (arende.avlidenNamn ?? "").toLowerCase().includes(avlidenNamn.toLowerCase())
      : true;
    const matchID = id ? String(arende.id ?? "") === id : true;
    const matchEmail = email
      ? (arende.email ?? "").toLowerCase().includes(email.toLowerCase())
      : true;
    const matchTel = tel ? (arende.tel ?? "").includes(tel) : true;
    const matchKyrkogard = kyrkogard
      ? (arende.kyrkogard ?? "").toLowerCase().includes(kyrkogard.toLowerCase())
      : true;
    const matchGravrattsinnehavare = gravrattsinnehavare
      ? (arende.gravrattsinnehavare ?? "").toLowerCase().includes(gravrattsinnehavare.toLowerCase())
      : true;
    const matchBestallare = bestallare
      ? (arende.bestallare ?? "").toLowerCase().include(bestallare.toLowerCase)
      : true;

    return (
      matchName &&
      matchID &&
      matchEmail &&
      matchTel &&
      matchKyrkogard &&
      matchGravrattsinnehavare &&
      matchBestallare
    );
  });
  const [arendeDetailState, setArendeDetailState] = useState("oversikt");
  return (
    <div>
      {activeArende === null && (
        <>
          <button>Skapa nytt ärende</button>
          <form className="searchbar-arende">
            <div>
              <label>Namn på avliden</label>
              <input
                type="text"
                name="avlidenNamn"
                value={avlidenNamn}
                onChange={(e) => setAvlidenNamn(e.target.value)}
              />
            </div>
            <div>
              <label>Ärendenummer</label>
              <input
                type="text"
                name="id"
                value={id}
                onChange={(e) => setID(e.target.value)}
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="text"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label>Telefonnummer</label>
              <input
                type="text"
                name="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
              />
            </div>
            <div>
              <label>Kyrkogård</label>
              <input
                type="text"
                name="kyrkogard"
                value={kyrkogard}
                onChange={(e) => setKyrkogard(e.target.value)}
              />
            </div>
            <div>
              <label>Beställare</label>
              <input
              type = "text"
              name = "bestallare"
              value = {bestallare}
              onChange = {(e) => setBestallare(e.target.value)}
              />
            </div>
            <div>
              <label>Gravrättsinnehavare</label>
              <input
                type="text"
                name="gravrattsinnehavare"
                value={gravrattsinnehavare}
                onChange={(e) => setGravrattsinnehavare(e.target.value)}
              />
            </div>
          </form>

          {result.map((arende) => (
            <div key={arende.id} className="arende-card" onClick = {() => {setActiveArende(arende); setActiveKyrkogard(findKyrkogard(arende, kyrkogardar))}}>
              <div>
              <h3>{arende.avlidenNamn}</h3>
              <p>Beställare: {arende.bestallare}</p>
              <p>E-post: {arende.email}</p>
              <p>Telefon: {arende.tel}</p>
              <p>Kyrkogård: {arende.kyrkogard}</p>
              </div>
              <div>
              <button className = "delete-button" onClick = {(e) =>{e.stopPropagation(); handleDelete(arende.id)}}>Radera</button>
              </div>
            </div>
          ))}
        </>
      )}
      {activeArende !== null && <div>

        <div className = "arende-detail-container">
        <div className = "buttons-arende-detail">
        <button onClick = {() => setActiveArende(null)}>← Tillbaka till sökfält</button>
        <button onClick = {() => setArendeDetailState("oversikt")}> Översikt</button>
        <button onClick = {() => setArendeDetailState("leveranser")}>Leveranser</button>
        <button onClick = {() => setArendeDetailState("kontaktpersoner")}>Kontaktpersoner</button>
        <button onClick = {() => setArendeDetailState("fakturor")}>Fakturor</button>
        <button onClick = {() => setArendeDetailState("kommentarer")}>Kommentarer</button>
        </div>
        {arendeDetailState === "oversikt" && <div>
        <div className = "arende-detail-main">
        <div>
        <h2>{activeArende.avlidenNamn}</h2>
        <div className = "arende-detail">
        <p><strong>Dödsdatum:</strong> {activeArende.dodsDatum}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Födelsedatum:</strong> {activeArende.fodelseDatum}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Beställare:</strong></p><p className = "arende-detail-kyrkogard-p" onClick = {() => {setActiveArendeBestallare(true); setActiveArendeKyrkogard(false)}} > {activeArende.bestallare}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Email:</strong> {activeArende.email}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Telefonnummer:</strong> {activeArende.tel}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Kyrkogård:</strong></p><p className = "arende-detail-kyrkogard-p" onClick = {() => {setActiveArendeKyrkogard(true); setActiveArendeBestallare(false)}}>{activeKyrkogard.namn}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Kvarter:</strong> {activeArende.kvarter}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Gravnummer:</strong> {activeArende.gravnummer}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Status:</strong> {status}</p> 
        </div>
        </div>
        
        <div className = "further-detail-field">
        {activeArendeBestallare && <div>
          <div className = "header-and-close-button">
          <h2>Beställare: {activeArende.bestallare}</h2>
          <button onClick = {() => setActiveArendeBestallare(false)}>X</button>
          </div>
          <div className = "arende-detail">
          <p><strong>Email:</strong> {activeArende.email}</p>
          </div>
          <div className = "arende-detail">
          <p><strong>Adress:</strong> {activeArende.adress},{activeArende.postnummer} {activeArende.ort}</p>
          </div>

        </div>}
        {activeArendeKyrkogard && <div>
          
          <div className = "header-and-close-button">
          <h2>Kyrkogård: {activeArende.kyrkogard}</h2>
          <button onClick = {() => setActiveArendeKyrkogard(false)}>X</button>
          </div>
          <div className = "arende-detail">
          <p><strong>Kontaktperson:</strong> {activeKyrkogard.kontaktperson}</p>
          </div>
          <div className = "arende-detail">
          <p><strong>Telefon:</strong> {activeKyrkogard.telefonnummer}</p>
          </div>
          <div className = "arende-detail">
          <p><strong>Email:</strong> {activeKyrkogard.email}</p>
          </div>
          <div className = "arende-detail">
          <p><strong>Adress:</strong> {activeKyrkogard.address}</p>
          </div>
          <div className = "arende-detail">
          <p><strong>Postnummer:</strong> {activeKyrkogard.postnummer}</p>
          </div>
          <div className = "arende-detail">
          <p><strong>Ort:</strong> {activeKyrkogard.ort}</p>
          </div>
          
        </div>}
        </div>
        </div>
        </div>}
        {arendeDetailState === "leveranser" && <div>
          <div className = "arende-detail-main">
          <h2>Leveranser för {activeArende.avlidenNamn}</h2>
          <p>Inga leveranser.</p>
          </div>
          </div>}
        {arendeDetailState === "kontaktpersoner" && <div>
          <h2>Kontaktpersoner för {activeArende.avlidenNamn}</h2>
          <p>Gravrättsinnehavare: {activeArende.gravrattsinnehavare}</p>
          <p>Beställare: {activeArende.bestallare}</p>
          <p>Beställare telefon: {activeArende.tel}</p>
          <p>Beställare email: {activeArende.email}</p>
          </div>}
        </div>
        </div>}
    </div>
  );
}


function KundTab({kunder}) {
  
    const [kundNamn, setKundNamn] = useState("");
    const [id, setID] = useState("");
    const [email, setEmail] = useState("");
    const [tel, setTel] = useState("");

    const result = kunder.filter((kund) => 
    {
      const matchName = kundNamn
        ? (kund.bestallare ?? "").toLowerCase().includes(kundNamn.toLowerCase())
        : true;
      const matchID = id ? String((kund.id ?? "")) === id : true;
      const matchEmail = email ? (kund.email ?? "") && kund.email?.toLowerCase().includes(email.toLowerCase()) : true;
      const matchTel = tel ? kund.tel && kund.tel?.includes(tel) : true;

      return (matchName && matchID && matchEmail && matchTel);
    });
  return (
    <div>
      <form className = "searchbar-kund">
      <div>
      <label>Namn på kund</label>
      <input type = "text" name = "avlidenNamn" value = {kundNamn} onChange={(e) => setKundNamn(e.target.value)}></input>
      </div>
      <div>
      <label>Kundnummer</label>
      <input type = "text" name = "id" value = {id} onChange={(e) => setID(e.target.value)}></input>
      </div>
      <div>
      <label>Email</label>
      <input type = "text" name = "email" value = {email} onChange={(e) => setEmail(e.target.value)}></input>
      </div>
      <div>
      <label>Telefonnummer</label>
      <input type = "text" name = "tel" value = {tel} onChange={(e) => setTel(e.target.value)}></input>
      </div>
      </form>
      {result.map((kund) => (
        <div key={kund.id} className="arende-card">
          <h3>{kund.id}: {kund.bestallare}</h3>
          <p>Email: {kund.email}</p>
          <p>Telefon: {kund.telefonnummer}</p>
        </div>
      ))}
    </div>
  )
}

function LeverantorTab() {
  return <div>Leverantörslista</div>
}

function KyrkogardForm({kyrkogardar, setKyrkogardar, formData, setFormData}) {

      async function createKyrkogard(e) {
        e.preventDefault();
        try {
        const newKyrkogard = await addKyrkogard(formData);

        setKyrkogardar([...kyrkogardar, newKyrkogard]);

        // Clear the form
        setFormData({
          namn: "",
          kontaktperson: "",
          email: "",
          telefonnummer: "",
          address: "",
          ort: "",
          postnummer: ""
        });
      } catch (err) {
        console.error("Error adding kyrkogård:", err)
      }
      }


    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value })}
    
    const entries = [
      {label:"Namn", type: "text", name: "namn"},
      {label:"Kontaktperson", type: "text", name: "kontaktperson"},
      {label:"Email", type:"email", name:"email"},
      {label:"Telefonnummer", type:"text", name:"telefonnummer"},
      {label:"Adress", type:"text", name: "address"},
      {label:"Ort", type:"text", name:"ort"},
      {label:"Postnummer", type:"text", name:"postnummer"}
    ]

    return <form onSubmit = {createKyrkogard} className = "form">
    {entries.map((entry, index) => (
      <div key = {index} className = "form-entry">
        <label>{entry.label}</label>
        <input type = {entry.type} name = {entry.name} onChange = {handleChange} value = {formData[entry.name]}></input>
      </div>
    ))}
    <div></div>
    <div></div>
    <button type = "submit">Skapa kyrkogård</button>
  </form>
  }

function KyrkogardTab({kyrkogardar, setKyrkogardar}) {

  const [formVisible, setFormVisible] = useState(false)
  const [activeKyrkogard, setActiveKyrkogard] = useState(null)

  async function handleDelete(id) {
  try {
    await removeKyrkogard(id); // call backend
    setKyrkogardar(kyrkogardar.filter(k => k.id !== id)); // update state
  } catch (err) {
    console.error("Error deleting kyrkogård:", err);
  }
}
  
  const [formData, setFormData] = useState({
      namn: "",
      kontaktperson: "",
      email: "",
      telefonnummer: "",
      address: "",
      ort: "",
      postnummer: ""
    })

  return <div className = "kyrkogard-tab">
    <button onClick = {() => setFormVisible(!formVisible)} className = "add-kyrkogard-button">Lägg till kyrkogård</button>
    {formVisible && <KyrkogardForm kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} formData = {formData} setFormData = {setFormData} />}
  <div className = "kyrkogard-list">
  {kyrkogardar.map((kyrkogard) => (
    <div key={kyrkogard.namn} className="kyrkogard-card" onClick={() => setActiveKyrkogard(activeKyrkogard === kyrkogard.namn ? null : kyrkogard.namn)}>
      <div className = "kyrkogard-card-header">
      <h3>{kyrkogard.namn}</h3>
      <button onClick = {() => handleDelete(kyrkogard.id)}>Radera</button>      
      </div>
      <p>Adress: {kyrkogard.address}</p>
      <p>Kontakt: {kyrkogard.kontaktperson}</p>
      <p>Email: {kyrkogard.email}</p>
      <p>Kyrkogårdsnummer: {kyrkogard.id}</p>
    </div>
  ))}
    </div>
    </div>
}

function App() {

  const [activeTab, setActiveTab] = useState('Email')
  const tabs = ['Email', 'Ärenden', 'Kunder', 'Leverantörer', 'Kyrkogårdar']
  const [arenden, setArenden] = useState([])
  const [kyrkogardar, setKyrkogardar] = useState([])
  const [kunder, setKunder] = useState([])
  const [kommentarer, setKommentarer] = useState([])

  useEffect(() => {
  async function loadKyrkogardar() {
    const data = await getKyrkogardar(); 
    console.log("Loaded kyrkogårdar:", data);
    setKyrkogardar(data); 
  }
  loadKyrkogardar(); 
  }, []);

  useEffect(() => {
  async function loadArenden() {
    const data = await getArenden(); 
    console.log("Loaded ärenden:", data);
    setArenden(data); 
  }
  loadArenden(); 
  }, []);

  useEffect(() => {
  async function loadKunder() {
    const data = await getKunder(); 
    console.log("Loaded kunder:", data);
    setKunder(data); 
  }
  loadKunder(); 
  }, []);

  return (
    <>
      <div>
        <div className = "tab-bar">
          {tabs.map((tab) => (
            <button
            
            key = {tab}
            onClick = {() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>)
          )}
        </div>
        <div className="tab-content">
          {activeTab === 'Email' && <EmailTab arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} />}
          {activeTab === 'Ärenden' && <ArendeTab arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kommentarer = {kommentarer} setKommentarer= {setKommentarer}/>}
          {activeTab === 'Kunder' && <KundTab kunder = {kunder}/>}
          {activeTab === 'Leverantörer' && <LeverantorTab />}
          {activeTab === 'Kyrkogårdar' && <KyrkogardTab kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} />}
        </div>
      </div>
    </>
  )
}

export default App

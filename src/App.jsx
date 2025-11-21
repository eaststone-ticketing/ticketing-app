import { useState, useEffect } from 'react'
import { getKyrkogardar, addKyrkogard, removeKyrkogard, updateKyrkogard, getArenden, addArende, removeArende, updateArende, getKunder, addKund, removeKunder, updateKund, getGodkannanden, addGodkannande, removeGodkannande, updateGodkannande, getKommentarer, addKommentarer, removeKommentarer, updateKommentar, updatePassword } from "./api.js";
import { TbGrave2 } from "react-icons/tb";
import { BsTelephone } from "react-icons/bs";
import { MdEmail, MdOutlineEmail } from "react-icons/md";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { HiOutlineMail } from "react-icons/hi";
import { IoPersonOutline } from "react-icons/io5";
import './App.css'
import MainApp from './MainApp.jsx'
import DownloadPdfButton from './PdfDownloadButton.jsx'
import OversiktEditForm from './OversiktEditForm'
import DesignEditForm from './DesignEditForm'
import SlaIhopMenu from './SlaIhopMenu'

function NewStoneForm({arenden, setArenden, kyrkogardar, kunder, setKunder, set = null}) {
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
    const datum = new Date().toISOString().split('T')[0];
    const newArende = await addArende({ datum, ...formData, sockel, staende, GRO, status: "Nytt"})
    
    setArenden([...arenden,newArende]);
    
    const kundNamn = formData.bestallare;
    const kundTel = formData.tel;
    // If kund doesn't already exist, add to kunder
    if (!kunder.some(k => k.namn === kundNamn && k.tel === kundTel)) {
      const newKund = await addKund({bestallare: formData.bestallare, email: formData.email, telefonnummer: formData.tel, adress: formData.adress})
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
    if(set){
      set(false)
    }
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
    <div className = "new-stone-form-top">
    <select name = "arendeTyp" onChange = {e => {{handleChange(e); setArendeTyp(e.target.value)}}} value = {formData.arendeTyp} required>
    <option value = "">Välj ärendetyp</option>
    <option>Ny sten</option>
    <option>Nyinskription</option>
    <option>Stabilisering</option>
    <option>Rengöring</option>
    </select>
    </div>
    <div>{arendeTyp !== "Ny sten" && arendeTyp !== "Välj ärendetyp" &&  arendeTyp !== "" && <div> <label>Nuvarande text</label> <input name = "nuvarandeText" onChange = {handleChange} value = {formData.nuvarandeText}/> </div>}</div>
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
        <input type = {entry.type} name = {entry.name} onChange = {handleChange} value = {formData[entry.name]} required></input>
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
        className = "select"
        name="kyrkogard"
        onChange={handleChange}
        value={formData.kyrkogard}
      required>
        <option value="">Välj begravningsplats</option>
        {[...kyrkogardar].filter(k => k && k.namn).sort((a, b) => a.namn.localeCompare(b.namn)).map((k) => (
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
    {set&& <button className = "uglycoded-flying-button" onClick = {() => set(false)}><strong>X</strong> Tillbaka till översikt</button>}
  </form>
}

function SearchArenden({ arenden }) {
  const [avlidenNamn, setAvlidenNamn] = useState("");
  const [ID, setID] = useState("");
  const [filtered, setFiltered] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Trim inputs to ignore accidental spaces
    const name = avlidenNamn?.trim().toLowerCase();
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

function ArendeTab({ arenden, godkannanden, setArenden, kyrkogardar, kunder, setKunder, activeArende, setActiveArende, setActiveTab}) {

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
  const [activeGodkannanden, setActiveGodkannanden] = useState(null);
  const [showMore, setShowMore] = useState(null);
  const [filter, setFilter] = useState(null);
  const [godkannandeToEdit, setGodkannandeToEdit] = useState(null);
  const [visaKundG, setVisaKundG] = useState(true);
  const [visaKyrkogardG, setVisaKyrkogardG] = useState(true);
  const [newDatum, setNewDatum] = useState(null);
  const [newKalla, setNewKalla] = useState(null);
  const [kommentarer, setKommentarer] = useState(null);
  const [createKommentar, setCreateKommentar] = useState(false);
  const [currentKommentar, setCurrentKommentar] = useState(null);
  const [oversiktEdit, setOversiktEdit] = useState(false);
  const [designEdit, setDesignEdit] = useState(false);
  const [typeToSearch, setTypeToSearch] = useState("");

useEffect(() => {
  if (!activeArende) return;

  const fetchGodkannanden = async () => {
    const allGodkannanden = await getGodkannanden();
    const filtered = allGodkannanden.filter(
      g => g.arendeID === activeArende.id
    );
    setActiveGodkannanden(filtered);
  };

  fetchGodkannanden();
}, [activeArende]);

useEffect(() => {
  if (!activeArende) return;

  const fetchKommentarer = async () => {
    const allKommentarer = await getKommentarer();
    const filtered = allKommentarer.filter(
      k => k.arendeID === activeArende.id
    );
    const sorted = filtered.sort((a, b) => b.id - a.id);
    ;
    setKommentarer(sorted);
  };

  fetchKommentarer();
}, [activeArende]);

 function displayGodkannande(g, godkannare) {
  if (!g || g.length === 0) return <></>;

  const godkannande = g.find(x => x.godkannare === godkannare);
  if (!godkannande) return <></>;

  return (
    <div className="godkannande-info">
      <p>Godkänt: {godkannande.datum}</p>
      <p>Källa: {godkannande.kalla}</p>
    </div>
  );
}

  useEffect(() => {
  async function loadArenden() {
    const data = await getArenden(); 
    console.log("Loaded ärenden:", data);
    setArenden(data); 
  }
  loadArenden(); 
  }, [activeArende]);


  async function handleDeleteButton(arende) {
    const isConfirmed = window.confirm(`Är du säker på att du vill ${arende.status !== "raderad" ? "radera" :"återställa"}?`);
    if (isConfirmed) {
      if (arende.status === "raderad"){
        const data = {...arende, status: "Nytt"}
        await updateArende(arende.id, data)
        const arenden = await getArenden();
        setArenden(arenden);
      }else {
        const data = {...arende, status: "raderad", deleted_at: new Date().toISOString()}
        await updateArende(arende.id, data)
        const arenden = await getArenden();
        setArenden(arenden);}
    } else {
    }
  }

function findKyrkogard(arende, kyrkogardar) {
  const kyrkogardString = arende.kyrkogard;
  return kyrkogardar.find(k => k.namn === kyrkogardString);
}

async function addDefaultGodkannande(id, godkannare){
      const godkannandeData = {arendeID: Number(id), godkannare: godkannare, datum: new Date().toISOString().split('T')[0], kalla: "Email"}
      await addGodkannande(godkannandeData)
}

async function updateArendeStatus(newStatus, arende){
  const updatedArende = {...arende, status: newStatus};
  await updateArende(arende.id, updatedArende)
  const arenden = await getArenden();
  setArenden(arenden)
}

async function findAndRemoveGodkannande(id, godkannare){
  const godkannanden = await getGodkannanden();
  const toRemove = godkannanden.find(g => g.arendeID === id && g.godkannare === godkannare)
  if (toRemove){
  await removeGodkannande(toRemove.id)
  console.log("badabing")}
 
  else {
    console.warn(`No matching godkännande found for ${godkannare} on ärende ${id}`);
  }
}

async function changeGodkannandeDetails(id, godkannare, data) {
  let godkannanden = [];
  try {
    godkannanden = await getGodkannanden();
  } catch (err) {
    console.log(err);
    return;}
  const toChange = godkannanden.find(
    g => g.arendeID === id && g.godkannare === godkannare);
  if (!toChange) {
    console.log("Hittar ej godkännande att uppdatera");
    return;}
  try {
    await updateGodkannande(toChange.id, data);
  } catch (err) {
    console.log(err);
  }
   setActiveGodkannanden(prev =>
    prev.map(g =>
      g.godkannare === godkannare ? { ...g, ...data } : g)
  );
}
function appendNameAndDate(innehall){
  const user = JSON.parse(localStorage.getItem('user') )
    const time = new Date();
    const timestamp = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()}, ${time.getHours()}:${time.getMinutes() > 10 ? time.getMinutes(): `0${time.getMinutes()}`}`
  if(user){
    const newContent = `\n\n${user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}\n${timestamp}`
    return innehall + newContent
  }
  else{
    const newContent = `\n\n${timestamp}`
    return innehall + newContent;
  }
}

async function addNewKommentar(innehall, id, e) {
  
  const newInnehall = appendNameAndDate(innehall);
  e.preventDefault();
  const numberID = Number(id)
  console.log(numberID)
  const tags = JSON.stringify(findTaggedUsers(innehall))
  const kommentar = {arendeID: numberID, innehall: newInnehall, tagged_users: tags}
  await addKommentarer(kommentar)
  setKommentarer(prevKommentarer => [...prevKommentarer, kommentar]);
  setCurrentKommentar("");
}

function findTaggedUsers(comment) {
  const regex = /@([^\s@]+)/g;
  const tags = [];
  let match;

  while ((match = regex.exec(comment)) !== null) {
    tags.push(match[1]);
  }

  return tags;
}


async function handleStatusChange(approver) {
  let newStatus = activeArende.status;

  if (approver === "kund") {
    if (activeArende.status === "Nytt") {
      newStatus = "Godkänd av kund";
      await addDefaultGodkannande(activeArende.id, "kund");
      setVisaKundG(true);
    } else if (activeArende.status === "Godkänd av kund") {
      newStatus = "Nytt";
      await findAndRemoveGodkannande(activeArende.id, "kund");
      setVisaKundG(false);
    } else if (activeArende.status === "Godkänd av kyrkogård") {
      newStatus = "Redo";
      await addDefaultGodkannande(activeArende.id, "kund");
      setVisaKundG(true);
    } else if (activeArende.status === "Redo") {
      newStatus = "Godkänd av kyrkogård";
      await findAndRemoveGodkannande(activeArende.id, "kund");
      setVisaKundG(false);
    } else if ( activeArende.status ==="Godkänd av kyrkogård, väntar svar av kund"){
      newStatus = "Redo";
      await addDefaultGodkannande(activeArende.id, "kund")
    } else if (activeArende.status ==="Godkänd av kund, väntar svar av kyrkogård"){
      newStatus = "Väntar svar av kyrkogård";
      await findAndRemoveGodkannande(activeArende.id, "kund")
    } else if (activeArende.status ==="Väntar svar av kund och kyrkogård"){
      newStatus = "Godkänd av kund, väntar svar av kyrkogård"
      await addDefaultGodkannande(activeArende.id, "kund")
    }  else if (activeArende.status === "Väntar svar av kyrkogård") {
      newStatus = "Godkänd av kund, väntar svar av kyrkogård"
      await addDefaultGodkannande(activeArende.id, "kund")
    } else if (activeArende.status === "Väntar svar av kund") {
      newStatus = "Godkänd av kund"
      await addDefaultGodkannande(activeArende.id, "kund")
    }
  }

  if (approver === "kyrkogård") {
    if (activeArende.status === "Nytt") {
      newStatus = "Godkänd av kyrkogård";
      await addDefaultGodkannande(activeArende.id, "kyrkogård");
      setVisaKyrkogardG(true);
    } else if (activeArende.status === "Godkänd av kyrkogård") {
      newStatus = "Nytt";
      await findAndRemoveGodkannande(activeArende.id, "kyrkogård");
      setVisaKyrkogardG(false);
    } else if (activeArende.status === "Godkänd av kund") {
      newStatus = "Redo";
      await addDefaultGodkannande(activeArende.id, "kyrkogård");
      setVisaKyrkogardG(true);
    } else if (activeArende.status === "Redo") {
      newStatus = "Godkänd av kund";
      await findAndRemoveGodkannande(activeArende.id, "kyrkogård");
      setVisaKyrkogardG(false);
    } else if (activeArende.status ==="Godkänd av kund, väntar svar av kyrkogård"){
      newStatus = "Redo";
      await addDefaultGodkannande(activeArende.id, "kyrkogård")
    } else if (activeArende.status ==="Godkänd av kyrkogård, väntar svar av kund"){
      newStatus = "Väntar svar av kund";
      await findAndRemoveGodkannande(activeArende.id, "kyrkogård")
    } else if (activeArende.status ==="Väntar svar av kund och kyrkogård"){
      newStatus = "Godkänd av kyrkogård, väntar svar av kund"
      await addDefaultGodkannande(activeArende.id, "kyrkogård")
    } else if (activeArende.status === "Väntar svar av kyrkogård") {
      newStatus = "Godkänd av kyrkogård"
      await addDefaultGodkannande(activeArende.id, "kyrkogård")
    } else if (activeArende.status === "Väntar svar av kund") {
      newStatus = "Godkänd av kyrkogård, väntar svar av kund"
      await addDefaultGodkannande(activeArende.id, "kyrkogård")
    }
  }

  setActiveArende(prev => ({ ...prev, status: newStatus }));
  await updateArende(activeArende.id, { status: newStatus });

  const data = await getArenden();
  setArenden(data);

  // Refresh godkannanden for display
  const updatedGodk = await getGodkannanden();
  setActiveGodkannanden(updatedGodk.filter(g => g.arendeID === activeArende.id));
}
function findTicketAmount(filter, results){

  const resultsfiltered = results.filter(r => r.arendeTyp === typeToSearch || typeToSearch === "");

  if(filter === "all"){
    return resultsfiltered.length
  }
  if(filter === "Nytt"){
    return resultsfiltered.filter(r => r.status === "Nytt" || r.status === "Väntar svar av kund" || r.status === "Väntar svar av kyrkogård").length;
  }
  if(filter === "Godkänd av kund"){
    return resultsfiltered.filter(r => r.status.includes("Godkänd av kund")).length;
  }
  if(filter === "Godkänd av kyrkogård"){
    return resultsfiltered.filter(r => r.status.includes("Godkänd av kyrkogård")).length;
  }
  if (filter === "Väntande"){
    return resultsfiltered.filter(r => r.status.toLowerCase().includes("vänt")).length
  }
  if(filter === "Redo"){
    return resultsfiltered.filter(r => r.status === "Redo").length;
  }
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
      ? (arende.bestallare ?? "").toLowerCase().includes(bestallare.toLowerCase())
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

  const statusOrder = [
  "Nytt",
  "Godkänd av kund",
  "Godkänd av kyrkogård",
  "Redo",
  "Väntar svar av kund",
  "Väntar svar av kyrkogård",
  "Godkänd av kund, väntar svar av kyrkogård",
  "Godkänd av kyrkogård, väntar svar av kund",
  "Stängt",
  "LEGACY"
  ];

  const resultSorted = result.sort((a, b) => {
  return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
});

  const [arendeDetailState, setArendeDetailState] = useState("oversikt");
  const [skapaArende, setSkapaArende] = useState(false);
  return (
    <div>
      {activeArende === null && (
        <>
          <div>
          <div className = "arende-tab-contents-further">
          <div>
          <div className = "arende-card-filter-panel">
            <button onClick = {() => setSkapaArende(!skapaArende)} className = "arende-card-filter-panel-create-button"><strong>+ Skapa nytt ärende</strong></button>
          </div>
          <form className="searchbar-arende">
            <div className = "header-and-dropdown">
            <h3>Sök ärende</h3>
            <select onChange = {(e) => setTypeToSearch(e.target.value)}>
              <option value = "">
                Välj typ av ärende
              </option>
              <option>
                Ny sten
              </option>
              <option>
                Stabilisering
              </option>
              <option>
                Nyinskription
              </option>
              <option>
                Inspektering
              </option>
            </select>
            </div>
            <div className = "input-field-searchbar-arende">
              <label>Namn på avliden</label>
              <input
                type="text"
                name="avlidenNamn"
                value={avlidenNamn}
                onChange={(e) => setAvlidenNamn(e.target.value)}
              />
            </div>
                        <div className = "input-field-searchbar-arende">
              <label>Beställare</label>
              <input
              type = "text"
              name = "bestallare"
              value = {bestallare}
              onChange = {(e) => setBestallare(e.target.value)}
              />
            </div>
            <div className = "input-field-searchbar-arende">
              <label>Email</label>
              <input
                type="text"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className = "input-field-searchbar-arende">
              <label>Telefonnummer</label>
              <input
                type="text"
                name="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
              />
            </div>
            <div className = "input-field-searchbar-arende">
              <label>Kyrkogård</label>
              <input
                type="text"
                name="kyrkogard"
                value={kyrkogard}
                onChange={(e) => setKyrkogard(e.target.value)}
              />
            </div>
          </form>
          <button onClick = {() => setFilter("raderade")}>Visa raderade ärenden</button>
          </div>
          {!skapaArende && <div>
          <div className = "arende-card-filter-panel">
            <button onClick = {() => setFilter(null)} className = {filter === null ? "arende-card-filter-panel-button-selected": "arende-card-filter-panel-button-normal"}>Alla ({findTicketAmount("all", resultSorted)})</button>
            <button onClick = {() => setFilter("nytt")} className = {filter === "nytt" ? "arende-card-filter-panel-button-selected": "arende-card-filter-panel-button-normal"}>Nya ({findTicketAmount("Nytt", resultSorted)})</button>
            <button onClick = {() => setFilter("godkänd av kund")} className = {filter === "godkänd av kund" ? "arende-card-filter-panel-button-selected": "arende-card-filter-panel-button-normal"}>Godkänt kund ({findTicketAmount("Godkänd av kund", resultSorted)})</button>
            <button onClick = {() => setFilter("godkänd av kyrkogård")} className = {filter === "godkänd av kyrkogård" ? "arende-card-filter-panel-button-selected": "arende-card-filter-panel-button-normal"}>Godkänt kyrkogård ({findTicketAmount("Godkänd av kyrkogård", resultSorted)})</button>
            <button onClick = {() => setFilter("redo")} className = {filter === "redo" ? "arende-card-filter-panel-button-selected": "arende-card-filter-panel-button-normal"}>Redo ({findTicketAmount("Redo", resultSorted)})</button>
            <button onClick = {() => setFilter("vänta")} className = {filter === "vänta" ? "arende-card-filter-panel-button-selected": "arende-card-filter-panel-button-normal"}>Väntande ({findTicketAmount("Väntande", resultSorted)})</button>
          </div>
          <div className = "scrollable-box">
          {resultSorted.filter(k => !filter && k.status !== "raderad" && typeToSearch === ""
          || filter === "raderade" && k.status === "raderad" 
          || typeToSearch === k.arendeTyp
          || k.status.toLowerCase().includes(filter) 
          || ((k.status === "Väntar svar av kyrkogård" 
          || k.status === "Väntar svar av kund") && filter === "nytt")).slice(0,50).map((arende) => (
            <div key={arende.id}   className={`arende-card-${arende.status === "Redo" ? "redo": arende.status === "Godkänd av kund" ? "kund": arende.status === "Godkänd av kyrkogård" ? "kyrkogard": arende.status === "LEGACY" ? "legacy": arende.status === "Stängt" ? "stangt" : "ny"}`}>
              <div>
              <div className = "arende-card-header-and-button">
              <h3 className = "truncate" onClick={() => {setActiveArende(arende); setActiveArendeKyrkogard(findKyrkogard(arende.id, kyrkogardar)); setShowMore(null); setArendeDetailState("oversikt")}}>{arende.avlidenNamn}: {arende.status}</h3>
              {showMore !== arende.id && <IoMdArrowDropright className = "dropdown-arrow" onClick = {() => {setShowMore(arende.id)}}/>}
              {showMore === arende.id && <IoMdArrowDropdown className = "dropdown-arrow" onClick = {() => {setShowMore(null)}}/>}
              </div>
              <h4 className = "dense-h4">{arende.arendeTyp}</h4>
              {(arende.status === "Godkänd av kund" && (arende.arendeTyp === "Nyinskription" || arende.arendeTyp === "Ny sten"))&&<button className = "send-button" onClick = {() => updateArendeStatus("Godkänd av kund, väntar svar av kyrkogård", arende)}>Skickat skiss →→</button>}
              {(arende.status === "Nytt" && (arende.arendeTyp === "Nyinskription" || arende.arendeTyp === "Ny sten"))&&<button className = "send-button-ny" onClick = {() => updateArendeStatus("Väntar svar av kund", arende)}>Skickat skiss →→</button>}
              {(arende.status === "Godkänd av kyrkogård" && (arende.arendeTyp === "Nyinskription" || arende.arendeTyp === "Ny sten"))&&<button className = "send-button" onClick = {() => updateArendeStatus("Godkänd av kyrkogård, väntar svar av kund", arende)}>Skickat skiss →→</button>}
              {(arende.status === "Nytt" )&&<button className = "send-button-ny" onClick = {() => updateArendeStatus("Väntar svar av kyrkogård", arende)}>Skickat ansökan →→</button>}
              {(arende.status === "Redo")&&<button className = "send-button" onClick = {() => updateArendeStatus("Stängt", arende)}>Arbete utfört</button>}
              {(arende.status === "Väntar svar av kund" )&&<button className = "send-button" onClick = {() => updateArendeStatus("Väntar svar av kund och kyrkogård", arende)}>Skickat ansökan →→</button>}
              {(arende.status === "Väntar svar av kyrkogård" && (arende.arendeTyp === "Nyinskription" || arende.arendeTyp === "Ny sten"))&&<button className = "send-button" onClick = {() => updateArendeStatus("Väntar svar av kund och kyrkogård", arende)}>Skickat skiss →→</button>}
              {showMore === arende.id && <div>
              <p><strong>{arende.status}</strong></p>
              <div className = "arende-card-info-entry"> 
              <IoPersonOutline className = "icon"></IoPersonOutline>
              <p>{arende.bestallare}</p>
              </div>
              <div className = "arende-card-info-entry">
              <HiOutlineMail className = "icon"/>
              <p>{arende.email}</p>
              </div>
              <div className = "arende-card-info-entry">
              <BsTelephone className = "icon"/>
              <p>{arende.tel}</p>
              </div>
              <div className = "arende-card-bottom">
              <div className = "arende-card-info-entry">
              <TbGrave2 className = "icon"/>
              <p>{arende.kyrkogard}</p>
              </div>
              </div>
              </div>}
              </div>
              <div>
              <button className = "delete-button-card" onClick = {(e) =>{e.stopPropagation(); handleDeleteButton(arende)}}>{arende.status !== "raderad" && <p>Radera</p>}{arende.status === "raderad" && <p>Återställ</p>}</button>
              </div>
            </div>
          ))}
          </div>
          </div>}
          </div>
          <div className = "new-stone-form-arenden">
          {skapaArende && <NewStoneForm arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} set = {setSkapaArende}/>}
          </div>
          </div>
        </>
      )}
      {activeArende !== null && <div>

        <div className = "arende-detail-container">
        <div className = "buttons-arende-detail">
        <button onClick = {() => {setActiveTab('Ärenden'); setActiveArende(null); setCreateKommentar(false)}}>← Tillbaka till sökfält</button>
        <button onClick = {() => setArendeDetailState("oversikt")}> Översikt</button>
        <button onClick = {() => setArendeDetailState("design")}>Design</button>
        <button onClick = {() => setArendeDetailState("godkannanden")}>Godkännanden</button>
        <button onClick = {() => setArendeDetailState("fakturor")}>Fakturor</button>
        <button onClick = {() => setArendeDetailState("kommentarer")}>Kommentarer ({kommentarer?.filter(k => k.arendeID === activeArende.id).length})</button>
        <button onClick = {() => setArendeDetailState("historik")}>Historik</button>
        </div>
        {arendeDetailState === "oversikt" && <div>
        <div className = "arende-detail-main">
        <div>
        <div className = "arende-detail-main-header-and-edit-button">
        <h2>{activeArende.avlidenNamn}</h2>
        <button onClick = {() => setOversiktEdit(!oversiktEdit)}>Redigera</button>
        </div>
        <h3>{activeArende.arendeTyp}</h3>
        <div className = "arende-detail">
        <p><strong>ID:</strong> {activeArende.id}</p>
        </div>
        <div className = "arende-checkboxes-container">
          <div className = "arende-checkboxes">
          <label><strong>Godkänd av kund</strong></label>
          <input type = "checkbox" name = "godkandKund" checked = {activeArende.status === "Godkänd av kund" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt" || activeArende.status == "Godkänd av kund, väntar svar av kyrkogård"}  onChange = {()=> handleStatusChange("kund")}></input>
          </div>
          <div className = "godkannande-info">{activeGodkannanden && displayGodkannande(activeGodkannanden, "kund")}</div>
          <div className = "arende-checkboxes">
          <label><strong>Godkänd av kyrkogård</strong></label>
          <input type = "checkbox" name = "godkandKyrkogard" checked = {activeArende.status === "Godkänd av kyrkogård" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt" || activeArende.status == "Godkänd av kyrkogård, väntar svar av kund"} onChange = { () => handleStatusChange("kyrkogård")}></input>
          </div>
          <div className = "godkannande-info">{activeGodkannanden && displayGodkannande(activeGodkannanden, "kyrkogård")}</div>
        <div>
        </div>
        {!oversiktEdit && <div>
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
        <p><strong>Kyrkogård:</strong></p><p className = "arende-detail-kyrkogard-p" onClick = {() => {setActiveArendeKyrkogard(true); setActiveArendeBestallare(false); setActiveKyrkogard(kyrkogardar.find(k => k.namn === activeArende.kyrkogard))}}>{activeArende.kyrkogard}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Kvarter:</strong> {activeArende.kvarter}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Gravnummer:</strong> {activeArende.gravnummer}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Status:</strong> {activeArende.status}</p> 
        </div>
        {activeArende.status === "raderad" && <div className = "arende-detail">
          <p>Raderad: {activeArende.deleted_at }</p>
          </div>}
        <div className = "arende-detail">
        <p><strong>Datum skapad:</strong> {activeArende.datum}</p>
        </div>
        <DownloadPdfButton arendeId = {activeArende.id}></DownloadPdfButton>
        </div>
}
{oversiktEdit && <OversiktEditForm arende = {activeArende} setOversiktEdit={setOversiktEdit} setActiveArende={setActiveArende}/>}
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
          <p><strong>Telefon:</strong> {activeArende.tel}</p>
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
        {arendeDetailState === "design" && <div>
          <div className = "arende-detail-main">
          <div>
          <div className = "arende-detail-main-header-and-edit-button">
          <h2>Designspecifikationer för {activeArende.avlidenNamn}</h2>
          <button onClick = {() => setDesignEdit(!designEdit)}>Redigera</button>
          </div>
          {!designEdit && <div>
          <p>Modell: <strong>{activeArende.modell}</strong></p>
          <p>Material: <strong>{activeArende.material}</strong></p>
          <p>Sockel?: <strong>{activeArende.sockel === 1 ? "Ja": "Nej"}</strong></p>
          <p>Typsnitt: <strong>{activeArende.typsnitt ?? "Typsnitt saknas"}</strong></p>
          <p>Färg: <strong>{activeArende.farg ?? "Färg saknas"}</strong></p>
          <p>Försänkt/Förhöjd: <strong>{activeArende.forsankt ?? "Information saknas"}</strong></p>
          <p>Plats för fler namn: <strong>{activeArende.platsForFlerNamn ?? "Nej"}</strong></p>
          <p>Namn: <strong>{activeArende.avlidenNamn ?? "Namn saknas"}</strong></p>
          <p>Symboler vid datum: <strong>{activeArende.symboler ?? "Inga symboler"}</strong></p>
          <p>Födelsedatum: <strong>{activeArende.fodelseDatum ?? "Födelsedatum saknas"}</strong></p>
          <p>Dödsdatum: <strong>{activeArende.dodsDatum ?? "Dödsdatum saknas"}</strong></p>
          <p>Minnesord: <strong>{activeArende.minnesord ?? "Minnesord saknas"}</strong></p>
          <p>Dekor: <strong>{activeArende.dekor ?? "Dekor saknas"}</strong></p>
          </div>}
          {designEdit && <DesignEditForm arende = {activeArende} setDesignEdit={setDesignEdit} setActiveArende={setActiveArende}/>}
          </div>
          </div>
          </div>}
        {arendeDetailState === "kontaktpersoner" && <div>
          <h2>Kontaktpersoner för {activeArende.avlidenNamn}</h2>
          <p>Gravrättsinnehavare: {activeArende.gravrattsinnehavare}</p>
          <p>Beställare: {activeArende.bestallare}</p>
          <p>Beställare telefon: {activeArende.tel}</p>
          <p>Beställare email: {activeArende.email}</p>
          </div>}
        {arendeDetailState === "godkannanden" && <div>
          {activeGodkannanden.map((g) =>
          <div className = "godkannande-container">
          <div className = "godkannande-header">
          <h3>Godkänd av {g.godkannare} </h3>
          <button onClick = {() => {setGodkannandeToEdit(g.godkannare === godkannandeToEdit ? null: g.godkannare); setNewDatum(g.datum); setNewKalla(g.kalla)}}>Redigera</button>
          </div>
          {godkannandeToEdit !== g.godkannare && <div>
          <p>Datum: {g.datum}</p>
          <p>Källa: {g.kalla}</p>
          </div>}
          {godkannandeToEdit === g.godkannare && <form onSubmit = { async (e) => { e.preventDefault(); await changeGodkannandeDetails(activeArende.id, g.godkannare, {arendeID: activeArende.id, godkannare: g.godkannare, datum: newDatum, kalla: newKalla}); setGodkannandeToEdit(null)}}>
            <div>
            <label>Datum: </label>
            <input onChange = {(e) => setNewDatum(e.target.value)} type = "text" value = {newDatum}></input>
            </div>
            <div>
            <label>Källa: </label>
            <input onChange = {(e) => setNewKalla(e.target.value)} type = "text" value = {newKalla}></input>
            </div>
            <button type = "submit">Ändra</button>
            </form>}
          </div>
          )}
          <div className = "arende-checkboxes">
          <label><strong>Godkänd av kund</strong></label>
          <input type = "checkbox" name = "godkandKund" checked = {activeArende.status === "Godkänd av kund" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt"}  onChange = {()=> handleStatusChange("kund")}></input>
          </div>          
          <div className = "arende-checkboxes">
          <label><strong>Godkänd av kyrkogård</strong></label>
          <input type = "checkbox" name = "godkandKyrkogard" checked = {activeArende.status === "Godkänd av kyrkogård" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt"} onChange = { () => handleStatusChange("kyrkogård")}></input>
          </div>
          </div>}
        {arendeDetailState === "kommentarer" && <div className = "kommentar-container">
          {kommentarer.map(k => <div className = "kommentar-card">
            <p><pre className = "pre">{k.innehall}</pre></p>
          </div>)}
        <button onClick = {() => setCreateKommentar(!createKommentar)}>+ Lägg till ny kommentar</button>
        {createKommentar && <form>
          <textarea className = "kommentarsfalt" onChange = {(e) => setCurrentKommentar(e.target.value)} value = {currentKommentar}></textarea>
          <button className = "lagg-till-kommentar-button" onClick = {(e) => {e.preventDefault(); addNewKommentar(currentKommentar, activeArende.id, e);}}>Lägg till kommentar</button>
          </form>}
          </div>}
        {arendeDetailState === "historik" && <div className = "historik-container">
          <p>Historik kommer finnas här</p>
          </div>}
        </div>
        </div>}
    </div>
  );
}

function KundTab({kunder, setKunder}) {
  
    const [kundNamn, setKundNamn] = useState("");
    const [id, setID] = useState("");
    const [email, setEmail] = useState("");
    const [tel, setTel] = useState("");

    async function handleDelete (id) {

      try {
        await removeKunder(id); // call backend
        setKunder(kunder.filter(k => k.id !== id)); // update state
      } 
      catch (err) {
        console.error("Error deleting arende:", err);
      }
  }
    

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
    <div className = "search-menu">
      <form className = "searchbar-kund">
      <h3>Sök kund</h3>
      <div className = "input-field-searchbar-kund">
      <label>Namn på kund</label>
      <input type = "text" name = "avlidenNamn" value = {kundNamn} onChange={(e) => setKundNamn(e.target.value)} ></input>
      </div>
      <div className = "input-field-searchbar-kund">
      <label>Kundnummer</label>
      <input type = "text" name = "id" value = {id} onChange={(e) => setID(e.target.value)}  ></input>
      </div>
      <div className = "input-field-searchbar-kund">
      <label>Email</label>
      <input type = "text" name = "email" value = {email} onChange={(e) => setEmail(e.target.value)}></input>
      </div>
      <div className = "input-field-searchbar-kund">
      <label>Telefonnummer</label>
      <input type = "text" name = "tel" value = {tel} onChange={(e) => setTel(e.target.value)} ></input>
      </div>
      </form>
      
    <div className = "kund-results">
      {result.slice(0,50).map((kund) => (
        <div key={kund.id} className="kund-card">
          <div className = "kund-card-h-and-button">
          <h3>{kund.id}: {kund.bestallare}</h3>
          <button className = "delete-button" onClick = {(e) =>{e.stopPropagation(); handleDelete(kund.id)}}>Radera</button>
          </div>
          <div className = "arende-card-info-entry">
          <MdOutlineEmail></MdOutlineEmail><p>{kund.email}</p>
          </div>
          <div className = "arende-card-info-entry">
          <BsTelephone></BsTelephone><p>{kund.telefonnummer}</p>
          </div>
      
        </div>
      ))}
      </div>
    </div>
  )
}

function LeverantorTab() {
  return <div>Leverantörslista</div>
}

function ActiveKyrkogardView({setKyrkogardTabState, setRedigering, setKyrkogardar, redigering, setActiveKyrkogard, activeKyrkogard, kyrkogardar}) {
  const [formData, setFormData] = useState({
    namn: activeKyrkogard.namn,
    kontaktperson: activeKyrkogard.kontaktperson,
    email: activeKyrkogard.email,
    telefonnummer: activeKyrkogard.telefonnummer,
    address: activeKyrkogard.address,
    ort: activeKyrkogard.ort,
    postnummer: activeKyrkogard.postnummer
});


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })}

  async function handleUpdate (e, id) {

    try{
    e.preventDefault();
    await updateKyrkogard(id, formData)
    setActiveKyrkogard({ ...activeKyrkogard, ...formData });
    const data = await getKyrkogardar();
    setKyrkogardar(data);

    }
    catch (err){
      console.log(err)
    }
  }

      
  return <div className = "sideways">
        <div>
        <div className = "button-panel-kyrkogard">
        <button onClick = {() => {setKyrkogardTabState(null)}}>← Tillbaka</button>
        <button onClick = {() => {setRedigering(!redigering);}}>Redigera kyrkogård</button>
        </div>
        <h3>{activeKyrkogard.namn}</h3>
        <div className = "arende-detail">
        <p><strong>Kontaktperson:</strong> {activeKyrkogard.kontaktperson}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Epost:</strong> {activeKyrkogard.email}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Telefonnummer:</strong> {activeKyrkogard.telefonnummer}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Adress:</strong> {activeKyrkogard.adress}, {activeKyrkogard.postnummer} {activeKyrkogard.ort}</p>
        </div>
        </div>
        {redigering && 
        <div className = "edit-window">
          <h3>Redigera kyrkogård</h3>
        <form className = "edit-form" onSubmit = {(e) => {handleUpdate(e, activeKyrkogard.id)}}>
          <label >Kontaktperson</label>
          <input type = "text" name = "kontaktperson" value = {formData.kontaktperson || ""}  onChange = {handleChange}></input>
          <label>Email</label>
          <input type = "text" name = "email"  value = {formData.email || ""} onChange = {handleChange}></input>
          <label>Telefonnummer</label>
          <input type = "text" name = "telefonnummer"  value = {formData.telefonnummer || ""} onChange = {handleChange}></input>
          <label>Adress</label>
          <input type = "text" name = "adress" value = {formData.address || ""} onChange = {handleChange}></input>
          <label>Ort</label>
          <input type = "text" name = "ort" value = {formData.ort || ""} onChange = {handleChange}></input>
          <label>Postnummer</label>
          <input type = "text" name = "postnummer" value = {formData.postnummer || ""} onChange = {handleChange}></input>
          <button type = "Submit">Ändra</button>
          </form>
          </div>
          }
        </div>   
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
  const [redigering, setRedigering] = useState(false)
  const [kyrkogardTabState, setKyrkogardTabState] = useState(null)
  const [searchNamn, setSearchNamn] = useState("")
  const [searchGrupp, setSearchGrupp] = useState("")
  const [loadMax, setLoadMax] = useState(50)

  async function handleDelete(id) {
  try {
    await removeKyrkogard(id); // call backend
    setKyrkogardar(kyrkogardar.filter(k => k.id !== id)); // update state
  } catch (err) {
    console.error("Error deleting kyrkogård:", err);
  }
}
  async function handleKyrkogardUpdate(id, new_data) {
    try {
      await updateKyrkogard(id, new_data)
    } catch (err) {
      console.error("Error updating kyrkogård", err)
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
    {kyrkogardTabState === null && <div>
    <div className = "kyrkogard-tab-buttons">
    <button onClick = {() => setFormVisible(!formVisible)} className = "add-kyrkogard-button">Lägg till kyrkogård</button>
    <button onClick = {() => setKyrkogardTabState("skapagrupp")} className = "add-kyrkogard-button">Skapa kyrkogårdsgruppering</button>
    <button onClick = {() => setKyrkogardTabState("slaihop")} className = "add-kyrkogard-button">Slå ihop flera kyrkogårdar</button>
    </div>
    {formVisible && <KyrkogardForm kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} formData = {formData} setFormData = {setFormData} />}
  <div className = "kyrkogard-main">
      <form className = "searchbar-kyrkogard">
      <h3>Sök kyrkogård</h3>
      <div className = "input-field-searchbar-kund">
      <label>Namn på kyrkogård</label>
      <input type = "text" name = "namn" onChange = {(e) => setSearchNamn(e.target.value)}></input>
      </div>
      <div className = "input-field-searchbar-kund">
      <label>Kyrkogårdsgrupp</label>
      <input type = "text" name = "grupp" onChange = {(e) => setSearchGrupp(e.target.value)} ></input>
      </div>
      </form>
  <div className = "kyrkogard-list">
  {[...kyrkogardar].filter(k => k && k.namn && k.namn.includes(searchNamn) && (k.kyrkogard_grupp?.includes(searchGrupp) || searchGrupp === "")).sort((a, b) => a.namn.localeCompare(b.namn)).slice(0,loadMax).map((kyrkogard) => (
    <div key={kyrkogard.id} className="kyrkogard-card" onClick={() => {setActiveKyrkogard(kyrkogard); setKyrkogardTabState(kyrkogard.id);}}>
      <div className = "kyrkogard-card-header">
      <h3>{kyrkogard.namn}</h3>
      <div>
      <button onClick = {(e) => {e.stopPropagation; setRedigering(true);}} className = "edit-button">Redigera</button>    
      <button onClick = {(e) =>{e.stopPropagation; handleDelete(kyrkogard.id);}} className = "del-button">Radera</button> 
      </div> 
      </div>
      <p>Adress: {kyrkogard.address}</p>
      <p>Kontakt: {kyrkogard.kontaktperson}</p>
      <p>Email: {kyrkogard.email}</p>
      <p>Kyrkogårdsnummer: {kyrkogard.id}</p>
    </div>
  ))}
  <button className = "load-more-button-kyrkogard" onClick = {() => setLoadMax(loadMax + 50)}>↓ Ladda mer ↓</button>
  </div>
  </div>
    </div>
}
{kyrkogardTabState === "slaihop" && <SlaIhopMenu kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} />}
{(activeKyrkogard !== null) && <ActiveKyrkogardView setKyrkogardTabState = {setKyrkogardTabState} activeKyrkogard = {activeKyrkogard} setRedigering = {setRedigering} setKyrkogardar = {setKyrkogardar} redigering = {redigering} setActiveKyrkogard = {setActiveKyrkogard} kyrkogardar = {kyrkogardar}/>}
</div>
}

function OversiktTab({setActiveTab, setActiveArende, arenden}) {
  const user = JSON.parse(localStorage.getItem('user'))
  const now = new Date();
  const [kommentarer, setKommentarer] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [newPassword, setNewPassword] = useState(null);
  const [passwordChecker, setPasswordChecker] = useState(null);

  useEffect(() => {
  const fetchKommentarer = async () => {
    const allKommentarer = await getKommentarer();
    const filtered = allKommentarer.filter(
      k => k.tagged_users.includes(user.userName)
    )
    const sorted = filtered.sort((a, b) => b.id - a.id);
    ;
    setKommentarer(sorted);
  };

  fetchKommentarer();
}, [user.userName]);

  function Greeting(){
    const hour = now.getHours();
    
    if(hour > 4 && hour < 10){
      return <h3 className = "greeting">God morgon, {user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}!</h3>
    }
    if(hour >= 10 && hour < 12){
      return <h3 className = "greeting">God förmiddag, {user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}!</h3>
    }
    if(hour >= 12 && hour < 18){
      return <h3 className = "greeting">God eftermiddag, {user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}!</h3>
    }
    if(hour >= 18 && hour <= 22){
      return <h3 className = "greeting">God kväll, {user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}!</h3>
    }

    return <h3 className = "greeting">Det är mitt i natten, {user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}!</h3>
    }
 
return <div>
  <div className = "sideways">
  <div className = "sideways">
  <Greeting/>
  <button onClick = {() =>{localStorage.removeItem('user'); <MainApp />; location.reload();}} className = "logout-button">Logga ut</button>
  </div>
  <div>
  <div className = "feed">
    <h3>Dina ärenden</h3>
  </div>
    <div className = "feed-container">
    {kommentarer?.filter(k => arenden.find(a => k.arendeID === a.id)).map(k => <div className = "feed-card">
      <div className = "feed-item-container" onClick = {() => setShowDetail(showDetail === k.id ? null: k.id)}>
      <div className = "feed-item-preview">
      <p>Du har taggats i ärende </p><p className = "feed-card-arende-id" onClick = {(e) => { e.stopPropagation(); setActiveTab('Ärenden'), setActiveArende(arenden.find(a => k.arendeID === a.id))}}><strong>#{k.arendeID}</strong></p>
      {showDetail !== k.id && <IoMdArrowDropright className = "icon-feed"></IoMdArrowDropright>}
      {showDetail === k.id && <IoMdArrowDropdown className = "icon-feed" onClick = {() => setShowDetail(showDetail === k.id ? null: k.id)}></IoMdArrowDropdown>}
      </div>
      {showDetail === k.id && <p><pre className = "pre">{k.innehall}</pre></p>}
      </div>
    </div>)}
    </div>
  </div>
  
  <div>
    <label>Nytt lösenord</label>
    <input type = "password" value = {newPassword} onChange = {(e) => setNewPassword(e.target.value)}></input>
    <label>Bekräfta lösenord</label>
    <input type = "password" value = {passwordChecker} onChange = {(e) => setPasswordChecker(e.target.value)}></input>
    <button onClick = {() => {updatePassword(JSON.parse(localStorage.getItem('user')), newPassword, passwordChecker); setNewPassword("")}}>Sätt lösenord</button>
  </div>
  </div>
  
</div>

}

function App(user) {

  const isAdmin = (JSON.parse(localStorage.getItem('user')) === "admin" ? true:false)

  const [activeTab, setActiveTab] = useState(isAdmin ? 'AdminView' : 'Översikt')
  const tabs = ['Översikt', 'Ärenden', 'Kunder', 'Leverantörer', 'Kyrkogårdar']
  const [arenden, setArenden] = useState([])
  const [kyrkogardar, setKyrkogardar] = useState([])
  const [kunder, setKunder] = useState([])
  const [godkannanden, setGodkannanden] = useState([])
  const [activeArende, setActiveArende] = useState(null)

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

    useEffect(() => {
  async function loadGodkannanden() {
    const data = await getGodkannanden(); 
    console.log("Loaded godkannanden:", data);
    setGodkannanden(data); 
  }
  loadGodkannanden(); 
  }, []);


  return (
    <>
      <div>
        <div className = "tab-bar">
          {tabs.map((tab) => (
            <button
            
            key = {tab}
            onClick = {() => {setActiveTab(tab); setActiveArende(null)}}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>)
          )}
        </div>
        <div className="tab-content">
          {activeTab === 'Email' && <EmailTab arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} />}
          {activeTab === 'Ärenden' && <ArendeTab arenden = {arenden} godkannanden = {godkannanden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} user = {user} activeArende = {activeArende} setActiveArende = {setActiveArende} setActiveTab = {setActiveTab}/>}
          {activeTab === 'Kunder' && <KundTab kunder = {kunder} setKunder = {setKunder}/>}
          {activeTab === 'Leverantörer' && <LeverantorTab/>}
          {activeTab === 'Kyrkogårdar' && <KyrkogardTab kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} />}
          {activeTab === 'Översikt' && <OversiktTab setActiveTab = {setActiveTab} setActiveArende = {setActiveArende} arenden = {arenden}/>}
          {activeTab === 'AdminView' && <AdminView/>}
        </div>
      </div>
    </>
  )
}

export default App

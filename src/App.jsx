import { useState, useEffect } from 'react'
import { getKyrkogardar, addKyrkogard, removeKyrkogard, updateKyrkogard, getArenden, addArende, removeArende, updateArende, getKunder, addKund, removeKunder, updateKund, getGodkannanden, addGodkannande, removeGodkannande, updateGodkannande, getKommentarer, addKommentarer, removeKommentarer, updateKommentar, updatePassword, getTraces } from "./api.js";
import { GoDotFill } from "react-icons/go";
import { BsTelephone } from "react-icons/bs";
import { MdEmail, MdOutlineEmail } from "react-icons/md";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import './App.css'
import MainApp from './MainApp.jsx'
import ArendeTab from './ArendeTab/ArendeTab.jsx'
import SlaIhopMenu from './SlaIhopMenu'
import EmailTab from './EmailTab.jsx'
import LeveransTab from './LeveransTab/LeveransTab.jsx'
import SkapaKyrkogardsgrupp from './KyrkogardTab/SkapaKyrkogardsgrupp.jsx'
import KundView from './KundTab/KundView/KundView.jsx'
import KyrkogardView from './KyrkogardTab/KyrkogardView/KyrkogardView.jsx'
import {Stenpedia} from './OversiktTab/Stenpedia/Stenpedia.jsx'
import linkToArende from './Helpers/linkToArende.js'
import EventLogTimeline from './OversiktTab/EventLogTimeline.jsx'
import ArbetsplaneringTab from './ArbetsplaneringTab/ArbetsplaneringTab.jsx'

function KundTab({setActiveArende, setActiveTab, arenden, kunder, setKunder}) {
  
    const [kundNamn, setKundNamn] = useState("");
    const [id, setID] = useState("");
    const [email, setEmail] = useState("");
    const [tel, setTel] = useState("");
    const [activeKund, setActiveKund] = useState(null)

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
    <div>
    {!activeKund && <div  className = "kund-search-menu">
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
        <div key={kund.id} className="kund-card" onClick = {() => setActiveKund(kund)}>
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
    </div>}
    {activeKund && <KundView setActiveTab = {setActiveTab} setActiveArende = {setActiveArende} activeKund = {activeKund} setActiveKund = {setActiveKund} arenden = {arenden} setKunder = {setKunder}/>}
    </div>
  )
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
      {label:"Ort       ", type:"text", name:"ort"},
      {label:"Postnummer", type:"text", name:"postnummer"}
    ]

    return <form onSubmit = {createKyrkogard} className = "form-k">
    {entries.map((entry, index) => (
      <div key = {index} className = "form-entry-k">
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

  const [formVisible, setFormVisible] = useState(false);
  const [activeKyrkogard, setActiveKyrkogard] = useState(null);
  const [redigering, setRedigering] = useState(false);
  const [kyrkogardTabState, setKyrkogardTabState] = useState(null);
  const [searchNamn, setSearchNamn] = useState("");
  const [searchGrupp, setSearchGrupp] = useState("");
  const [loadMax, setLoadMax] = useState(50);

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
    {kyrkogardTabState === null && <div>
    <div className = "kyrkogard-tab-buttons">
    <button onClick = {() => setFormVisible(!formVisible)} className = "add-kyrkogard-button">+ Lägg till kyrkogård</button>
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
  {[...kyrkogardar].filter(k => k && k.namn && k.namn.toLowerCase().includes(searchNamn.toLowerCase()) && (k.kyrkogard_grupp?.toLowerCase().includes(searchGrupp.toLowerCase()) || searchGrupp === "")).sort((a, b) => (a.namn ?? "").localeCompare((b.namn ?? ""))).slice(0,loadMax).map((kyrkogard) => (
    <div key={kyrkogard.id} className="kyrkogard-card" onClick={() => {setActiveKyrkogard(kyrkogard); setKyrkogardTabState(kyrkogard.id); console.log(kyrkogard)}}>
      <div className = "kyrkogard-card-header">
      <h3>{kyrkogard.namn}</h3>
      <div>
      <button onClick = {() => {setRedigering(true);}} className = "edit-button">Redigera</button>    
      <button onClick = {(e) =>{e.stopPropagation(); handleDelete(kyrkogard.id);}} className = "del-button">Radera</button> 
      </div> 
      </div>
      <p>Adress: {kyrkogard.address}</p>
      <p>Kontakt: {kyrkogard.kontaktperson}</p>
      <p>Email: {kyrkogard.email}</p>
      <p>Kyrkogårdsnummer: {kyrkogard.id}</p>
    </div>
  ))}
  <button className = "load-more-button-kyrkogard" onClick = {() => setLoadMax(loadMax + 50)}>↓ Ladda fler kyrkogårdar ↓</button>
  </div>
  </div>
    </div>
}
{kyrkogardTabState === "slaihop" && <SlaIhopMenu kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} />}
{kyrkogardTabState === "skapagrupp" && <SkapaKyrkogardsgrupp setKyrkogardTabState = {setKyrkogardTabState} kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar}/>}
{(activeKyrkogard !== null) && <KyrkogardView setKyrkogardTabState = {setKyrkogardTabState} activeKyrkogard = {activeKyrkogard} setRedigering = {setRedigering} setKyrkogardar = {setKyrkogardar} redigering = {redigering} setActiveKyrkogard = {setActiveKyrkogard} kyrkogardar = {kyrkogardar}/>}
</div>
}

function OversiktTab({setActiveTab, setActiveArende, arenden}) {

  async function seKommentar(kommentar){
    if(kommentar.seen === 2){
      return
    }
    const newKommentar =  {...kommentar, seen: Number(1)}
    try{

    console.log(newKommentar)
    await updateKommentar(kommentar.id, newKommentar)
    } catch (err){
      console.log(err)
    }
    setKommentarer(prev =>
    prev.map(k =>
      k.id === kommentar.id ? newKommentar : k
      )
    )
  }

  async function arkiveraKommentar(kommentar){

    let number

    if (kommentar.seen === 2){
      number = Number(1)
    }
    else{
      number = Number(2)
    }
    
    const newKommentar =  {...kommentar, seen: number}
    try{

    console.log(newKommentar)
    await updateKommentar(kommentar.id, newKommentar)
    } catch (err){
      console.log(err)
    }
    setKommentarer(prev =>
    prev.map(k =>
      k.id === kommentar.id ? newKommentar : k
      )
    )
  }

  const user = JSON.parse(localStorage.getItem('user'))
  const now = new Date();
  const [oversiktViewState, setOversiktViewState] = useState(null);
  const [kommentarer, setKommentarer] = useState(null);
  const [traces, setTraces] = useState([]);
  const [traceAmount, setTraceAmount] = useState(50)
  const [showDetail, setShowDetail] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordChecker, setPasswordChecker] = useState("");
  const [activeNotificationTab, setActiveNotificationTab] = useState("dina");
  const [eventLogMode, setEventLogMode] = useState("handelse");

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


useEffect(() => {
  const fetchTraces = async () => {
    const allTraces = await getTraces();
    setTraces(allTraces);
  };
  fetchTraces();
}, []);

  function Greeting(){
    const hour = now.getHours();
    
    if(hour > 4 && hour < 10){
      return <h3>God morgon, {user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}!</h3>
    }
    if(hour >= 10 && hour < 12){
      return <h3>God förmiddag, {user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}!</h3>
    }
    if(hour >= 12 && hour < 18){
      return <h3>God eftermiddag, {user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}!</h3>
    }
    if(hour >= 18 && hour <= 22){
      return <h3>God kväll, {user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}!</h3>
    }

    return <h3>Det är mitt i natten, {user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}!</h3>
    }
 
return <div className = "oversikt-view">
  {!oversiktViewState && <div>
  <div className = "sideways">
  <div className = "sideways">
  <div className = "greeting">
  <Greeting/>

  <button onClick = {async () => {setOversiktViewState("Stenpedia")}}>Stenpedia</button>
  <div className = "event-log-options">
  <h3 onClick = {() => setEventLogMode("handelse")}>Händelselogg</h3>
  <h3 onClick = {() => setEventLogMode("tidslinje")}>Tidslinje</h3>
  </div>
  {eventLogMode === "handelse" && (traces ? <div className = "handelselogg">
    { traces.sort((a,b) => b.id - a.id).slice(0,traceAmount).map((trace) => {const arende = arenden.find((arende) => arende.id === trace.arendeID); return <div> <strong onClick = {() => linkToArende(setActiveTab, setActiveArende, arende)} className = "trace-arende">#{trace.arendeID ?? ""} {arende?.avlidenNamn} </strong>: {trace.body} </div>})}
  <button onClick = {() => setTraceAmount(traceAmount + 50)}>Ladda fler</button>
  </div> : <p>Inga händelser kunde hittas</p>)}
  {eventLogMode === "tidslinje" && <EventLogTimeline />}
  
  
  </div>
  <button onClick = {() =>{localStorage.removeItem('user'); <MainApp />; location.reload();}} className = "logout-button">Logga ut</button>
  </div>
  <div>
    <div className = "feed-container">
      <div className = "notification-feed-tabs">
        <h4 className = {`notification-tab ${activeNotificationTab === "dina" ? "active" : ""}`} onClick = {() => setActiveNotificationTab("dina")}>Dina notifikationer</h4>
        <h4 className = {`notification-tab ${activeNotificationTab === "arkiverade" ? "active" : ""}`} onClick = {() => setActiveNotificationTab("arkiverade")}>Arkiverade notifikationer</h4>
      </div>
    {(kommentarer ?? []).filter(k => arenden.find(a => k.arendeID === a.id) && 
    (k.seen !== 2 && activeNotificationTab === "dina") || 
    (k.seen === 2 && activeNotificationTab === "arkiverade") ).map(k => <div className = "feed-card">
      <div className = {`feed-item-container ${k.seen === 0 ? "new" : ""}`} onClick = {async () => {setShowDetail(showDetail === k.id ? null: k.id); await seKommentar(k)}}>
      <div className = "feed-item-preview">
      <p className = "ny-notifikation">{k.seen === 0 ? <div className = "dot-wrapper"><GoDotFill className = "new-notification-dot" /></div> : ""}</p><p>Du har taggats i ärende </p><p className = "feed-card-arende-id" onClick = {(e) => { e.stopPropagation(); setActiveTab('Ärenden'), setActiveArende(arenden.find(a => k.arendeID === a.id))}}><strong>#{k.arendeID} {arenden.find((a) => k.arendeID === a.id).avlidenNamn}</strong></p>
      {showDetail !== k.id && <IoMdArrowDropright className = "icon-feed"></IoMdArrowDropright>}
      {showDetail === k.id && <IoMdArrowDropdown className = "icon-feed"></IoMdArrowDropdown>}
      <p className = "arkivera-kommentar" onClick = {(e) =>{e.stopPropagation(); arkiveraKommentar(k)}}>{k.seen === 2 ? "Ta ur arkiv" : "Arkivera"}</p>
      </div>
      {showDetail === k.id && <p><pre className = "pre">{k.innehall}</pre></p>}
      </div>
    </div>)}
    </div>
  </div>
  </div>
  </div>}
  {oversiktViewState === "Stenpedia" && <Stenpedia setOversiktViewState = {setOversiktViewState}/>}
</div>

}

function App(user) {

  const isAdmin = (JSON.parse(localStorage.getItem('user')) === "admin" ? true:false)

  const [activeTab, setActiveTab] = useState(isAdmin ? 'AdminView' : 'Översikt')
  const tabs = ['Översikt', 'Ärenden', 'Arbetsplanering', 'Leveranser', 'Kyrkogårdar']
  const [arenden, setArenden] = useState([])
  const [kyrkogardar, setKyrkogardar] = useState([])
  const [kunder, setKunder] = useState([])
  const [godkannanden, setGodkannanden] = useState([])
  const [activeArende, setActiveArende] = useState(null)

  useEffect(() => {
  async function loadKyrkogardar() {
    const data = await getKyrkogardar(); 
    setKyrkogardar(data); 
  }
  loadKyrkogardar(); 
  }, []);

  useEffect(() => {
  async function loadArenden() {
    const data = await getArenden(); 
    setArenden(data); 
  }
  loadArenden(); 
  }, []);

  useEffect(() => {
  async function loadKunder() {
    const data = await getKunder(); 
    setKunder(data); 
  }
  loadKunder(); 
  }, []);

    useEffect(() => {
  async function loadGodkannanden() {
    const data = await getGodkannanden(); 
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
          {activeTab === 'Kunder' && <KundTab setActiveArende = {setActiveArende} setActiveTab = {setActiveTab} arenden = {arenden} kunder = {kunder} setKunder = {setKunder}/>}
          {activeTab === 'Leveranser' && <LeveransTab setActiveArende = {setActiveArende} setActiveTab = {setActiveTab}/>}
          {activeTab === 'Arbetsplanering' && <ArbetsplaneringTab arenden = {arenden} />}
          {activeTab === 'Kyrkogårdar' && <KyrkogardTab kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} />}
          {activeTab === 'Översikt' && <OversiktTab setActiveTab = {setActiveTab} setActiveArende = {setActiveArende} arenden = {arenden}/>}
          {activeTab === 'AdminView' && <AdminView/>}
        </div>
      </div>
    </>
  )
}

export default App

import { useState, useEffect } from 'react'
import { getKyrkogardar, addKyrkogard, removeKyrkogard, getArenden, getKunder, removeKunder, getGodkannanden } from "./api.js";
import { BsTelephone } from "react-icons/bs";
import { MdOutlineEmail } from "react-icons/md";
import './App.css'
import ArendeTab from './ArendeTab/ArendeTab.jsx'
import SlaIhopMenu from './SlaIhopMenu'
import EmailTab from './EmailTab.jsx'
import LeveransTab from './LeveransTab/LeveransTab.jsx'
import SkapaKyrkogardsgrupp from './KyrkogardTab/SkapaKyrkogardsgrupp.jsx'
import KundView from './KundTab/KundView/KundView.jsx'
import KyrkogardView from './KyrkogardTab/KyrkogardView/KyrkogardView.jsx'
import OversiktTab from './OversiktTab/OversiktTab.jsx'
import ArbetsplaneringTab from './ArbetsplaneringTab/ArbetsplaneringTab.jsx'
import { useSeasonalTopBarTheme } from './Helpers/useSeasonalTopBarTheme.js'

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

function KyrkogardTab({kyrkogardar, setKyrkogardar, arenden, setActiveTab, setActiveArende, kyrkogardToOpen, setKyrkogardToOpen}) {

  const [formVisible, setFormVisible] = useState(false);
  const [activeKyrkogard, setActiveKyrkogard] = useState(null);
  const [redigering, setRedigering] = useState(false);
  const [kyrkogardTabState, setKyrkogardTabState] = useState(null);
  const [searchNamn, setSearchNamn] = useState("");
  const [searchGrupp, setSearchGrupp] = useState("");
  const [loadMax, setLoadMax] = useState(50);

  useEffect(() => {
    if (kyrkogardToOpen) {
      setActiveKyrkogard(kyrkogardToOpen);
      setKyrkogardTabState(kyrkogardToOpen.id);
      setKyrkogardToOpen(null);
    }
  }, [kyrkogardToOpen, setKyrkogardToOpen]);

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
    {kyrkogardTabState === null && <div className = "kyrkogard-list-section">
    <div className = "kyrkogard-tab-buttons">
    <button onClick = {() => setFormVisible(!formVisible)} className = "add-kyrkogard-button create-button">+ Lägg till kyrkogård</button>
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
{kyrkogardTabState === "slaihop" && <SlaIhopMenu kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} setKyrkogardTabState = {setKyrkogardTabState} />}
{kyrkogardTabState === "skapagrupp" && <SkapaKyrkogardsgrupp setKyrkogardTabState = {setKyrkogardTabState} kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar}/>}
{(activeKyrkogard !== null) && <KyrkogardView setKyrkogardTabState = {setKyrkogardTabState} activeKyrkogard = {activeKyrkogard} setRedigering = {setRedigering} setKyrkogardar = {setKyrkogardar} redigering = {redigering} setActiveKyrkogard = {setActiveKyrkogard} kyrkogardar = {kyrkogardar} arenden = {arenden} setActiveTab = {setActiveTab} setActiveArende = {setActiveArende}/>}
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
  const [kyrkogardToOpen, setKyrkogardToOpen] = useState(null)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark")
  const { availableThemes, enabledById, toggleTheme } = useSeasonalTopBarTheme()

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

  useEffect(() => {
    const nextTheme = darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  }, [darkMode]);


  return (
    <>
      <div className = "app-shell">
        <div className = "tab-bar">
          <div className = "tab-bar-toggles">
            <button
              className = {`theme-toggle theme-toggle-icon ${darkMode ? "theme-icon-sun" : "theme-icon-moon"}`}
              aria-label = {darkMode ? "Byt till ljust läge" : "Byt till mörkt läge"}
              title = {darkMode ? "Ljust läge" : "Mörkt läge"}
              onClick = {() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀" : "☾"}
            </button>
            {availableThemes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-toggle theme-toggle-icon seasonal-top-bar-toggle ${enabledById[theme.id] ? "seasonal-top-bar-toggle-active" : ""}`}
              aria-label={enabledById[theme.id] ? theme.disableLabel : theme.enableLabel}
              title={theme.title}
              onClick={() => toggleTheme(theme.id)}
            >
              {theme.icon}
            </button>
            ))}
          </div>
          <div className = "tab-buttons">
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
        </div>
        <div className="tab-content">
          {activeTab === 'Email' && <EmailTab arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} />}
          {activeTab === 'Ärenden' && <ArendeTab arenden = {arenden} godkannanden = {godkannanden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} user = {user} activeArende = {activeArende} setActiveArende = {setActiveArende} setActiveTab = {setActiveTab} setKyrkogardToOpen = {setKyrkogardToOpen}/>}
          {activeTab === 'Kunder' && <KundTab setActiveArende = {setActiveArende} setActiveTab = {setActiveTab} arenden = {arenden} kunder = {kunder} setKunder = {setKunder}/>}
          {activeTab === 'Leveranser' && <LeveransTab setActiveArende = {setActiveArende} setActiveTab = {setActiveTab}/>}
          {activeTab === 'Arbetsplanering' && <ArbetsplaneringTab arenden = {arenden} />}
          {activeTab === 'Kyrkogårdar' && <KyrkogardTab kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} arenden = {arenden} setActiveTab = {setActiveTab} setActiveArende = {setActiveArende} kyrkogardToOpen = {kyrkogardToOpen} setKyrkogardToOpen = {setKyrkogardToOpen}/>}
          {activeTab === 'Översikt' && <OversiktTab setActiveTab = {setActiveTab} setActiveArende = {setActiveArende} arenden = {arenden}/>}
        </div>
      </div>
    </>
  )
}

export default App

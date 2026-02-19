import { useState, useEffect } from 'react'
import { getKyrkogardar, addKyrkogard, removeKyrkogard, updateKyrkogard, getArenden, addArende, removeArende, updateArende, getKunder, addKund, removeKunder, updateKund, getGodkannanden, addGodkannande, removeGodkannande, updateGodkannande, getKommentarer, addKommentarer, removeKommentarer, updateKommentar, updatePassword } from "./api.js";
import { TbGrave2 } from "react-icons/tb";
import { GoDotFill } from "react-icons/go";
import { BsTelephone } from "react-icons/bs";
import { MdEmail, MdOutlineEmail } from "react-icons/md";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { HiOutlineMail } from "react-icons/hi";
import { IoPersonOutline } from "react-icons/io5";
import './App.css'
import MainApp from './MainApp.jsx'
import SlaIhopMenu from './SlaIhopMenu'
import ArendeCardButtons from './ArendeCardButtons.jsx'
import NewArendeForm from './ArendeTab/NewArendeForm/NewArendeForm.jsx'
import EmailTab from './EmailTab.jsx'
import findTicketAmount from './ArendeTab/findTicketAmount.jsx'
import ArendeCardFilterPanel from './ArendeTab/ArendeCardFilterPanel.jsx'
import LeveransTab from './LeveransTab/LeveransTab.jsx'
import SkapaKyrkogardsgrupp from './KyrkogardTab/SkapaKyrkogardsgrupp.jsx'
import laggTillTrace from './laggTillTrace.jsx'
import KundView from './KundTab/KundView/KundView.jsx'
import KyrkogardView from './KyrkogardTab/KyrkogardView/KyrkogardView.jsx'
import handleStatusChange from './handleStatusChange.jsx'
import {Stenpedia} from './OversiktTab/Stenpedia/Stenpedia.jsx'
import {ArendeDetailViewMain} from './ArendeTab/ArendeDetailViews/ArendeDetailViewMain.jsx'
import {DataViewMain} from './OversiktTab/DataView/DataViewMain.jsx'


function ArendeTab({arenden, godkannanden, setArenden, kyrkogardar, kunder, setKunder, activeArende, setActiveArende, setActiveTab}) {

  const [avlidenNamn, setAvlidenNamn] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [kyrkogard, setKyrkogard] = useState("");
  const [sorting, setSorting] = useState("default");
  const [bestallare, setBestallare] = useState("");
  const [activeArendeKyrkogard, setActiveArendeKyrkogard] = useState(false);
  const [arendeSliceLimit, setArendeSliceLimit] = useState(50)

  const [showMore, setShowMore] = useState(null);
  const [filter, setFilter] = useState([]);
  const [typeToSearch, setTypeToSearch] = useState("");

  const statusColor = {
    "Nytt": ["rgb(200,155,255)", "rgb(200,198,255)"],
    "Väntar svar av kund":["rgb(200,155,255)", "rgb(255, 225, 115)"],
    "Väntar svar av kyrkogård":["rgb(200,155,255)", "rgb(243, 100, 255)"],
    "Väntar svar av kund och kyrkogård":["rgb(200,155,255)", "rgb(123, 245, 200)"],
    "Godkänd av kund" : ["rgb(240, 245, 145)", "rgb(255, 225, 115)"],
    "Godkänd av kund, väntar svar av kyrkogård" : ["rgb(240, 245, 145)","rgb(243, 100, 255)"],
    "Godkänd av kyrkogård" : ["rgb(243, 145, 228)", "rgb(243, 100, 255) "],
    "Godkänd av kyrkogård, väntar svar av kund" : ["rgb(243, 145, 228)", "rgb(255, 225, 115)"],
    "Redo" : ["rgb(153, 245, 153)",  "rgb(123, 245, 200)"],
    "Stängt" : ["rgb(196, 196, 196)", "rgb(199, 199, 199)"],
    "LEGACY" : ["rgb(213, 223, 215)",  "rgb(223, 233, 225)"],
    "raderad" : ["rgb(200,155,255)", "rgb(200,198,255)"]
  }

  const typeColor = {
    "Ny sten": ["rgba(211, 229, 255, 1)", "rgba(211, 229, 255, 1)"],
    "Stabilisering": ["rgba(245, 211, 179, 1)", "rgba(245, 211, 179, 1)"],
    "Nyinskription": ["rgba(255, 211, 242, 1)", "rgba(255, 211, 242, 1)"],
    "Ommålning": ["rgba(255, 211, 211, 1)", "rgba(255, 211, 211, 1)"],
    "Rengöring": ["rgba(255, 248, 211, 1)", "rgba(255, 248, 211, 1)"],
    "Inspektering": ["rgba(252, 255, 211, 1)", "rgba(252, 255, 211, 1)"],
    "Övrigt" : ["rgba(200, 200, 200, 1)", "rgba(200, 200, 200, 1)"]
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
        laggTillTrace("återställde ärendet", arende)
      }else {
        const data = {...arende, status: "raderad", deleted_at: new Date().toISOString()}
        const godkannanden = await getGodkannanden();
        const toDelete = godkannanden.filter(g => g.arendeID === arende.id);

        // WAIT for all delete requests to finish
        await Promise.all(toDelete.map(g => removeGodkannande(g.id)));
        await updateArende(arende.id, data)
        const arenden = await getArenden();
        setArenden(arenden);
        laggTillTrace("raderade ärendet", arende)}
    } else {
    }
  }

function findKyrkogard(arende, kyrkogardar) {
  const kyrkogardString = arende.kyrkogard;
  return kyrkogardar.find(k => k.namn === kyrkogardString);
}

async function updateArendeStatus(newStatus, arende){

  //Update the status
  const updatedArende = {...arende, status: newStatus};
  await updateArende(arende.id, updatedArende)

  // Add trace
  await laggTillTrace(`ändrade status till ${newStatus}`, arende)

  //Set the live version to correspond to the database
  const arenden = await getArenden();
  setArenden(arenden)
}

  const result = arenden.filter((arende) => {
    const matchName = avlidenNamn
      ? (arende.avlidenNamn ?? "").toLowerCase().includes(avlidenNamn.toLowerCase())
      : true;
    const matchEmail = email
      ? (arende.email ?? "").toLowerCase().includes(email.toLowerCase())
      : true;
    const matchTel = tel ? (arende.tel ?? "").includes(tel) : true;
    const matchKyrkogard = kyrkogard
      ? (arende.kyrkogard ?? "").toLowerCase().includes(kyrkogard.toLowerCase())
      : true;
    const matchBestallare = bestallare
      ? (arende.bestallare ?? "").toLowerCase().includes(bestallare.toLowerCase())
      : true;

    return (
      matchName &&
      matchEmail &&
      matchTel &&
      matchKyrkogard &&
      matchBestallare
    );
  });

  function sortResults(result, mode) {

    const statusOrder = [
      "Nytt",
      "Godkänd av kund",
      "Godkänd av kyrkogård",
      "Redo",
      "Väntar svar av kund",
      "Väntar svar av kyrkogård",
      "Väntar svar av kund och kyrkogård",
      "Godkänd av kund, väntar svar av kyrkogård",
      "Godkänd av kyrkogård, väntar svar av kund",
      "Stängt",
      "LEGACY"
    ];

    if (mode === "default"){
      return result.sort((a, b) => {
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      });
      
    }
    else if (mode === "Nyaste"){
      return result.sort((a,b) => b.id - a.id);
    }
    else if (mode === "Äldsta"){
      return result.sort((a,b) => a.id - b.id);
    }
    else {
      return result.sort((a, b) => {
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      });
      
    }
  }

  const resultSorted = sortResults(result, sorting)
  const [skapaArende, setSkapaArende] = useState(false);
  return (
    <div>
      {activeArende === null && (
        <>
          <div>
          <div className = "arende-tab-contents-further">
          <div>
          {!skapaArende && <div className = "arende-card-filter-panel">
            <button onClick = {() => setSkapaArende(!skapaArende)} className = "arende-card-filter-panel-create-button"><strong>+ Skapa nytt ärende</strong></button>
          </div>}
          {!skapaArende && <form className="searchbar-arende">
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
                Nyinskription
              </option>
              <option>
                Stabilisering
              </option>
              <option>
                Rengöring
              </option>
              <option>
                Inspektering
              </option>
              <option>
                Ommålning
              </option>
              <option>
                Övrigt
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
          </form>}
          {!skapaArende && <button onClick = {() => setFilter(["raderad"])}>Visa raderade ärenden</button>}
          </div>
          {!skapaArende && <div>
          <ArendeCardFilterPanel typeToSearch = {typeToSearch} resultSorted = {resultSorted} setFilter = {setFilter} findTicketAmount = {findTicketAmount} setSorting = {setSorting}/>
          <div className = "scrollable-box">
          {resultSorted.filter(k => filter.length === 0 && k.status !== "raderad" && typeToSearch === ""
          || (k.status !== "raderad" || filter.some(f => f === "raderad")) && (typeToSearch === k.arendeTyp || typeToSearch === "") && (filter.some(f => f.toLowerCase() === k.status.toLowerCase()) || filter.length === 0)).slice(0,arendeSliceLimit).map((arende) => (
            <div key={arende.id} className= "arende-card-ny"
              style={{
              '--status-color-start': statusColor[arende.status]?.[0] || 'transparent',
              '--status-color-end': statusColor[arende.status]?.[1] || 'transparent',
              '--arendeType-color-start': typeColor[arende.arendeTyp]?.[0] || 'transparent',
              '--arende-type-color-end': typeColor[arende.arendeTyp]?.[1] || 'transparent'}}>
              <div>
              <div className = "arende-card-header-and-button">
              <h3 className = "truncate" onClick={() => {setActiveArende(arende); setActiveArendeKyrkogard(findKyrkogard(arende.id, kyrkogardar)); setShowMore(null); setTypeToSearch("");}}>{arende.avlidenNamn}: {arende.status}</h3>
              {showMore !== arende.id && <IoMdArrowDropright className = "dropdown-arrow" onClick = {() => {setShowMore(arende.id)}}/>}
              {showMore === arende.id && <IoMdArrowDropdown className = "dropdown-arrow" onClick = {() => {setShowMore(null)}}/>}
              </div>
              <div className = "arende-typ-checkboxes-and-header">
              <h4 className = "dense-h4">{arende.arendeTyp}</h4>
              {(arende.arendeTyp === "Ny sten" || arende.arendeTyp === "Nyinskription") && <div className = "arende-typ-checkboxes">
              <div>
              <label>Kund</label>
              <input type = "checkbox" checked = {arende.status === "Godkänd av kund" || arende.status === "Redo" || arende.status === "LEGACY" || arende.status === "Stängt" || arende.status === "Godkänd av kund, väntar svar av kyrkogård"} onChange = {() => handleStatusChange("kund", arende, setArenden)}></input>
              </div>
              <div>
              <label>Kyrkogård</label>
              <input type = "checkbox" checked = {arende.status === "Godkänd av kyrkogård" || arende.status === "Redo" || arende.status === "LEGACY" || arende.status === "Stängt" || arende.status === "Godkänd av kyrkogård, väntar svar av kund"} onChange = {() => handleStatusChange("kyrkogård", arende, setArenden)}></input>
              </div>
              </div>}
              </div>
              <ArendeCardButtons arende = {arende} updateArendeStatus = {updateArendeStatus}/>
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
          <button className = "load-more-button" onClick = {() => setArendeSliceLimit(arendeSliceLimit+50)}>↓ Ladda fler ärenden ↓</button>
          </div>  
          </div>}
          </div>
          <div className = "new-stone-form-arenden">
          {skapaArende && <NewArendeForm arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} setSkapaArende = {setSkapaArende} skapaArende = {skapaArende}/>}
          </div>
          </div>
        </>
      )}
      {activeArende !== null && <ArendeDetailViewMain activeArende = {activeArende} setActiveArende = {setActiveArende} setActiveTab = {setActiveTab} activeArendeKyrkogard = {activeArendeKyrkogard} setActiveArendeKyrkogard = {setActiveArendeKyrkogard} setArenden = {setArenden}/>}
    </div>
  );
}

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
  const [showDetail, setShowDetail] = useState(null);
  const [newPassword, setNewPassword] = useState(null);
  const [passwordChecker, setPasswordChecker] = useState(null);
  const [activeNotificationTab, setActiveNotificationTab] = useState("dina");

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
      <p className = "ny-notifikation">{k.seen === 0 ? <div className = "dot-wrapper"><GoDotFill className = "new-notification-dot" /></div> : ""}</p><p>Du har taggats i ärende </p><p className = "feed-card-arende-id" onClick = {(e) => { e.stopPropagation(); setActiveTab('Ärenden'), setActiveArende(arenden.find(a => k.arendeID === a.id))}}><strong>#{k.arendeID}</strong></p>
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
  const tabs = ['Översikt', 'Ärenden', 'Kunder', 'Leveranser', 'Kyrkogårdar']
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
          {activeTab === 'Kunder' && <KundTab setActiveArende = {setActiveArende} setActiveTab = {setActiveTab} arenden = {arenden} kunder = {kunder} setKunder = {setKunder}/>}
          {activeTab === 'Leveranser' && <LeveransTab setActiveArende = {setActiveArende} setActiveTab = {setActiveTab}/>}
          {activeTab === 'Kyrkogårdar' && <KyrkogardTab kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} />}
          {activeTab === 'Översikt' && <OversiktTab setActiveTab = {setActiveTab} setActiveArende = {setActiveArende} arenden = {arenden}/>}
          {activeTab === 'AdminView' && <AdminView/>}
        </div>
      </div>
    </>
  )
}

export default App

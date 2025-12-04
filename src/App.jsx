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
import ArendeCardButtons from './ArendeCardButtons.jsx'
import NewArendeForm from './ArendeTab/NewArendeForm/NewArendeForm.jsx'
import EmailTab from './EmailTab.jsx'
import findTicketAmount from './ArendeTab/findTicketAmount.jsx'
import ArendeCardFilterPanel from './ArendeTab/ArendeCardFilterPanel.jsx'
import LeveransTab from './LeveransTab/LeveransTab.jsx'
import SkapaKyrkogardsgrupp from './KyrkogardTab/SkapaKyrkogardsgrupp.jsx'


function ArendeTab({arenden, godkannanden, setArenden, kyrkogardar, kunder, setKunder, activeArende, setActiveArende, setActiveTab}) {

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
  const [filter, setFilter] = useState([]);
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
    "Inspektering": ["rgba(252, 255, 211, 1)", "rgba(252, 255, 211, 1)"]
  }
  
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
    const timestamp = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}, ${time.getHours()}:${time.getMinutes() > 10 ? time.getMinutes(): `0${time.getMinutes()}`}`
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
  const kommentar = {arendeID: numberID, innehall: newInnehall, tagged_users: tags, seen: 0}
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


async function handleStatusChange(approver, arende) {
  let newStatus = arende.status;

  if (approver === "kund") {
    if (arende.status === "Nytt") {
      newStatus = "Godkänd av kund";
      await addDefaultGodkannande(arende.id, "kund");
      setVisaKundG(true);
    } else if (arende.status === "Godkänd av kund") {
      newStatus = "Nytt";
      await findAndRemoveGodkannande(arende.id, "kund");
      setVisaKundG(false);
    } else if (arende.status === "Godkänd av kyrkogård") {
      newStatus = "Redo";
      await addDefaultGodkannande(arende.id, "kund");
      setVisaKundG(true);
    } else if (arende.status === "Redo") {
      newStatus = "Godkänd av kyrkogård";
      await findAndRemoveGodkannande(arende.id, "kund");
      setVisaKundG(false);
    } else if ( arende.status ==="Godkänd av kyrkogård, väntar svar av kund"){
      newStatus = "Redo";
      await addDefaultGodkannande(arende.id, "kund")
    } else if (arende.status ==="Godkänd av kund, väntar svar av kyrkogård"){
      newStatus = "Väntar svar av kyrkogård";
      await findAndRemoveGodkannande(arende.id, "kund")
    } else if (arende.status ==="Väntar svar av kund och kyrkogård"){
      newStatus = "Godkänd av kund, väntar svar av kyrkogård"
      await addDefaultGodkannande(arende.id, "kund")
    }  else if (arende.status === "Väntar svar av kyrkogård") {
      newStatus = "Godkänd av kund, väntar svar av kyrkogård"
      await addDefaultGodkannande(arende.id, "kund")
    } else if (arende.status === "Väntar svar av kund") {
      newStatus = "Godkänd av kund"
      await addDefaultGodkannande(arende.id, "kund")
    }
  }

  if (approver === "kyrkogård") {
    if (arende.status === "Nytt") {
      newStatus = "Godkänd av kyrkogård";
      await addDefaultGodkannande(arende.id, "kyrkogård");
      setVisaKyrkogardG(true);
    } else if (arende.status === "Godkänd av kyrkogård") {
      newStatus = "Nytt";
      await findAndRemoveGodkannande(arende.id, "kyrkogård");
      setVisaKyrkogardG(false);
    } else if (arende.status === "Godkänd av kund") {
      newStatus = "Redo";
      await addDefaultGodkannande(arende.id, "kyrkogård");
      setVisaKyrkogardG(true);
    } else if (arende.status === "Redo") {
      newStatus = "Godkänd av kund";
      await findAndRemoveGodkannande(arende.id, "kyrkogård");
      setVisaKyrkogardG(false);
    } else if (arende.status ==="Godkänd av kund, väntar svar av kyrkogård"){
      newStatus = "Redo";
      await addDefaultGodkannande(arende.id, "kyrkogård")
    } else if (arende.status ==="Godkänd av kyrkogård, väntar svar av kund"){
      newStatus = "Väntar svar av kund";
      await findAndRemoveGodkannande(arende.id, "kyrkogård")
    } else if (arende.status ==="Väntar svar av kund och kyrkogård"){
      newStatus = "Godkänd av kyrkogård, väntar svar av kund"
      await addDefaultGodkannande(arende.id, "kyrkogård")
    } else if (arende.status === "Väntar svar av kyrkogård") {
      newStatus = "Godkänd av kyrkogård"
      await addDefaultGodkannande(arende.id, "kyrkogård")
    } else if (arende.status === "Väntar svar av kund") {
      newStatus = "Godkänd av kyrkogård, väntar svar av kund"
      await addDefaultGodkannande(arende.id, "kyrkogård")
    }
  }
  
  if (activeArende){
  setActiveArende(prev => ({ ...prev, status: newStatus }));}
  await updateArende(arende.id, { status: newStatus });

  const data = await getArenden();
  setArenden(data);

  if (activeArende){

  // Refresh godkannanden for display
  const updatedGodk = await getGodkannanden();
  setActiveGodkannanden(updatedGodk.filter(g => g.arendeID === activeArende.id));}
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
          </form>
          <button onClick = {() => setFilter(["raderad"])}>Visa raderade ärenden</button>
          </div>
          {!skapaArende && <div>
          <ArendeCardFilterPanel typeToSearch = {typeToSearch} resultSorted = {resultSorted} setFilter = {setFilter} findTicketAmount = {findTicketAmount}/>
          <div className = "scrollable-box">
          {resultSorted.filter(k => filter.length === 0 && k.status !== "raderad" && typeToSearch === ""
          || (k.status !== "raderad" || filter.some(f => f === "raderad")) && (typeToSearch === k.arendeTyp || typeToSearch === "") && (filter.some(f => f === k.status.toLowerCase()) || filter.length === 0)).slice(0,50).map((arende) => (
            <div key={arende.id} className= "arende-card-ny"
              style={{
              '--status-color-start': statusColor[arende.status]?.[0] || 'transparent',
              '--status-color-end': statusColor[arende.status]?.[1] || 'transparent',
              '--arendeType-color-start': typeColor[arende.arendeTyp]?.[0] || 'transparent',
              '--arende-type-color-end': typeColor[arende.arendeTyp]?.[1] || 'transparent'}}>
              <div>
              <div className = "arende-card-header-and-button">
              <h3 className = "truncate" onClick={() => {setActiveArende(arende); setActiveArendeKyrkogard(findKyrkogard(arende.id, kyrkogardar)); setShowMore(null); setArendeDetailState("oversikt")}}>{arende.avlidenNamn}: {arende.status}</h3>
              {showMore !== arende.id && <IoMdArrowDropright className = "dropdown-arrow" onClick = {() => {setShowMore(arende.id)}}/>}
              {showMore === arende.id && <IoMdArrowDropdown className = "dropdown-arrow" onClick = {() => {setShowMore(null)}}/>}
              </div>
              <div className = "arende-typ-checkboxes-and-header">
              <h4 className = "dense-h4">{arende.arendeTyp}</h4>
              {(arende.arendeTyp === "Ny sten" || arende.arendeTyp === "Nyinskription") && <div className = "arende-typ-checkboxes">
              <div>
              <label>Kund</label>
              <input type = "checkbox" checked = {arende.status === "Godkänd av kund" || arende.status === "Redo" || arende.status == "LEGACY" || arende.status == "Stängt"} onClick = {() => handleStatusChange("kund", arende)}></input>
              </div>
              <div>
              <label>Kyrkogård</label>
              <input type = "checkbox" checked = {arende.status === "Godkänd av kyrkogård" || arende.status === "Redo" || arende.status == "LEGACY" || arende.status == "Stängt"} onClick = {() => handleStatusChange("kyrkogard", arende)}></input>
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
          </div>
          </div>}
          </div>
          <div className = "new-stone-form-arenden">
          {skapaArende && <NewArendeForm arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} setSkapaArende = {setSkapaArende} skapaArende = {skapaArende}/>}
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
        <button onClick = {() => setArendeDetailState("bestallningar")}>Att beställa</button>
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
          {(activeArende.arendeTyp === "Ny sten" || activeArende.arendeTyp === "Nyinskription") && <div>
          <div className = "arende-checkboxes">
          <label><strong>Godkänd av kund</strong></label>
          <input type = "checkbox" name = "godkandKund" checked = {activeArende.status === "Godkänd av kund" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt" || activeArende.status == "Godkänd av kund, väntar svar av kyrkogård"}  onChange = {()=> handleStatusChange("kund", activeArende)}></input>
          </div>
          <div className = "godkannande-info">{activeGodkannanden && displayGodkannande(activeGodkannanden, "kund")}</div>
          <div className = "arende-checkboxes">
          <label><strong>Godkänd av kyrkogård</strong></label>
          <input type = "checkbox" name = "godkandKyrkogard" checked = {activeArende.status === "Godkänd av kyrkogård" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt" || activeArende.status == "Godkänd av kyrkogård, väntar svar av kund"} onChange = { () => handleStatusChange("kyrkogård", activeArende)}></input>
          </div>
          <div className = "godkannande-info">{activeGodkannanden && displayGodkannande(activeGodkannanden, "kyrkogård")}</div>
          </div>}
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
{oversiktEdit && <OversiktEditForm arende = {activeArende} setOversiktEdit={setOversiktEdit} setActiveArende={setActiveArende} kyrkogardar = {kyrkogardar}/>}
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
          <p>Sockel?: <strong>{activeArende.sockel === true ? "Ja": "Nej"}</strong></p>
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
          <input type = "checkbox" name = "godkandKund" checked = {activeArende.status === "Godkänd av kund" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt"}  onChange = {()=> handleStatusChange("kund", activeArende)}></input>
          </div>          
          <div className = "arende-checkboxes">
          <label><strong>Godkänd av kyrkogård</strong></label>
          <input type = "checkbox" name = "godkandKyrkogard" checked = {activeArende.status === "Godkänd av kyrkogård" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt"} onChange = { () => handleStatusChange("kyrkogård", activeArende)}></input>
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
        {arendeDetailState === "bestallningar" && <div>
          <p>pp</p>
          </div>}
        </div>
        </div>}
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
    {!activeKund && <div className = "search-menu">
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
    {activeKund && <div>
      <div className = "kund-menu">
      <div className = "kund-info-field">
      <h4> {activeKund.bestallare}</h4>
      <p><strong>Telefon:</strong> {activeKund.telefonnummer}</p>
      <p><strong>E-post:</strong> {activeKund.email}</p>
      </div>
      <div>
        <h4>{activeKund.bestallare}s ärenden:</h4>
        {arenden.filter(a => a.bestallare === activeKund.bestallare).map(a => <div>
          <p className = "kund-to-arende-link" onClick = {() => {setActiveTab('Ärenden'); setActiveArende(a); setActiveKund(null)}}><strong>#{a.id} {a.avlidenNamn}</strong></p>
          </div>
          )}
      </div>
      </div>
      <button onClick = {() => {setActiveKund(null)}}>Tillbaka</button>
      </div>}
    </div>
  )
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
  {[...kyrkogardar].filter(k => k && k.namn && k.namn.toLowerCase().includes(searchNamn.toLowerCase()) && (k.kyrkogard_grupp?.toLowerCase().includes(searchGrupp.toLowerCase()) || searchGrupp === "")).sort((a, b) => (a.namn ?? "").localeCompare((b.namn ?? ""))).slice(0,loadMax).map((kyrkogard) => (
    <div key={kyrkogard.id} className="kyrkogard-card" onClick={() => {setActiveKyrkogard(kyrkogard); setKyrkogardTabState(kyrkogard.id); console.log(kyrkogard)}}>
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
{kyrkogardTabState === "skapagrupp" && <SkapaKyrkogardsgrupp setKyrkogardTabState = {setKyrkogardTabState} kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar}/>}
{(activeKyrkogard !== null) && <ActiveKyrkogardView setKyrkogardTabState = {setKyrkogardTabState} activeKyrkogard = {activeKyrkogard} setRedigering = {setRedigering} setKyrkogardar = {setKyrkogardar} redigering = {redigering} setActiveKyrkogard = {setActiveKyrkogard} kyrkogardar = {kyrkogardar}/>}
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
      <p className = "ny-notifikation">{k.seen === 0 ? "Nytt!" : ""}</p><p>Du har taggats i ärende </p><p className = "feed-card-arende-id" onClick = {(e) => { e.stopPropagation(); setActiveTab('Ärenden'), setActiveArende(arenden.find(a => k.arendeID === a.id))}}><strong>#{k.arendeID}</strong></p>
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

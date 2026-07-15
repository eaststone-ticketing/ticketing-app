import {useState, useEffect} from 'react'

import { getKommentarer, getGodkannanden, addKommentarer, removeKommentarer, updateGodkannande, getKyrkogardar, getBilder, updateArende } from '../../api.js'

import DownloadPdfButton from '../../PdfDownloadButton.jsx'
import handleStatusChange from '../../handleStatusChange.jsx'
import DesignEditForm from '../../DesignEditForm'
import HistorikPage from './HistorikView/HistorikPage.jsx'
import ArendeComponentPage from './ArendeComponentPage/ArendeComponentPage.jsx'
import {GodkannandeDisplayOversikt} from './OversiktPage/GodkannandeDisplayOversikt.jsx'
import './ArendeDetailViewMain.css'
import { statusColor } from '../../Helpers/ticketColors.js'
import { FaRegEdit } from "react-icons/fa";
import {Infobox} from "./Infoboxes/Infobox.jsx"
import StenView from './StenView/StenView'
import  ArendeImageView from './ArendeImageView/ArendeImageView.jsx'

export function ArendeDetailViewMain({setActiveArende, activeArende, setActiveTab, activeArendeKyrkogard, setActiveArendeKyrkogard, setArenden, setKyrkogardToOpen}) {

const [activeKyrkogard, setActiveKyrkogard] = useState("");
const [kyrkogardar, setKyrkogardar] = useState([])
const [activeArendeBestallare, setActiveArendeBestallare] = useState(false);
const [godkannandeToEdit, setGodkannandeToEdit] = useState(null);
const [newDatum, setNewDatum] = useState(null);
const [newKalla, setNewKalla] = useState(null);
const [kommentarer, setKommentarer] = useState([]);
const [createKommentar, setCreateKommentar] = useState(false);
const [currentKommentar, setCurrentKommentar] = useState(null);
const [designEdit, setDesignEdit] = useState(false);
const [activeGodkannanden, setActiveGodkannanden] = useState([]);
const [arendeDetailState, setArendeDetailState] = useState("oversikt");
const [arendeBilderCount, setArendeBilderCount] = useState(0);

useEffect(() => {

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

useEffect(() => {

  const fetchKyrkogardar = async () => {
    const kyrkogardar = await getKyrkogardar();
    setKyrkogardar(kyrkogardar);
  };
  fetchKyrkogardar();
}, [activeArende]);

useEffect(() => {

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
  const fetchBilder = async () => {
    const allBilder = await getBilder();
    const filtered = allBilder.filter(
      b => b.arendeID === activeArende.id
    );
    setArendeBilderCount(filtered.length);
  };

  fetchBilder();
}, [activeArende]);


async function addNewKommentar(innehall, id, e) {
  
  const newInnehall = appendNameAndDate(innehall);
  e.preventDefault();
  const numberID = Number(id)
  const tags = JSON.stringify(findTaggedUsers(innehall))
  const kommentar = {arendeID: numberID, innehall: newInnehall, tagged_users: tags, seen: 0}
  const savedKommentar = await addKommentarer(kommentar)
  setKommentarer(prevKommentarer => [...prevKommentarer, savedKommentar?.id ? savedKommentar : kommentar]);
  setCurrentKommentar("");
}

// A comment's author is embedded as the second-to-last line of its content
// (name followed by timestamp), appended by appendNameAndDate.
function isOwnKommentar(kommentar) {
  const user = JSON.parse(localStorage.getItem('user'))
  if (!user?.userName) return false;
  const lines = (kommentar.innehall ?? "").trim().split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return false;
  const authorLine = lines[lines.length - 2];
  return authorLine.toLowerCase() === user.userName.toLowerCase();
}

async function deleteKommentar(kommentar) {
  if (!window.confirm("Är du säker på att du vill radera kommentaren?")) return;
  try {
    await removeKommentarer(kommentar.id);
    setKommentarer(prev => prev.filter(k => k.id !== kommentar.id));
  } catch (err) {
    console.error(err);
  }
}

function openKyrkogard() {
  const kyrkogardToOpen = kyrkogardar.find(k => k.namn === activeArende.kyrkogard);
  if (!kyrkogardToOpen) return;
  setKyrkogardToOpen(kyrkogardToOpen);
  setActiveArende(null);
  setActiveTab('Kyrkogårdar');
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

function appendNameAndDate(innehall){
  const user = JSON.parse(localStorage.getItem('user') )
    const time = new Date();
    const timestamp = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}, ${time.getHours()}:${time.getMinutes() > 9 ? time.getMinutes(): `0${time.getMinutes()}`}`
  if(user){
    const newContent = `\n\n${user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}\n${timestamp}`
    return innehall + newContent
  }
  else{
    const newContent = `\n\n${timestamp}`
    return innehall + newContent;
  }
}

async function handleSignerad(arende, setArendenFn) {
  const newValue = arende.signerad === 1 ? 0 : 1;
  const updatedArende = { ...arende, signerad: newValue };
  setActiveArende(prev => ({ ...prev, signerad: newValue }));
  setArendenFn(prev =>
    prev.map(a => a.id === arende.id ? updatedArende : a)
  );
  await updateArende(arende.id, updatedArende);
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

return (<div>
        <div className = "arende-detail-container">
        <div className = "buttons-arende-detail">
        <button onClick = {() => {setActiveTab('Ärenden'); setActiveArende(null); setCreateKommentar(false)}}>← Tillbaka till sökfält</button>
        <button className = {arendeDetailState === "oversikt" ? "active" : ""} onClick = {() => setArendeDetailState("oversikt")}>Översikt</button>
        <button className = {arendeDetailState === "design" ? "active" : ""} onClick = {() => setArendeDetailState("design")}>Design</button>
        <button className = {arendeDetailState === "sten" ? "active" : ""} onClick = {() => setArendeDetailState("sten")}>Sten</button>
        <button disabled = {activeArende.arendeTyp !== "Nyinskription" && activeArende.arendeTyp !== "Ny sten"} className = {arendeDetailState === "godkannanden" ? "active" : ""} onClick = {() => setArendeDetailState("godkannanden")}>Godkännanden</button>
        <button className = {arendeDetailState === "fakturor" ? "active" : ""} onClick = {() => setArendeDetailState("fakturor")}>Fakturor</button>
        <button className = {arendeDetailState === "kommentarer" ? "active" : ""} onClick = {() => setArendeDetailState("kommentarer")}>Kommentarer ({kommentarer?.filter(k => k.arendeID === activeArende.id).length})</button>
        <button className = {arendeDetailState === "historik" ? "active" : ""} onClick = {() => setArendeDetailState("historik")}>Historik</button>
        <button className = {arendeDetailState === "bilder" ? "active" : ""} onClick = {() => setArendeDetailState("bilder")}>Bilder ({arendeBilderCount})</button>
        <button className = {arendeDetailState === "bestallningar" ? "active" : ""} onClick = {() => setArendeDetailState("bestallningar")}>Tillbehör</button>
        </div>
        {arendeDetailState === "oversikt" && <div>
        <div className = "arende-detail-main">
        <div className = "arende-detail-main-contents">
        <div className = "arende-detail-main-header"
          style={{
              '--status-color-start': statusColor[activeArende.status]?.[0] || 'transparent',
              '--status-color-end': statusColor[activeArende.status]?.[1] || 'transparent'}}>
        <div className = "arende-detail-main-header-and-edit-button">
        <h2>{activeArende.avlidenNamn}</h2>
        <DownloadPdfButton arende = {activeArende} />
        </div>
        <h3>{activeArende.arendeTyp}</h3>
        </div>

        <div className = "arende-detail-oversikt-layout">
        <div className = "arende-detail-oversikt-content-grid">

        <Infobox activeArende = {activeArende} setActiveArende = {setActiveArende} header = {"Avliden"}
        onKyrkogardClick = {openKyrkogard}
        fields = { [["", "avlidenNamn", "text"],
                    ["Födelsedatum", "fodelseDatum", "text"], 
                    ["Dödsdatum", "dodsDatum", "text"],
                    ["Ärendetyp", "arendeTyp", "typ"],
                    ["Kyrkogård", "kyrkogard", "kyrkogard"],
                    ["Kvarter", "kvarter", "text"],
                    ["Gravnummer", "gravnummer", "text"],
                    ...(!["Högalid", "Lilla Dalen", "Ny sten"].includes(activeArende.arendeTyp)
                      ? [["Nuvarande text", "nuvarandeText", "text"]]
                      : [])]}/>
      
        <Infobox activeArende = {activeArende} setActiveArende = {setActiveArende} header = {"Beställare"} 
        fields = { [["", "bestallare", "text"], 
                    ["E-post", "email", "text"], 
                    ["Telefon", "tel", "text"], 
                    ["Adress", "adress", "text"],
                    ["Postnummer", "postnummer", "text"],
                    ["Ort", "ort", "text"],
                    ["Gravrättsinnehavare", "gravrattsinnehavare", "text"]]}/>
        
        
        <Infobox activeArende = {activeArende} setActiveArende = {setActiveArende} header = {"Ärendeinformation"} editAllowed = {false}
        fields = {[["ID", "id", "text"],
                  ["Status", "status", "text"],
                  ["Datum skapad", "datum", "text"],
                  ["Ursprung", "ursprung", "text"]
                  ]}>
          {(activeArende.arendeTyp === "Ny sten" || activeArende.arendeTyp === "Nyinskription") && <div className = "arende-detail-checkboxes-container">
            <div className = "arende-detail-checkboxes">
              <label>Godkänd av kund</label>
              <input type = "checkbox" name = "godkandKund" checked = {activeArende.status === "Godkänd av kund" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt" || activeArende.status == "Godkänd av kund, väntar svar av kyrkogård"}  onChange = {()=> handleStatusChange("kund", activeArende, setArenden, setActiveGodkannanden, setActiveArende)}></input>
            </div>
            <div className = "arende-detail-checkboxes">
              <label>Godkänd av kyrkogård</label>
              <input type = "checkbox" name = "godkandKyrkogard" checked = {activeArende.status === "Godkänd av kyrkogård" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt" || activeArende.status == "Godkänd av kyrkogård, väntar svar av kund"} onChange = { () => handleStatusChange("kyrkogård", activeArende, setArenden,  setActiveGodkannanden, setActiveArende)}></input>
            </div>
            {activeArende.arendeTyp === "Ny sten" && <div className = "arende-detail-checkboxes">
              <label>Signerad</label>
              <input type = "checkbox" name = "signerad" checked = {activeArende.signerad === 1 || activeArende.status === "Väntar svar av kyrkogård" || activeArende.status === "Godkänd av kund, väntar svar av kyrkogård" || activeArende.status === "Väntar svar av kund och kyrkogård" || activeArende.status === "Godkänd av kyrkogård" || activeArende.status === "Godkänd av kyrkogård, väntar svar av kund" || activeArende.status === "Redo" || activeArende.status === "Stängt"} onChange = {() => handleSignerad(activeArende, setArenden)} />
            </div>}
          </div>}
        </Infobox>
                <Infobox activeArende = {activeArende} setActiveArende = {setActiveArende} header = {"Pris"} 
        fields = {[["Total", "pris", "text"]
                  ]} />
        </div>
        <div className = "arende-detail-oversikt-comments">
          <h3>Kommentarer</h3>
          <div className = "arende-detail-oversikt-comments-scroll">
            {kommentarer.length === 0 && <p>Inga kommentarer ännu.</p>}
            {kommentarer.map(k => (
              <div className = "kommentar-card" key = {k.id}>
                <div className = "arende-detail-oversikt-comment-text">{k.innehall}</div>
                {isOwnKommentar(k) && <button className = "delete-kommentar-button" onClick = {() => deleteKommentar(k)}>Radera</button>}
              </div>
            ))}
          </div>
        </div>
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
          <p>Sockel: <strong>{activeArende.sockel === 1 ? "Ja": "Nej"}</strong></p>
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
          <p>Stående: <strong>{activeArende.staende === 1 ? "Ja": "Nej"}</strong></p>
          </div>}
          {designEdit && <DesignEditForm arende = {activeArende} setDesignEdit={setDesignEdit} setActiveArende={setActiveArende}/>}
          </div>
          </div>
          </div>}
        {arendeDetailState === "sten" && <StenView activeArende = {activeArende} setActiveArende={setActiveArende}/>}
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
          <div className = "arende-detail-checkboxes">
          <label><strong>Godkänd av kund</strong></label>
          <input type = "checkbox" name = "godkandKund" checked = {activeArende.status === "Godkänd av kund" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt"}  onChange = {()=> handleStatusChange("kund", activeArende, setArenden, setActiveGodkannanden, setActiveArende)}></input>
          </div>          
          <div className = "arende-detail-checkboxes">
          <label><strong>Godkänd av kyrkogård</strong></label>
          <input type = "checkbox" name = "godkandKyrkogard" checked = {activeArende.status === "Godkänd av kyrkogård" || activeArende.status === "Redo" || activeArende.status == "LEGACY" || activeArende.status == "Stängt"} onChange = { () => handleStatusChange("kyrkogård", activeArende, setArenden, setActiveGodkannanden, setActiveArende)}></input>
          </div>
          </div>}
        {arendeDetailState === "kommentarer" && <div className = "kommentar-container">
          {kommentarer.map(k => <div className = "kommentar-card" key = {k.id}>
            <pre className = "pre">{k.innehall}</pre>
            {isOwnKommentar(k) && <button className = "delete-kommentar-button" onClick = {() => deleteKommentar(k)}>Radera</button>}
          </div>)}
        <button onClick = {() => setCreateKommentar(!createKommentar)}>+ Lägg till ny kommentar</button>
        {createKommentar && <form>
          <textarea className = "kommentarsfalt" onChange = {(e) => setCurrentKommentar(e.target.value)} value = {currentKommentar}></textarea>
          <button className = "lagg-till-kommentar-button" onClick = {(e) => {e.preventDefault(); addNewKommentar(currentKommentar, activeArende.id, e);}}>Lägg till kommentar</button>
          </form>}
          </div>}
        {arendeDetailState === "historik" && <div className = "historik-container">
          <HistorikPage arende = {activeArende}/>
          </div>}
        {arendeDetailState === "bilder" && <div className = "bilder-container"> 
          <ArendeImageView activeArende = {activeArende}/>
          </div>}
        {arendeDetailState === "bestallningar" && <ArendeComponentPage arende = {activeArende}/>}
        </div>
        </div>)
}
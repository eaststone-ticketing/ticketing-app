import {useState, useEffect} from 'react'

import { getKommentarer, getGodkannanden, addKommentarer, updateGodkannande, getKyrkogardar } from '../../api.js'

import DownloadPdfButton from '../../PdfDownloadButton.jsx'
import handleStatusChange from '../../handleStatusChange.jsx'
import DesignEditForm from '../../DesignEditForm'
import HistorikPage from './HistorikView/HistorikPage.jsx'
import ArendeComponentPage from './ArendeComponentPage/ArendeComponentPage.jsx'
import {GodkannandeDisplayOversikt} from './OversiktPage/GodkannandeDisplayOversikt.jsx'
import './ArendeDetailViewMain.css'
import { FaRegEdit } from "react-icons/fa";
import {Infobox} from "./Infoboxes/Infobox.jsx"

export function ArendeDetailViewMain({setActiveArende, activeArende, setActiveTab, activeArendeKyrkogard, setActiveArendeKyrkogard, setArenden}) {

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
const [avlidenEdit, setAvlidenEdit] = useState(false);
const [bestallareEdit, setBestallareEdit] = useState(false);
const [kyrkogardEdit, setKyrkogardEdit] = useState(false);

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
        <button onClick = {() => setArendeDetailState("oversikt")}> Översikt</button>
        <button onClick = {() => setArendeDetailState("design")}>Design</button>
        <button disabled = {activeArende.arendeTyp !== "Nyinskription" && activeArende.arendeTyp !== "Ny sten"} onClick = {() => setArendeDetailState("godkannanden")}>Godkännanden</button>
        <button onClick = {() => setArendeDetailState("fakturor")}>Fakturor</button>
        <button onClick = {() => setArendeDetailState("kommentarer")}>Kommentarer ({kommentarer?.filter(k => k.arendeID === activeArende.id).length})</button>
        <button onClick = {() => setArendeDetailState("historik")}>Historik</button>
        <button onClick = {() => setArendeDetailState("bestallningar")}>Tillbehör</button>
        </div>
        {arendeDetailState === "oversikt" && <div>
        <div className = "arende-detail-main">
        <div className = "arende-detail-main-contents">
        <div className = "arende-detail-main-header">
        <div className = "arende-detail-main-header-and-edit-button">
        <h2>{activeArende.avlidenNamn}</h2>
        <DownloadPdfButton arende = {activeArende} />
        </div>
        <h3>{activeArende.arendeTyp}</h3>
        </div>

        <div className = "arende-detail-oversikt-content-grid">

        <Infobox activeArende = {activeArende} setActiveArende = {setActiveArende} header = {"Avliden"} 
        fields = { [["Födelsedatum", "fodelseDatum", "text"], 
                    ["Dödsdatum", "dodsDatum", "text"]]}/>
      
        <Infobox activeArende = {activeArende} setActiveArende = {setActiveArende} header = {"Beställare"} 
        fields = { [["Namn", "bestallare", "text"], 
                    ["Email", "email", "text"], 
                    ["Telefonnummer", "tel", "text"], 
                    ["Gravrättsinnehavare", "gravrattsinnehavare", "text"]]}/>
        
        <Infobox activeArende = {activeArende} setActiveArende = {setActiveArende} header = {"Kyrkogård"} 
        fields = {[["Namn", "kyrkogard", "kyrkogard"],
                  ["Kvarter", "kvarter", "text"],
                  ["Gravnummer", "gravnummer", "text"]
                  ]} />
        
        <div className = "arende-detail-arende-infobox">
        <h3>Ärendeinformation</h3>
        <div className = "arende-detail">
        <p><strong>ID:</strong> {activeArende.id}</p>
        </div>
        <div className = "arende-detail">
        <p><strong>Status:</strong> {activeArende.status}</p> 
        <div className = "arende-detail">
        <p><strong>Datum skapad:</strong> {activeArende.datum}</p>
        </div>
        <div className = "arende-detail">
          <p><strong>Ursprung:</strong> {activeArende.ursprung}</p>
        </div>
        </div>
        {activeArende.status === "raderad" && <div className = "arende-detail">
          <p>Raderad: {activeArende.deleted_at }</p>
        </div>}
        </div>
                <Infobox activeArende = {activeArende} setActiveArende = {setActiveArende} header = {"Pris"} 
        fields = {[["Total", "pris"]
                  ]} />
                <div className = "arende-detail-checkboxes-container">
          {(activeArende.arendeTyp === "Ny sten" || activeArende.arendeTyp === "Nyinskription") && <GodkannandeDisplayOversikt activeArende = {activeArende} activeGodkannanden = {activeGodkannanden} setArenden = {setArenden} setActiveArende = {setActiveArende} setActiveGodkannanden = {setActiveGodkannanden}/>}
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
          <HistorikPage arende = {activeArende}/>
          </div>}
        {arendeDetailState === "bestallningar" && <ArendeComponentPage arende = {activeArende}/>}
        </div>
        </div>)
}
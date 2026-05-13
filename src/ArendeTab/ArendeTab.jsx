import { useState, useEffect } from 'react'
import { getArenden, updateArende, getGodkannanden, removeGodkannande, getTraces } from "../api.js";
import { TbGrave2 } from "react-icons/tb";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { HiOutlineMail } from "react-icons/hi";
import { IoPersonOutline } from "react-icons/io5";
import ArendeCardButtons from '../ArendeCardButtons.jsx'
import NewArendeForm from './NewArendeForm/NewArendeForm.jsx'
import findTicketAmount from './findTicketAmount.jsx'
import ArendeCardFilterPanel from './ArendeCardFilterPanel.jsx'
import laggTillTrace from '../laggTillTrace.jsx'
import handleStatusChange from '../handleStatusChange.jsx'
import {ArendeDetailViewMain} from './ArendeDetailViews/ArendeDetailViewMain.jsx'
import { BsTelephone } from "react-icons/bs";

import '../App.css'

export default function ArendeTab({arenden, setArenden, kyrkogardar, kunder, setKunder, activeArende, setActiveArende, setActiveTab}) {

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
  const [ursprungToSearch, setUrsprungToSearch] = useState("");
  const [skapareToSearch, setSkapareToSearch] = useState("");
  const [arendeVisibilityFilter, setArendeVisibilityFilter] = useState("alla");
  const [skapareByArendeId, setSkapareByArendeId] = useState({});
  const skapareOptions = ["Ali", "Felix", "Ian", "Ieva", "Lotten", "Martin"];
  const loggedInUserName = JSON.parse(localStorage.getItem("user"))?.userName ?? "";

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
    setArenden(data); 
  }
  loadArenden(); 
  }, [activeArende]);

  useEffect(() => {
    async function loadSkapareByArende() {
      const traces = await getTraces();
      const skapareMap = {};

      traces.forEach((trace) => {
        if (!trace?.arendeID || typeof trace?.body !== "string") {
          return;
        }
        if (!trace.body.includes(" har skapat ärendet")) {
          return;
        }

        const [skapare] = trace.body.split(" har skapat ärendet");
        if (!skapareMap[trace.arendeID] && skapare) {
          skapareMap[trace.arendeID] = skapare.trim();
        }
      });

      setSkapareByArendeId(skapareMap);
    }

    loadSkapareByArende();
  }, []);


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

async function handleSignerad(arende) {
  const newValue = arende.signerad === 1 ? 0 : 1;
  const updatedArende = { ...arende, signerad: newValue };
  setArenden(prev =>
    prev.map(a => a.id === arende.id ? updatedArende : a)
  );
  await updateArende(arende.id, updatedArende);
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
    const matchSkapare = skapareToSearch
      ? (skapareByArendeId[arende.id] ?? "").toLowerCase().includes(skapareToSearch.toLowerCase())
      : true;
    const matchMinaArenden = arendeVisibilityFilter === "mina"
      ? (arende.assignedTo ?? "").toLowerCase() === loggedInUserName.toLowerCase()
      : true;

    return (
      matchName &&
      matchEmail &&
      matchTel &&
      matchKyrkogard &&
      matchBestallare &&
      matchSkapare &&
      matchMinaArenden
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
            <select onChange = {(e) => setUrsprungToSearch(e.target.value)}>
              <option value = "">Välj ursprung</option>
              <option>Eaststone</option>
              <option>Stockholms Gravstenar</option>
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
            <div className = "input-field-searchbar-arende skapare-field">
              <select
                className = "skapare-dropdown"
                name = "skapare"
                value = {skapareToSearch}
                onChange = {(e) => setSkapareToSearch(e.target.value)}
              >
                <option value = "">Välj skapare</option>
                {skapareOptions.map((skapare) => (
                  <option key = {skapare} value = {skapare}>
                    {skapare}
                  </option>
                ))}
              </select>
            </div>
          </form>}
          {!skapaArende && <button onClick = {() => setFilter(["raderad"])}>Visa raderade ärenden</button>}
          </div>
          {!skapaArende && <div>
          <ArendeCardFilterPanel typeToSearch = {typeToSearch} ursprungToSearch = {ursprungToSearch} resultSorted = {resultSorted} setFilter = {setFilter} findTicketAmount = {findTicketAmount} setSorting = {setSorting} sorting = {sorting} arendeVisibilityFilter = {arendeVisibilityFilter} setArendeVisibilityFilter = {setArendeVisibilityFilter}/>
          <div className = "scrollable-box">
          {resultSorted.filter(k => filter.length === 0 && k.status !== "raderad" && typeToSearch === "" && ursprungToSearch === ""
          || (k.status !== "raderad" || filter.some(f => f === "raderad")) && (typeToSearch === k.arendeTyp || typeToSearch === "") && (ursprungToSearch === k.ursprung || ursprungToSearch === "") && (filter.some(f => f.toLowerCase() === k.status.toLowerCase()) || filter.length === 0)).slice(0,arendeSliceLimit).map((arende) => (
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
              {arende.arendeTyp === "Ny sten" && <div>
              <label>Signerad</label>
              <input type = "checkbox" checked = {arende.signerad === 1 || arende.status === "Väntar svar av kyrkogård" || arende.status === "Godkänd av kund, väntar svar av kyrkogård" || arende.status === "Väntar svar av kund och kyrkogård" || arende.status === "Godkänd av kyrkogård" || arende.status === "Godkänd av kyrkogård, väntar svar av kund" || arende.status === "Redo" || arende.status === "Stängt"} onChange = {() => handleSignerad(arende)} />
              </div>}
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
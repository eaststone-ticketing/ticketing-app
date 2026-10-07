import { useState, useEffect } from 'react'
import { getArenden, updateArende, getGodkannanden, removeGodkannande, getTraces } from "../api.js";
import ArendeCard from './ArendeCard.jsx'
import NewArendeForm from './NewArendeForm/NewArendeForm.jsx'
import findTicketAmount from './findTicketAmount.jsx'
import ArendeCardFilterPanel from './ArendeCardFilterPanel.jsx'
import laggTillTrace from '../laggTillTrace.jsx'
import {ArendeDetailViewMain} from './ArendeDetailViews/ArendeDetailViewMain.jsx'
import matchesTypeSearch from '../Helpers/matchesTypeSearch.js'

import '../App.css'

// Every free-text attribute of an ärende that can be searched in "Avancerad sökning".
const AVANCERAD_SOKNING_FIELDS = [
  ["Adress", "adress"],
  ["Ort", "ort"],
  ["Postnummer", "postnummer"],
  ["Gravrättsinnehavare", "gravrattsinnehavare"],
  ["Kvarter", "kvarter"],
  ["Gravnummer", "gravnummer"],
  ["Modell", "modell"],
  ["Material", "material"],
  ["Symboler", "symboler"],
  ["Beteckning", "beteckning"],
  ["Framsida", "framsida"],
  ["Kanter", "kanter"],
  ["Sockelbearbetning", "sockelBearbetning"],
  ["Typsnitt", "typsnitt"],
  ["Försänkt/Förhöjd", "forsankt"],
  ["Färg", "farg"],
  ["Dekor", "dekor"],
  ["Plats för fler namn", "platsForFlerNamn"],
  ["Minnesord", "minnesord"],
  ["Pris", "pris"],
  ["Tillbehör", "tillbehor"],
  ["Nuvarande text", "nuvarandeText"],
  ["Status", "status"],
  ["Datum skapad", "datum"],
  ["Födelsedatum", "fodelseDatum"],
  ["Dödsdatum", "dodsDatum"]
];

export default function ArendeTab({arenden, setArenden, kyrkogardar, kunder, setKunder, activeArende, setActiveArende, setActiveTab, setKyrkogardToOpen}) {

  const [avlidenNamn, setAvlidenNamn] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [kyrkogard, setKyrkogard] = useState("");
  const [sorting, setSorting] = useState("default");
  const [bestallare, setBestallare] = useState("");
  const [avanceradSokning, setAvanceradSokning] = useState(false);
  const [avanceradSokningValues, setAvanceradSokningValues] = useState({});
  const [activeArendeKyrkogard, setActiveArendeKyrkogard] = useState(false);
  const [arendeSliceLimit, setArendeSliceLimit] = useState(50)
  const [showMore, setShowMore] = useState(null);
  const [filter, setFilter] = useState([]);
  const [typeToSearch, setTypeToSearch] = useState("");
  const [ursprungToSearch, setUrsprungToSearch] = useState("");
  const [skapareToSearch, setSkapareToSearch] = useState("");
  const [arendeVisibilityFilter, setArendeVisibilityFilter] = useState("alla");
  const [onlyEjFakturerade, setOnlyEjFakturerade] = useState(false);
  const [onlyEjSignerade, setOnlyEjSignerade] = useState(false);
  const [skapareByArendeId, setSkapareByArendeId] = useState({});
  const [includeLegacy, setIncludeLegacy] = useState(false)
  const skapareOptions = ["Ali", "Felix", "Ian", "Ieva", "Lotten", "Martin"];
  const loggedInUserName = JSON.parse(localStorage.getItem("user"))?.userName ?? "";

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
    const matchEjFakturerade = onlyEjFakturerade
      ? arende.fakturerad !== 1
      : true;
    const matchEjSignerade = onlyEjSignerade
      ? arende.signerad !== 1
      : true;
    const matchAvancerad = !avanceradSokning || Object.entries(avanceradSokningValues).every(([key, value]) =>
      !value || String(arende[key] ?? "").toLowerCase().includes(value.toLowerCase())
    );

    return (
      matchName &&
      matchEmail &&
      matchTel &&
      matchKyrkogard &&
      matchBestallare &&
      matchSkapare &&
      matchMinaArenden &&
      matchEjFakturerade &&
      matchEjSignerade &&
      matchAvancerad
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
    <div className = "arende-tab-root">
      {activeArende === null && (
        <>
          <div className = "arende-tab-contents-further">
          <div className = "arende-search-column">
          {!skapaArende && <div className = "arende-card-filter-panel">
            <button onClick = {() => setSkapaArende(!skapaArende)} className = "arende-card-filter-panel-create-button create-button">+ Skapa nytt ärende</button>
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
                Inspektion
              </option>
              <option>
                Ommålning
              </option>
              <option>
                Omslipning
              </option>
              <option>
                Övrigt
              </option>
              <option>
                Högalid
              </option>
              <option>
                Lilla Dalen
              </option>
            </select>
            <select onChange = {(e) => setUrsprungToSearch(e.target.value)}>
              <option value = "">Välj ursprung</option>
              <option>Eaststone</option>
              <option>Stockholms Gravstenar</option>
            </select>

            </div>
            <div className = "sok-arende-filter-toggles">
              <button
                type = "button"
                className = {onlyEjFakturerade ? "sok-arende-filter-toggle active" : "sok-arende-filter-toggle"}
                onClick = {() => setOnlyEjFakturerade(!onlyEjFakturerade)}
              >
                Ej fakturerade
              </button>
              <button
                type = "button"
                className = {onlyEjSignerade ? "sok-arende-filter-toggle active" : "sok-arende-filter-toggle"}
                onClick = {() => setOnlyEjSignerade(!onlyEjSignerade)}
              >
                Ej signerade
              </button>
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
            <button
              type = "button"
              className = "avancerad-sokning-toggle"
              onClick = {() => setAvanceradSokning(!avanceradSokning)}
            >
              {avanceradSokning ? "Dölj avancerad sökning" : "Avancerad sökning"}
            </button>
            {avanceradSokning && <div className = "avancerad-sokning-grid">
              {AVANCERAD_SOKNING_FIELDS.map(([label, key]) => (
                <div key = {key} className = "avancerad-sokning-entry">
                  <label>{label}</label>
                  <input
                    type = "text"
                    value = {avanceradSokningValues[key] ?? ""}
                    onChange = {(e) => setAvanceradSokningValues({...avanceradSokningValues, [key]: e.target.value})}
                  />
                </div>
              ))}
            </div>}
          </form>}
          {!skapaArende && <div><button onClick = {() => setFilter(["raderad"])}>Visa raderade ärenden</button> <button onClick = {() => setIncludeLegacy(!includeLegacy)}>{!includeLegacy ? "Inkludera LEGACY" : "Ignorera LEGACY"}</button></div>}
          </div>
          {!skapaArende && <div className = "arende-results-column">
          <ArendeCardFilterPanel typeToSearch = {typeToSearch} ursprungToSearch = {ursprungToSearch} resultSorted = {resultSorted} setFilter = {setFilter} findTicketAmount = {findTicketAmount} setSorting = {setSorting} sorting = {sorting} arendeVisibilityFilter = {arendeVisibilityFilter} setArendeVisibilityFilter = {setArendeVisibilityFilter} includeLegacy = {includeLegacy}/>
          <div className = "scrollable-box">
          {resultSorted.filter(k => filter.length === 0 && k.status !== "raderad" && typeToSearch === "" && ursprungToSearch === ""
          || (k.status !== "raderad" || filter.some(f => f === "raderad")) && matchesTypeSearch(k.arendeTyp, typeToSearch) && (ursprungToSearch === k.ursprung || ursprungToSearch === "") && (filter.some(f => f.toLowerCase() === k.status.toLowerCase()) || filter.length === 0)).filter(k => k.status !== "LEGACY" || includeLegacy).filter(k => !onlyEjFakturerade || k.fakturerad !== 1).filter(k => !onlyEjSignerade || k.signerad !== 1).slice(0,arendeSliceLimit).map((arende) => (
            <ArendeCard
              key={arende.id}
              arende={arende}
              showMore={showMore}
              setShowMore={setShowMore}
              setActiveArende={setActiveArende}
              setActiveArendeKyrkogard={setActiveArendeKyrkogard}
              setTypeToSearch={setTypeToSearch}
              kyrkogardar={kyrkogardar}
              setArenden={setArenden}
              updateArendeStatus={updateArendeStatus}
              handleDeleteButton={handleDeleteButton}
            />
          ))}
          <button className = "load-more-button" onClick = {() => setArendeSliceLimit(arendeSliceLimit+50)}>↓ Ladda fler ärenden ↓</button>
          </div>  
          </div>}
          {skapaArende && <div className = "new-stone-form-arenden">
          <NewArendeForm arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} setSkapaArende = {setSkapaArende} skapaArende = {skapaArende}/>
          </div>}
          </div>
        </>
      )}
      {activeArende !== null && <ArendeDetailViewMain activeArende = {activeArende} setActiveArende = {setActiveArende} setActiveTab = {setActiveTab} setArenden = {setArenden} kyrkogardar = {kyrkogardar} setKyrkogardToOpen = {setKyrkogardToOpen}/>}
    </div>
  );
}
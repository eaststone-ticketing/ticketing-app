import { useState, useEffect } from 'react'
import { getArenden, updateArende, getTraces } from "../api.js";
import ArendeCard from './ArendeCard.jsx'
import ArendeListRow, { ArendeListHeader } from './ArendeListRow.jsx'
import NewArendeForm from './NewArendeForm/NewArendeForm.jsx'
import findTicketAmount from './findTicketAmount.jsx'
import ArendeCardFilterPanel from './ArendeCardFilterPanel.jsx'
import ArendeTabSearchMenu from './ArendeTabSearchMenu/ArendeTabSearchMenu.jsx'
import laggTillTrace from '../laggTillTrace.jsx'
import recordAnsokan from '../recordAnsokan.js'
import {ArendeDetailViewMain} from './ArendeDetailViews/ArendeDetailViewMain.jsx'
import matchesTypeSearch from '../Helpers/matchesTypeSearch.js'
import { initialApprovalState } from '../Helpers/approvalFields.js'

import '../App.css'

const DEFAULT_SEARCH = {
  avlidenNamn: "",
  email: "",
  tel: "",
  kyrkogard: "",
  bestallare: "",
  typeToSearch: "",
  ursprungToSearch: "",
  skapareToSearch: "",
  onlyEjFakturerade: false,
  onlyEjSignerade: false,
  avanceradSokning: false,
  avanceradSokningValues: {},
  includeLegacy: false,
};

export default function ArendeTab({arenden, setArenden, kyrkogardar, kunder, setKunder, activeArende, setActiveArende, setActiveTab, setKyrkogardToOpen}) {

  const [search, setSearch] = useState(DEFAULT_SEARCH);
  const [sorting, setSorting] = useState("default");
  const [arendeSliceLimit, setArendeSliceLimit] = useState(50)
  const [showMore, setShowMore] = useState(null);
  const [filter, setFilter] = useState([]);
  const [arendeVisibilityFilter, setArendeVisibilityFilter] = useState("alla");
  const [listMode, setListMode] = useState(false);
  const [skapareByArendeId, setSkapareByArendeId] = useState({});
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
        const data = {
          ...arende,
          ...initialApprovalState(arende.arendeTyp),
          deleted_at: null,
        }
        await updateArende(arende.id, data)
        const arenden = await getArenden();
        setArenden(arenden);
        laggTillTrace("återställde ärendet", arende)
      }else {
        const data = {
          ...arende,
          status: "raderad",
          deleted_at: new Date().toISOString(),
          godkannanden: [],
          ansokan: [],
        }
        await updateArende(arende.id, data)
        const arenden = await getArenden();
        setArenden(arenden);
        laggTillTrace("raderade ärendet", arende)}
    } else {
    }
  }

  const result = arenden.filter((arende) => {
    const matchName = search.avlidenNamn
      ? (arende.avlidenNamn ?? "").toLowerCase().includes(search.avlidenNamn.toLowerCase())
      : true;
    const matchEmail = search.email
      ? (arende.email ?? "").toLowerCase().includes(search.email.toLowerCase())
      : true;
    const matchTel = search.tel ? (arende.tel ?? "").includes(search.tel) : true;
    const matchKyrkogard = search.kyrkogard
      ? (arende.kyrkogard ?? "").toLowerCase().includes(search.kyrkogard.toLowerCase())
      : true;
    const matchBestallare = search.bestallare
      ? (arende.bestallare ?? "").toLowerCase().includes(search.bestallare.toLowerCase())
      : true;
    const matchSkapare = search.skapareToSearch
      ? (skapareByArendeId[arende.id] ?? "").toLowerCase().includes(search.skapareToSearch.toLowerCase())
      : true;
    const matchMinaArenden = arendeVisibilityFilter === "mina"
      ? (arende.assignedTo ?? "").toLowerCase() === loggedInUserName.toLowerCase()
      : true;
    const matchEjFakturerade = search.onlyEjFakturerade
      ? arende.fakturerad !== 1
      : true;
    const matchEjSignerade = search.onlyEjSignerade
      ? arende.signerad !== 1
      : true;
    const matchAvancerad = !search.avanceradSokning || Object.entries(search.avanceradSokningValues).every(([key, value]) =>
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
          {skapaArende ? (
          <div className = "new-stone-form-arenden">
          <NewArendeForm arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} setSkapaArende = {setSkapaArende} skapaArende = {skapaArende}/>
          </div>
          ) : (<>
          <ArendeTabSearchMenu
            search={search}
            setSearch={setSearch}
            skapaArende={skapaArende}
            setSkapaArende={setSkapaArende}
            setFilter={setFilter}
          />
          <div className = "arende-results-column">
          <ArendeCardFilterPanel typeToSearch = {search.typeToSearch} ursprungToSearch = {search.ursprungToSearch} resultSorted = {resultSorted} setFilter = {setFilter} findTicketAmount = {findTicketAmount} setSorting = {setSorting} sorting = {sorting} arendeVisibilityFilter = {arendeVisibilityFilter} setArendeVisibilityFilter = {setArendeVisibilityFilter} includeLegacy = {search.includeLegacy} listMode = {listMode} setListMode = {setListMode}/>
          <div className = "scrollable-box">
          {listMode && <ArendeListHeader />}
          {resultSorted.filter(k => filter.length === 0 && k.status !== "raderad" && search.typeToSearch === "" && search.ursprungToSearch === ""
          || (k.status !== "raderad" || filter.some(f => f === "raderad")) && matchesTypeSearch(k.arendeTyp, search.typeToSearch) && (search.ursprungToSearch === k.ursprung || search.ursprungToSearch === "") && (filter.some(f => f.toLowerCase() === k.status.toLowerCase()) || filter.length === 0)).filter(k => k.status !== "LEGACY" || search.includeLegacy).filter(k => !search.onlyEjFakturerade || k.fakturerad !== 1).filter(k => !search.onlyEjSignerade || k.signerad !== 1).slice(0,arendeSliceLimit).map((arende) => (
            listMode ? (
              <ArendeListRow
                key={arende.id}
                arende={arende}
                setActiveArende={setActiveArende}
              />
            ) : (
              <ArendeCard
                key={arende.id}
                arende={arende}
                showMore={showMore}
                setShowMore={setShowMore}
                setActiveArende={setActiveArende}
                kyrkogardar={kyrkogardar}
                setArenden={setArenden}
                onRecordAnsokan={(till, arende) => recordAnsokan(till, arende, setArenden)}
                handleDeleteButton={handleDeleteButton}
              />
            )
          ))}
          <button className = "load-more-button" onClick = {() => setArendeSliceLimit(arendeSliceLimit+50)}>↓ Ladda fler ärenden ↓</button>
          </div>  
          </div>
          </>)}
          </div>
        </>
      )}
      {activeArende !== null && <ArendeDetailViewMain activeArende = {activeArende} setActiveArende = {setActiveArende} setActiveTab = {setActiveTab} setArenden = {setArenden} kyrkogardar = {kyrkogardar} setKyrkogardToOpen = {setKyrkogardToOpen}/>}
    </div>
  );
}

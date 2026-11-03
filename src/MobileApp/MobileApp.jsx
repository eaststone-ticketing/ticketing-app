import {getArenden} from '../api.js'
import {useEffect, useState} from 'react'
import MobileDetailView from './MobileDetailView.jsx'
import { IoPersonOutline } from "react-icons/io5";
import './MobileApp.css'
import { ticketColorStyle, typeColor } from '../Helpers/ticketColors.js'
import { logout } from '../Helpers/auth.js'
import matchesTypeSearch from '../Helpers/matchesTypeSearch.js'
import getTypes from '../Helpers/getTypes.js'

const ARENDE_TYP_OPTIONS = [
  "Ny sten",
  "Nyinskription",
  "Stabilisering",
  "Rengöring",
  "Inspektion",
  "Ommålning",
  "Omslipning",
  "Övrigt",
  "Högalid",
  "Lilla Dalen",
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Alla statusar" },
  { value: "Nytt", label: "Nya" },
  { value: "Godkänd av kund", label: "Godkänt av kund" },
  { value: "Godkänd av kyrkogård", label: "Godkänt av kyrkogård" },
  { value: "Redo", label: "Redo" },
  { value: "Väntande", label: "Väntande" },
  { value: "Stängt", label: "Stängt" },
];

function matchesStatusFilter(status, statusToSearch) {
  if (!statusToSearch) return true;
  if (statusToSearch === "Nytt") {
    return status === "Nytt"
      || status === "Väntar svar av kund"
      || status === "Väntar svar av kyrkogård"
      || status === "Väntar svar av kund och kyrkogård";
  }
  if (statusToSearch === "Godkänd av kund") {
    return status?.includes("Godkänd av kund");
  }
  if (statusToSearch === "Godkänd av kyrkogård") {
    return status?.includes("Godkänd av kyrkogård");
  }
  if (statusToSearch === "Väntande") {
    return status?.toLowerCase().includes("vänt");
  }
  return status === statusToSearch;
}

export default function MobileApp(user){

function sortResults(result, mode) {

    if (mode === "default"){
        return result.sort((a,b) => b.id - a.id);   
    }
    else if (mode === "Nyaste"){
      return result.sort((a,b) => b.id - a.id);
    }
    else if (mode === "Äldsta"){
      return result.sort((a,b) => a.id - b.id);
    }
    else {
        return result.sort((a,b) => b.id - a.id);  
    }
  }

    

    const [activeArende, setActiveArende] = useState(null);
    const [searchedArende, setSearchedArende] = useState("");
    const [kyrkogard, setKyrkogard] = useState("");
    const [typeToSearch, setTypeToSearch] = useState("");
    const [statusToSearch, setStatusToSearch] = useState("");
    const [arenden, setArenden] = useState([])
    const [arendeLimit, setArendeLimit] = useState(50)
    const [mode, setMode] = useState("default")

    const arendenSorted = sortResults(arenden, mode)
    const userName = user?.user?.name
      ?? (() => {
        try {
          return JSON.parse(localStorage.getItem('user'))?.userName;
        } catch {
          return null;
        }
      })()
      ?? "";
    const displayName = userName
      ? userName.charAt(0).toUpperCase() + userName.slice(1)
      : "";

    useEffect(() => {
      async function loadArenden() {
        const data = await getArenden(); 
        setArenden(data); 
      }
      loadArenden(); 
      }, []);

    return <div className = "mobile-app">
    <div className = "mobile-top-bar">
        <button type = "button" className = "mobile-logout-button" onClick = {() => logout()}>Logga ut</button>
        <div className = "mobile-user-badge">
          <IoPersonOutline className = "mobile-user-icon" aria-hidden = "true" />
          <span>{displayName}</span>
        </div>
    </div>

    {activeArende && <div className = "mobile-detail-container">
        <MobileDetailView arende = {activeArende} setActiveArende = {setActiveArende} setArenden = {setArenden} />
    </div>}
    
    {!activeArende && <div className = "mobile-list-view">
        <div className = "filter-panel">
        <div className = "mobile-search-field">
            <label htmlFor = "mobile-avliden-search">Namn på avliden</label>
            <input
              id = "mobile-avliden-search"
              value = {searchedArende}
              onChange = {(e) => setSearchedArende(e.target.value)}
            />
        </div>
        <div className = "mobile-search-field">
            <label htmlFor = "mobile-kyrkogard-search">Kyrkogård</label>
            <input
              id = "mobile-kyrkogard-search"
              value = {kyrkogard}
              onChange = {(e) => setKyrkogard(e.target.value)}
            />
        </div>
        <div className = "mobile-search-row">
          <div className = "mobile-search-field">
              <label htmlFor = "mobile-type-search">Ärendetyp</label>
              <select
                id = "mobile-type-search"
                value = {typeToSearch}
                onChange = {(e) => setTypeToSearch(e.target.value)}
              >
                <option value = "">Välj typ av ärende</option>
                {ARENDE_TYP_OPTIONS.map(type => (
                  <option key = {type} value = {type}>{type}</option>
                ))}
              </select>
          </div>
          <div className = "mobile-search-field">
              <label htmlFor = "mobile-status-search">Status</label>
              <select
                id = "mobile-status-search"
                value = {statusToSearch}
                onChange = {(e) => setStatusToSearch(e.target.value)}
              >
                {STATUS_FILTER_OPTIONS.map(option => (
                  <option key = {option.value || "all"} value = {option.value}>{option.label}</option>
                ))}
              </select>
          </div>
        </div>

        <div className = "filter-buttons">
            <button onClick = {() => setMode("Nyaste")}>Nyast</button>
            <button onClick = {() => setMode("Äldsta")}>Äldst</button>
        </div>
        </div>

        <div className = "mobile-results-scroll">
        {arendenSorted.filter((arende) => {
          const matchName = (arende.avlidenNamn ?? "").toLowerCase().includes(searchedArende.toLowerCase());
          const matchKyrkogard = kyrkogard
            ? (arende.kyrkogard ?? "").toLowerCase().includes(kyrkogard.toLowerCase())
            : true;
          const matchType = matchesTypeSearch(arende.arendeTyp, typeToSearch);
          const matchStatus = matchesStatusFilter(arende.status, statusToSearch);
          return matchName && matchKyrkogard && matchType && matchStatus && arende.status !== "LEGACY" && arende.status !== "raderad";
        }).slice(0,arendeLimit).map((arende) =>
            <div key={arende.id} className= "arende-card-ny-mobile"
              style={ticketColorStyle(arende.status, arende.arendeTyp)}
              onClick={() => setActiveArende(arende)}>
              <div>
              <h3 className = "truncate">{arende.avlidenNamn}: {arende.status}</h3>
              <div className = "arende-typ-tags">
                {getTypes(arende.arendeTyp).map(type => (
                  <p
                    className = "arende-typ-tag"
                    key = {type}
                    style = {{ backgroundColor: typeColor[type]?.[0] || "transparent" }}
                  >
                    {type}
                  </p>
                ))}
              </div>
              </div>
            </div>
        )}
        <button onClick = {() => setArendeLimit(arendeLimit+50)}>Ladda fler</button>
        </div>
        </div>}
        </div>
}
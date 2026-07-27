import { useState, useEffect } from 'react'
import { GoDotFill } from "react-icons/go";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { getKommentarer, updateKommentar, getTraces, downloadBackup } from '../api.js'
import { Stenpedia } from './Stenpedia/Stenpedia.jsx'
import EventLogTimeline from './EventLogTimeline.jsx'
import Tidslinje from './Tidslinje.jsx'
import SaknadInformation from './SaknadInformation.jsx'
import linkToArende from '../Helpers/linkToArende.js'
import { logout } from '../Helpers/auth.js'
import './OversiktTab.css'

function Greeting({ userName }) {
  const hour = new Date().getHours();
  const namn = userName.charAt(0).toUpperCase() + userName.slice(1);

  if (hour > 4 && hour < 10) return <h3>God morgon, {namn}!</h3>
  if (hour >= 10 && hour < 12) return <h3>God förmiddag, {namn}!</h3>
  if (hour >= 12 && hour < 18) return <h3>God eftermiddag, {namn}!</h3>
  if (hour >= 18 && hour <= 22) return <h3>God kväll, {namn}!</h3>
  return <h3>Det är mitt i natten, {namn}!</h3>
}

export default function OversiktTab({ setActiveTab, setActiveArende, arenden }) {

  const user = JSON.parse(localStorage.getItem('user'))
  const [oversiktViewState, setOversiktViewState] = useState("oversikt");
  const [kommentarer, setKommentarer] = useState(null);
  const [traces, setTraces] = useState([]);
  const [traceAmount, setTraceAmount] = useState(50);
  const [showDetail, setShowDetail] = useState(null);
  const [activeNotificationTab, setActiveNotificationTab] = useState("dina");

  useEffect(() => {
    const fetchKommentarer = async () => {
      const allKommentarer = await getKommentarer();
      const filtered = allKommentarer.filter(
        k => k.tagged_users.includes(user.userName)
      )
      setKommentarer(filtered.sort((a, b) => b.id - a.id));
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

  async function seKommentar(kommentar) {
    if (kommentar.seen === 2) return
    const newKommentar = { ...kommentar, seen: Number(1) }
    try {
      await updateKommentar(kommentar.id, newKommentar)
    } catch (err) {
      console.log(err)
    }
    setKommentarer(prev => prev.map(k => k.id === kommentar.id ? newKommentar : k))
  }

  async function arkiveraKommentar(kommentar) {
    const number = kommentar.seen === 2 ? Number(1) : Number(2)
    const newKommentar = { ...kommentar, seen: number }
    try {
      await updateKommentar(kommentar.id, newKommentar)
    } catch (err) {
      console.log(err)
    }
    setKommentarer(prev => prev.map(k => k.id === kommentar.id ? newKommentar : k))
  }

  const menuItems = [
    ["oversikt", "Översikt"],
    ["tidslinje", "Tidslinje"],
    ["data", "Data"],
    ["saknad", "Saknad information"],
    ["stenpedia", "Stenpedia"]
  ];

  return <div className="oversikt-view">
    <div className="oversikt-menu">
      <div className="oversikt-greeting">
        <Greeting userName={user.userName} />
      </div>
      {menuItems.map(([key, label]) => (
        <button
          key={key}
          className={`oversikt-menu-button ${oversiktViewState === key ? "active" : ""}`}
          onClick={() => setOversiktViewState(key)}
        >
          {label}
        </button>
      ))}
      {user?.userName?.toLowerCase() === "felix" && <button
        className="oversikt-backup-button"
        onClick={async () => {
          try {
            await downloadBackup();
          } catch (err) {
            window.alert("Kunde inte ladda ner backup. Se konsolen för detaljer.");
          }
        }}
      >
        Ladda ner backup
      </button>}
      <button
        className="oversikt-logout-button"
        onClick={() => logout()}
      >
        Logga ut
      </button>
    </div>

    <div className="oversikt-content">
      {oversiktViewState === "oversikt" && <div className="oversikt-columns">
        <div className="handelselogg-container">
          <h3>Händelselogg</h3>
          {traces.length > 0 ? <div className="handelselogg">
            {traces.sort((a, b) => b.id - a.id).slice(0, traceAmount).map((trace) => {
              const arende = arenden.find((arende) => arende.id === trace.arendeID);
              return <div key={trace.id}>
                <strong onClick={() => linkToArende(setActiveTab, setActiveArende, arende)} className="trace-arende">
                  #{trace.arendeID ?? ""} {arende?.avlidenNamn}
                </strong>: {trace.body}
              </div>
            })}
            <button onClick={() => setTraceAmount(traceAmount + 50)}>Ladda fler</button>
          </div> : <p>Inga händelser kunde hittas</p>}
        </div>

        <div className="feed-container">
          <div className="notification-feed-tabs">
            <button className={`notification-tab ${activeNotificationTab === "dina" ? "active" : ""}`} onClick={() => setActiveNotificationTab("dina")}>Dina notifikationer</button>
            <button className={`notification-tab ${activeNotificationTab === "arkiverade" ? "active" : ""}`} onClick={() => setActiveNotificationTab("arkiverade")}>Arkiverade notifikationer</button>
          </div>
          <div className="notification-feed-scroll">
            {(kommentarer ?? []).filter(k => arenden.find(a => k.arendeID === a.id) &&
              (k.seen !== 2 && activeNotificationTab === "dina") ||
              (k.seen === 2 && activeNotificationTab === "arkiverade")).map(k => <div className="feed-card" key={k.id}>
                <div className={`feed-item-container ${k.seen === 0 ? "new" : ""}`} onClick={async () => { setShowDetail(showDetail === k.id ? null : k.id); await seKommentar(k) }}>
                  <div className="feed-item-preview">
                    <p className="ny-notifikation">{k.seen === 0 ? <div className="dot-wrapper"><GoDotFill className="new-notification-dot" /></div> : ""}</p>
                    <p>Du har taggats i ärende </p>
                    <p className="feed-card-arende-id" onClick={(e) => { e.stopPropagation(); setActiveTab('Ärenden'); setActiveArende(arenden.find(a => k.arendeID === a.id)) }}>
                      <strong>#{k.arendeID} {arenden.find((a) => k.arendeID === a.id).avlidenNamn}</strong>
                    </p>
                    {showDetail !== k.id && <IoMdArrowDropright className="icon-feed"></IoMdArrowDropright>}
                    {showDetail === k.id && <IoMdArrowDropdown className="icon-feed"></IoMdArrowDropdown>}
                    <p className="arkivera-kommentar" onClick={(e) => { e.stopPropagation(); arkiveraKommentar(k) }}>{k.seen === 2 ? "Ta ur arkiv" : "Arkivera"}</p>
                  </div>
                  {showDetail === k.id && <pre className="pre">{k.innehall}</pre>}
                </div>
              </div>)}
          </div>
        </div>
      </div>}

      {oversiktViewState === "tidslinje" && <Tidslinje arenden={arenden} />}
      {oversiktViewState === "data" && <EventLogTimeline />}
      {oversiktViewState === "saknad" && <SaknadInformation arenden={arenden} setActiveTab={setActiveTab} setActiveArende={setActiveArende} />}
      {oversiktViewState === "stenpedia" && <Stenpedia setOversiktViewState={(v) => setOversiktViewState(v ?? "oversikt")} />}
    </div>
  </div>
}

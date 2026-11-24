import { useState, useEffect } from 'react'
import { LuCog } from 'react-icons/lu'
import { getKyrkogardar, getArenden, getKunder } from "./api.js";
import './App.css'
import ArendeTab from './ArendeTab/ArendeTab.jsx'
import EmailTab from './EmailTab.jsx'
import LeveransTab from './LeveransTab/LeveransTab.jsx'
import KyrkogardTab from './KyrkogardTab/KyrkogardTab.jsx'
import OversiktTab from './OversiktTab/OversiktTab.jsx'
import StenarTab from './StenarTab/StenarTab.jsx'
import SettingsOverlay from './settings/SettingsOverlay.jsx'
import { PriceConfigProvider } from './Helpers/PriceConfigContext.jsx'
import { useSeasonalTopBarTheme } from './Helpers/useSeasonalTopBarTheme.js'

function App() {

  const isAdmin = (JSON.parse(localStorage.getItem('user')) === "admin" ? true:false)

  const [activeTab, setActiveTab] = useState(isAdmin ? 'AdminView' : 'Översikt')
  const tabs = ['Översikt', 'Ärenden', 'Stenar', 'Leveranser', 'Kyrkogårdar']
  const [arenden, setArenden] = useState([])
  const [kyrkogardar, setKyrkogardar] = useState([])
  const [kunder, setKunder] = useState([])
  const [activeArende, setActiveArende] = useState(null)
  const [kyrkogardToOpen, setKyrkogardToOpen] = useState(null)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const {
    availableThemes,
    enabledById,
    toggleTheme,
    prideForcedOutOfSeason,
    setPrideThemeOutOfSeason,
  } = useSeasonalTopBarTheme()

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
    const nextTheme = darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  }, [darkMode]);


  return (
    <PriceConfigProvider>
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
          <div className="tab-bar-settings">
            <button
              type="button"
              className="theme-toggle theme-toggle-icon settings-cog-button"
              aria-label="Öppna inställningar"
              title="Inställningar"
              onClick={() => setSettingsOpen(true)}
            >
              <LuCog />
            </button>
          </div>
        </div>
        <div className="tab-content">
          {activeTab === 'Email' && <EmailTab arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} />}
          {activeTab === 'Ärenden' && <ArendeTab arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder} activeArende = {activeArende} setActiveArende = {setActiveArende} setActiveTab = {setActiveTab} setKyrkogardToOpen = {setKyrkogardToOpen}/>}
          {activeTab === 'Leveranser' && <LeveransTab setActiveArende = {setActiveArende} setActiveTab = {setActiveTab}/>}
          {activeTab === 'Stenar' && <StenarTab arenden={arenden} setArenden={setArenden} setActiveTab={setActiveTab} setActiveArende={setActiveArende} />}
          {activeTab === 'Kyrkogårdar' && <KyrkogardTab kyrkogardar = {kyrkogardar} setKyrkogardar = {setKyrkogardar} arenden = {arenden} setActiveTab = {setActiveTab} setActiveArende = {setActiveArende} kyrkogardToOpen = {kyrkogardToOpen} setKyrkogardToOpen = {setKyrkogardToOpen}/>}
          {activeTab === 'Översikt' && <OversiktTab setActiveTab = {setActiveTab} setActiveArende = {setActiveArende} arenden = {arenden}/>}
        </div>
      </div>
      {settingsOpen && (
        <SettingsOverlay
          onClose={() => setSettingsOpen(false)}
          prideForcedOutOfSeason={prideForcedOutOfSeason}
          setPrideThemeOutOfSeason={setPrideThemeOutOfSeason}
        />
      )}
    </PriceConfigProvider>
  )
}

export default App

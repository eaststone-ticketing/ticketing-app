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

const skapareOptions = ["Ali", "Felix", "Ian", "Ieva", "Lotten", "Martin"];

export default function ArendeTabSearchMenu({
  search,
  setSearch,
  skapaArende,
  setSkapaArende,
  setFilter,
}) {
  function updateSearch(patch) {
    setSearch((prev) => ({ ...prev, ...patch }));
  }

  function toggleSearch(key) {
    setSearch((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className = "arende-search-column">
      <div className = "arende-card-filter-panel">
        <button onClick = {() => setSkapaArende(!skapaArende)} className = "arende-card-filter-panel-create-button create-button">+ Skapa nytt ärende</button>
      </div>
      <form className="searchbar-arende">
        <div className = "header-and-dropdown">
        <h3>Sök ärende</h3>
        <select value={search.typeToSearch} onChange = {(e) => updateSearch({ typeToSearch: e.target.value })}>
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
        <select value={search.ursprungToSearch} onChange = {(e) => updateSearch({ ursprungToSearch: e.target.value })}>
          <option value = "">Välj ursprung</option>
          <option>Eaststone</option>
          <option>Stockholms Gravstenar</option>
        </select>

        </div>
        <div className = "sok-arende-filter-toggles">
          <button
            type = "button"
            className = {search.onlyEjFakturerade ? "sok-arende-filter-toggle active" : "sok-arende-filter-toggle"}
            onClick = {() => toggleSearch("onlyEjFakturerade")}
          >
            Ej fakturerade
          </button>
          <button
            type = "button"
            className = {search.onlyEjSignerade ? "sok-arende-filter-toggle active" : "sok-arende-filter-toggle"}
            onClick = {() => toggleSearch("onlyEjSignerade")}
          >
            Ej signerade
          </button>
        </div>
        <div className = "input-field-searchbar-arende">
          <label>Namn på avliden</label>
          <input
            type="text"
            name="avlidenNamn"
            value={search.avlidenNamn}
            onChange={(e) => updateSearch({ avlidenNamn: e.target.value })}
          />
        </div>
                    <div className = "input-field-searchbar-arende">
          <label>Beställare</label>
          <input
          type = "text"
          name = "bestallare"
          value = {search.bestallare}
          onChange = {(e) => updateSearch({ bestallare: e.target.value })}
          />
        </div>
        <div className = "input-field-searchbar-arende">
          <label>Email</label>
          <input
            type="text"
            name="email"
            value={search.email}
            onChange={(e) => updateSearch({ email: e.target.value })}
          />
        </div>
        <div className = "input-field-searchbar-arende">
          <label>Telefonnummer</label>
          <input
            type="text"
            name="tel"
            value={search.tel}
            onChange={(e) => updateSearch({ tel: e.target.value })}
          />
        </div>
        <div className = "input-field-searchbar-arende">
          <label>Kyrkogård</label>
          <input
            type="text"
            name="kyrkogard"
            value={search.kyrkogard}
            onChange={(e) => updateSearch({ kyrkogard: e.target.value })}
          />
        </div>
        <div className = "input-field-searchbar-arende skapare-field">
          <select
            className = "skapare-dropdown"
            name = "skapare"
            value = {search.skapareToSearch}
            onChange = {(e) => updateSearch({ skapareToSearch: e.target.value })}
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
          onClick = {() => toggleSearch("avanceradSokning")}
        >
          {search.avanceradSokning ? "Dölj avancerad sökning" : "Avancerad sökning"}
        </button>
        {search.avanceradSokning && <div className = "avancerad-sokning-grid">
          {AVANCERAD_SOKNING_FIELDS.map(([label, key]) => (
            <div key = {key} className = "avancerad-sokning-entry">
              <label>{label}</label>
              <input
                type = "text"
                value = {search.avanceradSokningValues[key] ?? ""}
                onChange = {(e) => setSearch((prev) => ({
                  ...prev,
                  avanceradSokningValues: {
                    ...prev.avanceradSokningValues,
                    [key]: e.target.value,
                  },
                }))}
              />
            </div>
          ))}
        </div>}
      </form>
      <div><button onClick = {() => setFilter(["raderad"])}>Visa raderade ärenden</button> <button onClick = {() => toggleSearch("includeLegacy")}>{!search.includeLegacy ? "Inkludera LEGACY" : "Ignorera LEGACY"}</button></div>
    </div>
  );
}

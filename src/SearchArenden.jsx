

export default function SearchArenden({ arenden }) {
  const [avlidenNamn, setAvlidenNamn] = useState("");
  const [ID, setID] = useState("");
  const [filtered, setFiltered] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Trim inputs to ignore accidental spaces
    const name = avlidenNamn?.trim().toLowerCase();
    const id = ID;

    // If both are empty, don't show anything
    if (!name && !id) {
      setFiltered([]);
      return;
    }

    const result = arenden.filter((arende) => {
      const matchName = name
        ? arende.avlidenNamn.toLowerCase().includes(name)
        : true;
      const matchId = id ? String(arende.id) === id : true;
      return matchName && matchId;
    });

    setFiltered(result);
  };

  return (
    <div className="search-arenden-menu">
      <div className = "search-inputs">
      <h3>Sök ärende</h3>
      <form onSubmit={handleSubmit}>
        <label>Avlidens namn</label>
        <input
          type="text"
          value={avlidenNamn}
          onChange={(e) => setAvlidenNamn(e.target.value)}
        />
        <label>Ärendenummer</label>
        <input
          type="text"
          value={ID}
          onChange={(e) => setID(e.target.value)}
        />
        <button type="submit" className = "search-button">Sök</button>
      </form>
      </div>
      <div className="arenden-list">
        {filtered.length === 0 ? (
          <div></div>
        ) : (
          filtered.map((arende) => (
            <div key={arende.id} className = "arende-search-result">
              <p>{arende.id}: {arende.avlidenNamn}</p>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
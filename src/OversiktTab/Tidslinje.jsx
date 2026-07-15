import { useEffect, useState } from 'react'
import { getTraces } from '../api.js'
import interpretPrice from '../Helpers/interpretPrice.js'
import './OversiktTab.css'

const MONTH_NAMES = ["Januari", "Februari", "Mars", "April", "Maj", "Juni",
  "Juli", "Augusti", "September", "Oktober", "November", "December"]

const URSPRUNG_OPTIONS = ["Eaststone", "Stockholms Gravstenar"]

function parseTraceDate(str) {
  if (!str) return null;
  const cleaned = str.replace(",", "").replace(" ", "T");
  const [datePart, timePart] = cleaned.split("T");
  if (!datePart || !timePart) return null;
  let [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return null;
  let [hours, minutes] = timePart.split(":");
  if (!hours || !minutes) return null;
  const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/* Trace bodies look like "2025-3-5, 14:23, Felix ändrade status till Stängt" —
   the username is the last comma-separated part before the message. */
function parseUserFromTraceBody(body, message) {
  if (typeof body !== "string" || !body.includes(message)) return null;
  const beforeMessage = body.split(message)[0];
  const parts = beforeMessage.split(",").map(p => p.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function startOfPeriod(date, period) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (period === "week") {
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  } else if (period === "month") {
    d.setDate(1);
  } else if (period === "year") {
    d.setMonth(0, 1);
  }
  return d;
}

function previousPeriodStart(start, period) {
  const d = new Date(start);
  if (period === "day") d.setDate(d.getDate() - 1);
  if (period === "week") d.setDate(d.getDate() - 7);
  if (period === "month") d.setMonth(d.getMonth() - 1);
  if (period === "year") d.setFullYear(d.getFullYear() - 1);
  return d;
}

function periodLabel(start, period) {
  if (period === "day") {
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  }
  if (period === "week") {
    return `Vecka ${isoWeek(start)}, ${start.getFullYear()}`;
  }
  if (period === "month") {
    return `${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`;
  }
  return String(start.getFullYear());
}

export default function Tidslinje({ arenden }) {

  const [traces, setTraces] = useState([]);
  const [amount, setAmount] = useState("10");
  const [period, setPeriod] = useState("week");
  const [metric, setMetric] = useState("registered");
  const [userFilter, setUserFilter] = useState("");
  const [ursprungFilter, setUrsprungFilter] = useState("");

  useEffect(() => {
    async function loadTraces() {
      const data = await getTraces();
      setTraces(data);
    }
    loadTraces();
  }, []);

  // Creator per ärende, derived from the "har skapat ärendet" traces
  const creatorByArendeId = {};
  traces.forEach((trace) => {
    if (!trace?.arendeID || typeof trace?.body !== "string") return;
    if (!trace.body.includes(" har skapat ärendet")) return;
    const creator = parseUserFromTraceBody(trace.body, " har skapat ärendet");
    if (creator && !creatorByArendeId[trace.arendeID]) {
      creatorByArendeId[trace.arendeID] = creator;
    }
  });

  const arendeById = new Map(arenden.map((a) => [a.id, a]));

  // Each event: { date, user, ursprung, value } — value is 1 for counts,
  // the parsed price for sales volume.
  let events = [];
  if (metric === "registered" || metric === "volym") {
    events = arenden
      .filter((a) => a.status !== "raderad" && (metric === "registered" || a.status !== "LEGACY"))
      .map((a) => ({
        date: a.datum ? new Date(a.datum) : null,
        user: creatorByArendeId[a.id] ?? null,
        ursprung: a.ursprung ?? null,
        value: metric === "volym" ? interpretPrice(a.pris) : 1
      }));
  } else {
    events = traces
      .filter((t) => typeof t.body === "string" && t.body.includes("ändrade status till Stängt"))
      .map((t) => ({
        date: parseTraceDate(t.time),
        user: parseUserFromTraceBody(t.body, " ändrade status till Stängt"),
        ursprung: arendeById.get(t.arendeID)?.ursprung ?? null,
        value: 1
      }));
  }

  events = events.filter((e) =>
    e.date && !Number.isNaN(e.date.getTime()) &&
    e.value !== undefined && e.value !== null &&
    (!userFilter || (e.user ?? "").toLowerCase() === userFilter.toLowerCase()) &&
    (!ursprungFilter || e.ursprung === ursprungFilter)
  );

  // Users available in the data for the current metric (before user filtering)
  const userOptions = [...new Set(
    (metric === "completed"
      ? traces
          .filter((t) => typeof t.body === "string" && t.body.includes("ändrade status till Stängt"))
          .map((t) => parseUserFromTraceBody(t.body, " ändrade status till Stängt"))
      : Object.values(creatorByArendeId)
    ).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  // Build the list of period buckets, newest first
  let bucketCount;
  if (amount === "all") {
    const eventDates = events.map((e) => e.date);
    const earliest = eventDates.length
      ? eventDates.reduce((min, d) => (d < min ? d : min), eventDates[0])
      : new Date();
    let count = 1;
    let cursor = startOfPeriod(new Date(), period);
    const earliestStart = startOfPeriod(earliest, period);
    while (cursor > earliestStart && count < 500) {
      cursor = previousPeriodStart(cursor, period);
      count++;
    }
    bucketCount = count;
  } else {
    bucketCount = Number(amount);
  }

  const buckets = [];
  let start = startOfPeriod(new Date(), period);
  for (let i = 0; i < bucketCount; i++) {
    buckets.push(start);
    start = previousPeriodStart(start, period);
  }

  const rows = buckets.map((bucketStart, i) => {
    const bucketEnd = i === 0 ? new Date(8640000000000000) : buckets[i - 1];
    const total = events
      .filter((e) => e.date >= bucketStart && e.date < bucketEnd)
      .reduce((sum, e) => sum + e.value, 0);
    return { label: periodLabel(bucketStart, period), total };
  });

  const maxTotal = Math.max(1, ...rows.map((r) => r.total));

  function formatTotal(total) {
    if (metric === "volym") {
      return `${total.toLocaleString("sv-SE")} kr`;
    }
    return total;
  }

  return (
    <div className="tidslinje-view">
      <h3>Tidslinje</h3>
      <div className="tidslinje-controls">
        <label>
          Antal perioder
          <select value={amount} onChange={(e) => setAmount(e.target.value)}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="100">100</option>
            <option value="all">Alla</option>
          </select>
        </label>
        <label>
          Periodlängd
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="day">Dag</option>
            <option value="week">Vecka</option>
            <option value="month">Månad</option>
            <option value="year">År</option>
          </select>
        </label>
        <label>
          Mätvärde
          <select value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="registered">Registrerade ärenden</option>
            <option value="completed">Utförda ärenden</option>
            <option value="volym">Försäljningsvolym</option>
          </select>
        </label>
        <label>
          Användare
          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
            <option value="">Alla användare</option>
            {userOptions.map((user) => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </label>
        <label>
          Källa
          <select value={ursprungFilter} onChange={(e) => setUrsprungFilter(e.target.value)}>
            <option value="">Alla källor</option>
            {URSPRUNG_OPTIONS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>
      </div>
      {metric === "volym" && <p className="tidslinje-note">Försäljningsvolym summerar tolkningsbara priser per registreringsdatum (LEGACY-ärenden exkluderas).</p>}
      <div className="tidslinje-list">
        {rows.map((row) => (
          <div className="tidslinje-row" key={row.label}>
            <span className="tidslinje-label">{row.label}:</span>
            <span className="tidslinje-count">{formatTotal(row.total)}</span>
            <div className="tidslinje-bar-track">
              <div className="tidslinje-bar" style={{ width: `${(row.total / maxTotal) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { getKommentarer, addKommentarer, updateArende } from '../api.js'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import MobileBildView from './MobileBildView.jsx'
import { typeColor } from '../Helpers/ticketColors.js'
import getTypes from '../Helpers/getTypes.js'
import addFinishComment from '../ArendeTab/addFinishComment.js'
import laggTillTrace from '../laggTillTrace.jsx'

function findTaggedUsers(comment) {
  const regex = /@([^\s@]+)/g;
  const tags = [];
  let match;
  while ((match = regex.exec(comment)) !== null) {
    tags.push(match[1]);
  }
  return tags;
}

function appendNameAndDate(innehall) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  const time = new Date();
  const timestamp = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}, ${time.getHours()}:${time.getMinutes() > 9 ? time.getMinutes() : `0${time.getMinutes()}`}`;
  if (user?.userName) {
    const name = user.userName.charAt(0).toUpperCase() + user.userName.slice(1);
    return innehall + `\n\n${name}\n${timestamp}`;
  }
  return innehall + `\n\n${timestamp}`;
}

const NON_COMBINABLE_TYPES = ["Ny sten", "Lilla Dalen", "Högalid"];
const COMBINABLE_TYPES = [
  "Nyinskription",
  "Stabilisering",
  "Rengöring",
  "Inspektion",
  "Ommålning",
  "Övrigt",
];
const DEPENDENT_TYPES = {
  Omslipning: "Nyinskription",
};

const EMPTY_JOBB_FORM = {
  utforare: "",
  problem: "",
  anteckningar: "",
};

export default function MobileDetailView({ arende, setActiveArende, setArenden }) {
  const [kommentarer, setKommentarer] = useState([])
  const [currentKommentar, setCurrentKommentar] = useState("")
  const [submittingKommentar, setSubmittingKommentar] = useState(false)
  const [view, setView] = useState('oversikt')
  const [jobbFormType, setJobbFormType] = useState(null)
  const [jobbForm, setJobbForm] = useState(EMPTY_JOBB_FORM)

  const currentTypes = getTypes(arende.arendeTyp)
  const canCombine = !currentTypes.some(type => NON_COMBINABLE_TYPES.includes(type))
  const availableTypes = [
    ...COMBINABLE_TYPES.filter(type => !currentTypes.includes(type)),
    ...Object.entries(DEPENDENT_TYPES)
      .filter(([type, requiredType]) =>
        currentTypes.includes(requiredType) && !currentTypes.includes(type)
      )
      .map(([type]) => type),
  ]

  useEffect(() => {
    async function loadKommentarer() {
      const data = await getKommentarer()
      setKommentarer(data)
    }
    loadKommentarer()
  }, [])

  const relevantKommentarer = kommentarer
    .filter((kommentar) => kommentar.arendeID === arende.id)
    .sort((a, b) => b.id - a.id)

  async function addNewKommentar(e) {
    e.preventDefault()
    const innehall = currentKommentar.trim()
    if (!innehall || submittingKommentar) return

    setSubmittingKommentar(true)
    try {
      const kommentar = {
        arendeID: Number(arende.id),
        innehall: appendNameAndDate(innehall),
        tagged_users: JSON.stringify(findTaggedUsers(innehall)),
        seen: 0,
      }
      const savedKommentar = await addKommentarer(kommentar)
      setKommentarer(prev => [...prev, savedKommentar?.id ? savedKommentar : kommentar])
      setCurrentKommentar("")
    } catch (err) {
      console.error("Kunde inte spara kommentar:", err)
      window.alert("Kunde inte spara kommentaren.")
    } finally {
      setSubmittingKommentar(false)
    }
  }

  function applyArendeUpdate(updatedArende) {
    setActiveArende(updatedArende)
    setArenden(prev => prev.map(a => a.id === updatedArende.id ? updatedArende : a))
  }

  async function handleAddType(typeToAdd) {
    if (!typeToAdd || currentTypes.includes(typeToAdd)) return
    const requiredType = DEPENDENT_TYPES[typeToAdd]
    if (requiredType && !currentTypes.includes(requiredType)) return
    const updatedArende = {
      ...arende,
      arendeTyp: [...currentTypes, typeToAdd].join(", "),
    }
    applyArendeUpdate(updatedArende)
    await updateArende(arende.id, updatedArende)
  }

  async function handleRemoveType(typeToRemove) {
    if (currentTypes.length <= 1) return
    if (
      Object.values(DEPENDENT_TYPES).includes(typeToRemove) &&
      currentTypes.some(type => DEPENDENT_TYPES[type] === typeToRemove)
    ) {
      window.alert(`Ta bort beroende typer (t.ex. Omslipning) innan du tar bort ${typeToRemove}.`)
      return
    }
    const updatedArende = {
      ...arende,
      arendeTyp: currentTypes.filter(t => t !== typeToRemove).join(", "),
    }
    applyArendeUpdate(updatedArende)
    await updateArende(arende.id, updatedArende)
  }

  function openJobbForm(type) {
    setJobbFormType(type)
    setJobbForm(EMPTY_JOBB_FORM)
  }

  function closeJobbForm() {
    setJobbFormType(null)
    setJobbForm(EMPTY_JOBB_FORM)
  }

  async function submitJobbForm(e) {
    e.preventDefault()
    const finishedType = jobbFormType
    const formSnapshot = { ...jobbForm }
    const arendeSnapshot = arende
    const types = getTypes(arendeSnapshot.arendeTyp)

    if (
      Object.values(DEPENDENT_TYPES).includes(finishedType) &&
      types.some(type => DEPENDENT_TYPES[type] === finishedType)
    ) {
      window.alert(`Ta bort eller slutför beroende typer (t.ex. Omslipning) innan du slutför ${finishedType}.`)
      return
    }

    const updatedArende =
      types.length > 1
        ? {
            ...arendeSnapshot,
            arendeTyp: types.filter(type => type !== finishedType).join(", "),
          }
        : { ...arendeSnapshot, status: "Stängt" }

    applyArendeUpdate(updatedArende)
    closeJobbForm()

    try {
      await updateArende(arendeSnapshot.id, updatedArende)
    } catch (err) {
      console.error("Kunde inte uppdatera ärendetyp/status:", err)
    }

    try {
      await laggTillTrace(
        types.length > 1
          ? `markerade ${finishedType} som utfört.`
          : "ändrade status till Stängt",
        arendeSnapshot
      )
    } catch (err) {
      console.error("Kunde inte spara trace:", err)
    }

    try {
      await addFinishComment(formSnapshot, arendeSnapshot, finishedType)
      const data = await getKommentarer()
      setKommentarer(data)
    } catch (err) {
      console.error("Kunde inte spara slutkommentar:", err)
    }
  }

  return <div>
    <div className="button-panel">
      <button onClick={() => { setActiveArende(null); setView('oversikt') }}>
        Tillbaka
      </button>
      <button onClick={() => setView('oversikt')}>
        Översikt
      </button>
      <button onClick={() => setView('bilder')}>
        Bilder
      </button>
    </div>
    {view === 'oversikt' && <div>
      <div className="mobile-detail-view">
        <div className="mobile-info-row">
          <div className="mobile-info-box">
            <h3>{arende.avlidenNamn}</h3>
            <p>Kyrkogård: <strong>{arende.kyrkogard}</strong></p>
            <p>Kvarter: <strong>{arende.kvarter}</strong></p>
            <p>Gravnummer: <strong>{arende.gravnummer}</strong></p>
            <p>Beställare: <strong>{arende.bestallare}</strong></p>
            <p>Telefon: <strong>{arende.tel}</strong></p>
            <p>E-post: <strong>{arende.email}</strong></p>
          </div>
          <div className="mobile-type-panel">
            {currentTypes.map(type => (
              <div
                className="mobile-type-tag"
                key={type}
                style={{ backgroundColor: typeColor[type]?.[0] || "transparent" }}
              >
                <span className="mobile-type-tag-label">{type}</span>
                <button
                  type="button"
                  className="mobile-type-tag-check"
                  onClick={() => openJobbForm(type)}
                >
                  ✓
                </button>
                {currentTypes.length > 1 && (
                  <button
                    type="button"
                    className="mobile-type-tag-delete"
                    onClick={() => {
                      if (window.confirm(`Är du säker på att du vill ta bort taggen "${type}"?`)) {
                        handleRemoveType(type)
                      }
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {canCombine && availableTypes.length > 0 && (
              <select
                className="mobile-type-add"
                value=""
                onChange={(e) => handleAddType(e.target.value)}
              >
                <option value="">+</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
      <div className="comment-field-mobile">
        <h3>Kommentarer</h3>
        {relevantKommentarer.length === 0 && (
          <p className="mobile-comment-empty">Inga kommentarer ännu.</p>
        )}
        {relevantKommentarer.map(k => (
          <div className="kommentar-card" key={k.id}>
            <pre>{k.innehall}</pre>
          </div>
        ))}
        <form className="mobile-comment-form" onSubmit={addNewKommentar}>
          <textarea
            className="mobile-comment-input"
            value={currentKommentar}
            onChange={(e) => setCurrentKommentar(e.target.value)}
            placeholder="Skriv en kommentar..."
            rows={3}
          />
          <button type="submit" disabled={submittingKommentar || !currentKommentar.trim()}>
            Lägg till kommentar
          </button>
        </form>
      </div>
    </div>}
    {view === 'bilder' && <MobileBildView arende={arende} />}
    {jobbFormType && createPortal(
      <div
        className="arende-jobb-form-overlay"
        onClick={(e) => {
          e.stopPropagation()
          closeJobbForm()
        }}
      >
        <form
          className="arende-jobb-form"
          onClick={(e) => e.stopPropagation()}
          onSubmit={submitJobbForm}
        >
          <h3>Markera jobb som utfört: {jobbFormType}</h3>
          <label>
            Vem utförde jobbet?
            <input
              type="text"
              value={jobbForm.utforare}
              onChange={(e) => setJobbForm({ ...jobbForm, utforare: e.target.value })}
            />
          </label>
          <label>
            Uppstod några problem?
            <textarea
              value={jobbForm.problem}
              onChange={(e) => setJobbForm({ ...jobbForm, problem: e.target.value })}
            />
          </label>
          <label>
            Övriga anteckningar
            <textarea
              value={jobbForm.anteckningar}
              onChange={(e) => setJobbForm({ ...jobbForm, anteckningar: e.target.value })}
            />
          </label>
          <div className="arende-jobb-form-actions">
            <button type="button" onClick={closeJobbForm}>Avbryt</button>
            <button type="submit">Ok</button>
          </div>
        </form>
      </div>,
      document.body
    )}
  </div>
}

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { TbGrave2 } from "react-icons/tb";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { HiOutlineMail } from "react-icons/hi";
import { IoPersonOutline } from "react-icons/io5";
import { BsTelephone } from "react-icons/bs";
import ArendeCardButtons from '../ArendeCardButtons.jsx'
import handleStatusChange from '../handleStatusChange.jsx'
import { updateArende } from "../api.js";
import { ticketColorStyle, typeColor } from '../Helpers/ticketColors.js'
import getTypes from '../Helpers/getTypes.js'
import hasType  from '../Helpers/hasType.js'
import addFinishComment from './addFinishComment.js'

const NON_COMBINABLE_TYPES = ["Ny sten", "Lilla Dalen", "Högalid"];
const COMBINABLE_TYPES = [
  "Nyinskription",
  "Stabilisering",
  "Rengöring",
  "Inspektion",
  "Ommålning",
  "Övrigt",
];
// Can only be added when the required type is already present; never as the sole/first type.
const DEPENDENT_TYPES = {
  Omslipning: "Nyinskription",
};

const EMPTY_JOBB_FORM = {
  utforare: "",
  problem: "",
  anteckningar: "",
};

async function handleSignerad(arende, setArenden) {
  const newValue = arende.signerad === 1 ? 0 : 1;
  const updatedArende = { ...arende, signerad: newValue };
  setArenden(prev =>
    prev.map(a => a.id === arende.id ? updatedArende : a)
  );
  await updateArende(arende.id, updatedArende);
}

async function handleFakturerad(arende, setArenden) {
  const newValue = arende.fakturerad === 1 ? 0 : 1;
  const updatedArende = { ...arende, fakturerad: newValue };
  setArenden(prev =>
    prev.map(a => a.id === arende.id ? updatedArende : a)
  );
  await updateArende(arende.id, updatedArende);
}

async function handleAddType(arende, setArenden, typeToAdd) {
  const types = getTypes(arende.arendeTyp);
  if (!typeToAdd || types.includes(typeToAdd)) return;
  const requiredType = DEPENDENT_TYPES[typeToAdd];
  if (requiredType && !types.includes(requiredType)) return;
  const updatedArende = {
    ...arende,
    arendeTyp: [...types, typeToAdd].join(", "),
  };
  setArenden(prev =>
    prev.map(a => a.id === arende.id ? updatedArende : a)
  );
  await updateArende(arende.id, updatedArende);
}

async function handleRemoveType(arende, setArenden, typeToRemove) {
  const types = getTypes(arende.arendeTyp);
  if (types.length <= 1) return;
  // Dependent types must not be left as the only remaining type.
  if (
    Object.values(DEPENDENT_TYPES).includes(typeToRemove) &&
    types.some(type => DEPENDENT_TYPES[type] === typeToRemove)
  ) {
    window.alert(`Ta bort beroende typer (t.ex. Omslipning) innan du tar bort ${typeToRemove}.`);
    return;
  }
  const updatedArende = {
    ...arende,
    arendeTyp: types.filter(t => t !== typeToRemove).join(", "),
  };
  setArenden(prev =>
    prev.map(a => a.id === arende.id ? updatedArende : a)
  );
  await updateArende(arende.id, updatedArende);
}

export default function ArendeCard({
  arende,
  showMore,
  setShowMore,
  setActiveArende,
  setTypeToSearch,
  kyrkogardar,
  setArenden,
  updateArendeStatus,
  handleDeleteButton,
}) {
  const [jobbFormType, setJobbFormType] = useState(null);
  const [jobbForm, setJobbForm] = useState(EMPTY_JOBB_FORM);

  const currentTypes = getTypes(arende.arendeTyp);
  const canCombine = !currentTypes.some(type => NON_COMBINABLE_TYPES.includes(type));
  const availableTypes = [
    ...COMBINABLE_TYPES.filter(type => !currentTypes.includes(type)),
    ...Object.entries(DEPENDENT_TYPES)
      .filter(([type, requiredType]) =>
        currentTypes.includes(requiredType) && !currentTypes.includes(type)
      )
      .map(([type]) => type),
  ];

  function openJobbForm(type) {
    setJobbFormType(type);
    setJobbForm(EMPTY_JOBB_FORM);
  }

  function closeJobbForm() {
    setJobbFormType(null);
    setJobbForm(EMPTY_JOBB_FORM);
  }

  async function submitJobbForm(e) {
    e.preventDefault();
    const finishedType = jobbFormType;
    const formSnapshot = { ...jobbForm };
    const arendeSnapshot = arende;
    const types = getTypes(arendeSnapshot.arendeTyp);

    if (
      Object.values(DEPENDENT_TYPES).includes(finishedType) &&
      types.some(type => DEPENDENT_TYPES[type] === finishedType)
    ) {
      window.alert(`Ta bort eller slutför beroende typer (t.ex. Omslipning) innan du slutför ${finishedType}.`);
      return;
    }

    const updatedArende =
      types.length > 1
        ? {
            ...arendeSnapshot,
            arendeTyp: types
              .filter(type => type !== finishedType)
              .join(", "),
          }
        : { ...arendeSnapshot, status: "Stängt" };

    setArenden(prev =>
      prev.map(a => (a.id === arendeSnapshot.id ? updatedArende : a))
    );
    closeJobbForm();

    try {
      await updateArende(arendeSnapshot.id, updatedArende);
    } catch (err) {
      console.error("Kunde inte uppdatera ärendetyp/status:", err);
    }

    try {
      await addFinishComment(formSnapshot, arendeSnapshot, finishedType);
    } catch (err) {
      console.error("Kunde inte spara slutkommentar:", err);
    }
  }

  return (
    <div className= "arende-card-ny"
      style={ticketColorStyle(arende.status, arende.arendeTyp)}>
      <div>
      <div className = "arende-card-header-and-button">
      <h3 className = "truncate" onClick={() => {setActiveArende(arende); setShowMore(null); setTypeToSearch("");}}>{arende.avlidenNamn}: {arende.status}</h3>
      {showMore !== arende.id && <IoMdArrowDropright className = "dropdown-arrow" onClick = {() => {setShowMore(arende.id)}}/>}
      {showMore === arende.id && <IoMdArrowDropdown className = "dropdown-arrow" onClick = {() => {setShowMore(null)}}/>}
      </div>
      <div className = "arende-typ-tags">
      {currentTypes.map(type => (
        <p
          className = "arende-typ-tag"
          key={type}
          style={{ backgroundColor: typeColor[type]?.[0] || "transparent" }}
        >
          {type}
          <button
            type="button"
            className="arende-typ-tag-check-button"
            onClick={(e) => {
              e.stopPropagation();
              openJobbForm(type);
            }}
          >
            ✓
          </button>
          {currentTypes.length > 1 && (
            <button
              type="button"
              className="arende-typ-tag-delete-button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Är du säker på att du vill ta bort taggen "${type}"?`)) {
                  handleRemoveType(arende, setArenden, type);
                }
              }}
            >
              x
            </button>
          )}
        </p>
      ))}
      {canCombine && availableTypes.length > 0 && (
        <select
          className="arende-typ-tag-add-button"
          value=""
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            handleAddType(arende, setArenden, e.target.value);
          }}
        >
          <option value="">+</option>
          {availableTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      )}
      </div>
      {jobbFormType && createPortal(
        <div
          className="arende-jobb-form-overlay"
          onClick={(e) => {
            e.stopPropagation();
            closeJobbForm();
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
      <div className = "arende-typ-checkboxes-and-header">
      <div className = "arende-typ-checkboxes">
      {(hasType(arende.arendeTyp, "Ny sten") || hasType(arende.arendeTyp, "Nyinskription")) && <>
      <div>
      <label>Kund</label>
      <input type = "checkbox" checked = {arende.status === "Godkänd av kund" || arende.status === "Redo" || arende.status === "LEGACY" || arende.status === "Stängt" || arende.status === "Godkänd av kund, väntar svar av kyrkogård"} onChange = {() => handleStatusChange("kund", arende, setArenden)}></input>
      </div>
      <div>
      <label>Kyrkogård</label>
      <input type = "checkbox" checked = {arende.status === "Godkänd av kyrkogård" || arende.status === "Redo" || arende.status === "LEGACY" || arende.status === "Stängt" || arende.status === "Godkänd av kyrkogård, väntar svar av kund"} onChange = {() => handleStatusChange("kyrkogård", arende, setArenden)}></input>
      </div>
      {hasType(arende.arendeTyp, "Ny sten") && <div>
      <label>Signerad</label>
      <input type = "checkbox" checked = {arende.signerad === 1 || arende.status === "Väntar svar av kyrkogård" || arende.status === "Godkänd av kund, väntar svar av kyrkogård" || arende.status === "Väntar svar av kund och kyrkogård" || arende.status === "Godkänd av kyrkogård" || arende.status === "Godkänd av kyrkogård, väntar svar av kund" || arende.status === "Redo" || arende.status === "Stängt"} onChange = {() => handleSignerad(arende, setArenden)} />
      </div>}
      </>}
      <div className = "fakturerad-checkbox">
      <label>Fakturerad</label>
      <input type = "checkbox" checked = {arende.fakturerad === 1} onChange = {() => handleFakturerad(arende, setArenden)} />
      </div>
      </div>
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
  );
}

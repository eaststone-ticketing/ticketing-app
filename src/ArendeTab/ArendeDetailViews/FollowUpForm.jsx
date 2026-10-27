import { useState } from 'react';
import { createPortal } from 'react-dom';
import { addArende, addKommentarer } from '../../api.js';
import laggTillTrace from '../../laggTillTrace.jsx';

const FOLLOW_UP_TYPES = ["Inspektion", "Stabilisering", "Rengöring", "Nyinskription"];

const EMPTY_FORM = {
  arendeTyp: "",
  tillkommandeNamn: "",
  beskrivning: "",
  annanKund: false,
  bestallare: "",
  adress: "",
  email: "",
  tel: "",
};

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

function buildFollowUp(original, form) {
  const { id: _id, deleted_at: _deletedAt, ...rest } = original;
  const isNyinskription = form.arendeTyp === "Nyinskription";

  return {
    ...rest,
    datum: new Date().toISOString().split('T')[0],
    arendeTyp: form.arendeTyp,
    status: "Nytt",
    signerad: 0,
    fakturerad: 0,
    pris: "",
    avlidenNamn: isNyinskription ? form.tillkommandeNamn.trim() : original.avlidenNamn,
    nuvarandeText: isNyinskription ? (original.avlidenNamn ?? "") : original.nuvarandeText,
    fodelseDatum: isNyinskription ? "" : original.fodelseDatum,
    dodsDatum: isNyinskription ? "" : original.dodsDatum,
    ...(form.annanKund
      ? {
          bestallare: form.bestallare.trim(),
          adress: form.adress.trim(),
          email: form.email.trim(),
          tel: form.tel.trim(),
          postnummer: "",
          ort: "",
        }
      : {}),
  };
}

export default function FollowUpForm({ original, setArenden, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function submitFollowUp(e) {
    e.preventDefault();
    if (submitting) return;

    if (
      !form.beskrivning.trim() ||
      (form.arendeTyp === "Nyinskription" && !form.tillkommandeNamn.trim()) ||
      (form.annanKund && (!form.bestallare.trim() || !form.adress.trim() || !form.email.trim() || !form.tel.trim()))
    ) {
      setError("Fyll i alla obligatoriska fält.");
      return;
    }

    setSubmitting(true);
    setError("");

    const innehall = appendNameAndDate(
      `Uppföljning på #${original.id}\n${form.beskrivning.trim()}`
    );

    let newArende;
    try {
      newArende = await addArende(buildFollowUp(original, form));
    } catch (err) {
      console.error("Kunde inte skapa uppföljning:", err);
      setError("Kunde inte skapa uppföljningen.");
      setSubmitting(false);
      return;
    }

    if (!newArende?.id) {
      console.error("Kunde inte skapa uppföljning:", newArende);
      setError("Kunde inte skapa uppföljningen.");
      setSubmitting(false);
      return;
    }
    try {
      await addKommentarer({
        arendeID: Number(newArende.id),
        innehall,
        tagged_users: JSON.stringify([]),
        seen: 0,
      });
    } catch (err) {
      console.error("Kunde inte spara uppföljningskommentar:", err);
      window.alert("Ärendet skapades, men kommentaren kunde inte sparas.");
    }

    try {
      await laggTillTrace(`har skapat ärendet som uppföljning på #${original.id}`, newArende);
    } catch (err) {
      console.error("Kunde inte spara trace på nytt ärende:", err);
    }

    setArenden(prev => [...prev, newArende]);
    onCreated(newArende);
  }

  return createPortal(
    <div
      className="arende-jobb-form-overlay"
      onClick={(e) => {
        e.stopPropagation();
        if (!submitting) onClose();
      }}
    >
      <form
        className="arende-jobb-form"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submitFollowUp}
      >
        <h3>Skapa uppföljning på #{original.id}</h3>
        <label>
          Ärendetyp
          <select
            required
            value={form.arendeTyp}
            onChange={(e) => updateField("arendeTyp", e.target.value)}
          >
            <option value="">Välj ärendetyp</option>
            {FOLLOW_UP_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        {form.arendeTyp === "Nyinskription" && (
          <label>
            Tillkommande namn
            <input
              type="text"
              required
              value={form.tillkommandeNamn}
              onChange={(e) => updateField("tillkommandeNamn", e.target.value)}
            />
          </label>
        )}
        <label>
          Beskriv vad som behöver göras
          <textarea
            required
            value={form.beskrivning}
            onChange={(e) => updateField("beskrivning", e.target.value)}
          />
        </label>
        <label className="arende-jobb-form-checkbox">
          <input
            type="checkbox"
            checked={form.annanKund}
            onChange={(e) => updateField("annanKund", e.target.checked)}
          />
          Annan kund?
        </label>
        {form.annanKund && (
          <>
            <label>
              Kundnamn
              <input
                type="text"
                required
                value={form.bestallare}
                onChange={(e) => updateField("bestallare", e.target.value)}
              />
            </label>
            <label>
              Adress
              <input
                type="text"
                required
                value={form.adress}
                onChange={(e) => updateField("adress", e.target.value)}
              />
            </label>
            <label>
              E-post
              <input
                type="text"
                required
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </label>
            <label>
              Telefon
              <input
                type="text"
                required
                value={form.tel}
                onChange={(e) => updateField("tel", e.target.value)}
              />
            </label>
          </>
        )}
        {error && <p className="arende-jobb-form-error">{error}</p>}
        <div className="arende-jobb-form-actions">
          <button type="button" onClick={onClose} disabled={submitting}>Avbryt</button>
          <button type="submit" disabled={submitting}>Ok</button>
        </div>
      </form>
    </div>,
    document.body
  );
}

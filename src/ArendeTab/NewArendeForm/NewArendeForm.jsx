import './NewArendeForm.css'
import { useState } from 'react'
import { useForm } from 'react-hook-form';
import { addArende, addKund } from '../../api.js'

/*
The new arende form is a form that creates a new arende (job, task or errand) and is designed to correspond to an earlier pdf-form
used by the client. The fields and layout are the same to ease the transition for users.

Possible improvements could be making the form multi-step since there are many inputs,
though this would violate one of the original design principles of this project to provide a smooth transition for users.
Further form validation might also be a good idea, 
especially as new features for automatically generating design templates are implemented. These require standardized data.
*/

export default function NewArendeForm( { arenden, setArenden, kyrkogardar, kunder, setKunder, setSkapaArende, skapaArende } ) {

const entryValidations = {
  "avlidenNamn" : true,
  "bestallare" : true,
  "email" : true,
  "tel" : true
}


const inputField = (label, namn, type, required = false) => {
    return <label htmlFor = {namn}>{label}
        <input 
          id = {namn} 
          type = {type}
          {...register(namn , {required: required})}>
        </input>
    </label>
}

const mapInputFields = (entryArray, sectionLabel, errors) => {
  return (
    <div>
      <h4>{sectionLabel}</h4>
      {entryArray.map((entry, index) => (
        <div key={index}>
            {inputField(entry.label, entry.name, "text", entryValidations.hasOwnProperty(entry.name) ? entryValidations[entry.name] : false )}
        </div>
      ))}
    </div>
  );
};

const {
  register,
  handleSubmit,
  watch,
  formState: { errors },
  reset
  }  = useForm();

const arendeTypValue = watch('arendeTyp'); //Used for conditional rendering of nuvarande text input which is only valid for certain arende types

const onSubmit = async (data) => {
  try {

    const datum = new Date().toISOString().split('T')[0];  //Splitting by T removes the time of day and just leaves the date
    const newArende = await addArende({ datum, ...data, status: 'Nytt'})
        
    setArenden([...arenden, newArende]);
        
    const kundNamn = data.bestallare;
    const kundTel = data.tel;

    if (!kunder.some(k => k.namn === kundNamn && k.tel === kundTel)) {
      const newKund = await addKund({bestallare: data.bestallare, email: data.email, telefonnummer: data.tel, adress: data.adress})
      setKunder([...kunder, newKund])
    }
    
    reset();
  }

  catch(err) {
    console.log(err)
  }

  setSkapaArende(false)
};

  const avlidenEntries = [
    {label:"Namn", type: "text", name: "avlidenNamn"},
    {label:"Födelsedatum", type:"date", name:"fodelseDatum"},
    {label:"Dödsdatum", type: "date", name: "dodsDatum"},
  ]

  const bestallareEntries = [
    {label:"Namn", type:"text", name:"bestallare"},
    {label:"Adress", type:"text", name: "adress"},
    {label:"Postnummer", type:"text", name:"postnummer"},
    {label:"Ort", type:"text", name:"ort"},
    {label:"Email", type:"text", name:"email"},
    {label:"Telefonnummer", type:"text", name:"tel"},
  ]

  const gravstenEntries = [
    {label: "Modell", type:"text", name:"modell"},
    {label: "Material", type:"text", name: "material"},
    {label: "Symboler vid datum", type: "text", name: "symboler"},
    {label: "Beteckning, baksida", type: "text", name: "beteckning"}
  ]

  const bearbetningEntries = [
    {label: "Framsida", type: "text", name: "framsida"},
    {label: "Kanter", type: "text", name: "kanter"},
    {label: "Sockel", type: "text", name: "sockelBearbetning"}
  ]

  const utsmyckningEntries = [
    {label: "Typsnitt", type: "text", name: "typsnitt"},
    {label: "Färg", type: "text", name: "farg"},
    {label: "Dekor", type: "text", name: "dekor"},
    {label: "Plats för fler namn", type: "text", name: "platsForFlerNamn"},
    {label: "Minnesord", type: "text", name: "minnesord"}
  ]

  return <form onSubmit={handleSubmit(onSubmit)} className="form">
    <div className = "new-stone-form-top">
      <select name = "arendeTyp" {...register("arendeTyp", {required: "Välj ärendetyp"})}>
        <option value = "">Välj ärendetyp</option>
        <option>Ny sten</option>
        <option>Nyinskription</option>
        <option>Stabilisering</option>
        <option>Rengöring</option>
        <option>Inspektion</option>
        <option>Ommålning</option>
      </select>
    </div>

    <div>
    </div>

    <div>
    </div> 

    <div className = "avliden-gravsten">
      {mapInputFields(avlidenEntries, "Avliden", errors)}
      {inputField("Faktura till dödsbo?", "fakturaTillDodsbo", "checkbox", false)}
      <div className = "gravsten-entries">
        {mapInputFields(gravstenEntries, "Gravsten", errors)}
        {inputField("Sockel?", "sockel", "checkbox", false)}
        <div></div>
        {inputField("Stående?", "staende", "checkbox", false)}
      </div>
    </div>

    <div>
      <div className = "bestallare-entries">
        {mapInputFields(bestallareEntries, "Beställare", errors)}
      </div>
      <div className = "bearbetning-entries">
        {mapInputFields(bearbetningEntries, "Bearbetning", errors)}
      </div>
    </div>

    <div>
      <div className = "begravningsplats-entries">
        <h4>Begravningsplats</h4>
        <label>Begravningsplats</label>
        <select
          className = "select"
          name="kyrkogard"
          {...register('kyrkogard', {required: "Välj kyrkogård"})}>
          <option value="">Välj begravningsplats</option>
          {[...kyrkogardar].filter(k => k && k.namn).sort((a, b) => a.namn.localeCompare(b.namn)).map((k) => (
            <option key = {k.id} value={k.namn}>
              {k.namn}
            </option>
          ))}
        </select>
        <div className = "form-entry">
          {inputField("Kvarter", "kvarter", "text", false)}
        </div>
        <div className = "form-entry">
            {inputField("Gravnummer", "gravnummer", "text", false)}
        </div>
      <div className = "utsmyckning-entries">
        {mapInputFields(utsmyckningEntries, "Utsmyckning", errors)}
        <label>Förhöjd/Försänkt</label>
        <select
            name="forsankt"
            {...register("forsankt", {required: false})}
            >
          <option>Förhöjd/Försänkt</option>
          <option>Förhöjd</option>
          <option>Försänkt</option>
        </select>
        </div>
      </div>
    </div>
    <div>
        {inputField("Pris", "pris", "text", false)}
    </div>
    <div>
      {arendeTypValue !== "Ny sten" && arendeTypValue !== "Välj ärendetyp" && arendeTypValue !== "" && <div> 
        {inputField("Nuvarande Text", "nuvarandeText", "text", false)}
      </div> }
    </div>
    <div></div>
    <div>
        {inputField("GRO-sockel?", "GRO", "checkbox", false)}
    </div>
    <button type = "submit">Skapa ärende</button>
    {skapaArende && <button className = "exit-button" onClick = {() => setSkapaArende(false)}><strong>X</strong> Tillbaka till översikt</button>}
  </form>
}

import './NewArendeForm.css'
import { useState } from 'react'
import { useForm } from 'react-hook-form';
import { addArende, addKund, addKommentarer } from '../../api.js'
import laggTillTrace from '../../laggTillTrace.jsx'

/*
The new arende form is a form that creates a new arende (job, task or errand) and is designed to correspond to an earlier pdf-form
used by the client. The fields and layout are the same to ease the transition for users.

Possible improvements could be making the form multi-step since there are many inputs,
though this would violate one of the original design principles of this project to provide a smooth transition for users.
Further form validation might also be a good idea, 
especially as new features for automatically generating design templates are implemented. These require standardized data.

*/

function findTaggedUsers(comment) {
  const regex = /@([^\s@]+)/g;
  const tags = [];
  let match;

  while ((match = regex.exec(comment)) !== null) {
    tags.push(match[1]);
  }

  return tags;
}

function appendNameAndDate(innehall){
  const user = JSON.parse(localStorage.getItem('user') )
    const time = new Date();
    const timestamp = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}, ${time.getHours()}:${time.getMinutes() > 9 ? time.getMinutes(): `0${time.getMinutes()}`}`
  if(user){
    const newContent = `\n\n${user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}\n${timestamp}`
    return innehall + newContent
  }
  else{
    const newContent = `\n\n${timestamp}`
    return innehall + newContent;
  }
}

async function addNewKommentar(innehall, id) {
  
  const newInnehall = appendNameAndDate(innehall);
  const numberID = Number(id)
  const tags = JSON.stringify(findTaggedUsers(innehall))
  const kommentar = {arendeID: numberID, innehall: newInnehall, tagged_users: tags, seen: 0}
  console.log(`kommentar: ${kommentar.innehall}`)
  await addKommentarer(kommentar)
}

export default function NewArendeForm( { arenden, setArenden, kyrkogardar, kunder, setKunder, setSkapaArende, skapaArende } ) {

const entryValidations = {
  "avlidenNamn" : true,
  "bestallare" : true,
  "email" : true,
  "tel" : true
}

const entryDefaults = {
  "fodelseDatum" : "ÅÅÅÅ eller ÅÅÅÅ-MM-DD",
  "dodsDatum" : "ÅÅÅÅ eller ÅÅÅÅ-MM-DD"
}


const inputField = (label, namn, type, required = false, options = []) => {
    return <div>
    {type !== "dropdown" && <label className = {`input-field${type === "checkbox" ? "-checkbox":""}`} htmlFor = {namn}>{label}
        <input 
          id = {namn} 
          type = {type}
          placeholder= {entryDefaults.hasOwnProperty(namn) ? entryDefaults[namn] : ""}
          {...register(namn , {required: required})}>
        </input>
    </label>}

    {type === "dropdown" && <label className = "input-field" htmlFor = {namn}>{label} 
      <select id = {namn} {...register(namn, {required: required})}>
        <option>-</option>
        {options.map(o =>
          <option>{o}</option>
        )}
      </select>
      </label>}
    </div>
}

const mapInputFields = (entryArray, sectionLabel, errors) => {
  return (
    <div>
      <h4>{sectionLabel}</h4>
      {entryArray.map((entry, index) => (
        <div key={index}>
            {inputField(entry.label, entry.name, entry.type, entryValidations.hasOwnProperty(entry.name) ? entryValidations[entry.name] : false )}
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
  console.log("Submission has happened at all!")
  try {

    console.log("And we are trying")

    const datum = new Date().toISOString().split('T')[0];  //Splitting by T removes the time of day and just leaves the date
    const newArende = await addArende({ datum, ...data, status: 'Nytt'})

    addNewKommentar(data.kommentar, newArende.id)

    laggTillTrace("har skapat ärendet", newArende)
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
    {label:"Födelsedatum", type:"text", name:"fodelseDatum"},
    {label:"Dödsdatum", type: "text", name: "dodsDatum"},
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
    {label: "Sockel", type: "text", name: "sockelBearbetning"},
    {label: "Gravrättsinnehavare", type: "text", name: "gravrattsinnehavare"}
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
        <option>Inspektering</option>
        <option>Ommålning</option>
        <option>Övrigt</option>
      </select>

      <div>
        {arendeTypValue !== "Ny sten" && arendeTypValue !== "Välj ärendetyp" && arendeTypValue !== "" && <div className = "nuvarande-text-input"> 
          {inputField("Nuvarande Text", "nuvarandeText", "text", false)}
        </div> }
      </div>
      
      {skapaArende && <button type = "button" className = "tillbaka-till-oversikt-button" onClick = {() => setSkapaArende(false)}><strong>X</strong> Tillbaka till översikt</button>}


    </div>

    <div>
    </div>

    <div>
    </div> 

    <div className = "avliden-gravsten">
      {mapInputFields(avlidenEntries, "Avliden", errors)}
      <div className = "faktura-till-dodsbo-checkbox">
      {inputField("Faktura till dödsbo", "fakturaTillDodsbo", "checkbox", false)}
      </div>
      <div className = "gravsten-entries">
        {mapInputFields(gravstenEntries, "Gravsten", errors)}
        {inputField("Sockel", "sockel", "checkbox", false)}
        <div></div>
                <select
          className = "select"
          name="stande"
          {...register('staende')}>
          <option value="">Stående/Liggande</option>
            <option value = {1}>
              Stående
            </option>
            <option value = {0}>
              Liggande
            </option>
          
        </select>
          <div>
        {inputField("Pris", "pris", "text", false)}
      </div>
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
        <div className = "GRO-checkbox">
        {inputField("GRO-sockel", "GRO", "checkbox", false)}
        </div>
        </div>
      </div>
    </div>
    <label> Kommentar
    <textarea className = "skapaarende-kommentar" id = "kommentar" {...register("kommentar", {required: false})}></textarea>
    </label>
    <button className = "submit-button" type = "submit">Skapa ärende</button>
    <select
      name = "ursprung"
      {...register("ursprung", {required: true})}
    >
      <option value = "">
        Välj ursprung
      </option>
      <option>
        Eaststone
      </option>
      <option>
        Stockholms Gravstenar
      </option>
    </select>
    </form>
}

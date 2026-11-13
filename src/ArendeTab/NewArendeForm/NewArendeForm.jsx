import './NewArendeForm.css'
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form';
import {
  addArende,
  addKund,
  addKommentarer,
  addKyrkogard,
  addStenObjekt,
  getStenObjekt,
  updateStenObjekt,
} from '../../api.js'
import laggTillTrace from '../../laggTillTrace.jsx'
import { getToken } from '../../Helpers/auth.js'
import { cmToMm, mmToCm } from '../../Helpers/stoneUnits.js'
import buildKostnadLines, {
  FARG_TILLAGG_OPTIONS,
  applyAmountOverrides,
  formatKostnadspecifikationComment,
  reconcileOverrides,
  sumKostnadLines,
} from '../../Helpers/buildKostnadLines.js'
import getTypes from '../../Helpers/getTypes.js'
import hasType from '../../Helpers/hasType.js'
import StenObjektSection, { TEXTKOMPLETTERING_STATUS } from './StenObjektSection.jsx'
import ArendeTypTagPicker from './ArendeTypTagPicker.jsx'
import Kostnadspecifikation from './Kostnadspecifikation.jsx'
import { STEN_STATUS_OPTIONS } from '../../StenarTab/StenarSearchMenu.jsx'

const FARG_TILLAGG_LABELS = new Set(FARG_TILLAGG_OPTIONS.map((opt) => opt.farg))
const RELIEF_OPTION = FARG_TILLAGG_OPTIONS.find((opt) => opt.id === 'relief')

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
  const user = JSON.parse(localStorage.getItem('user') || {} )
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
  if (!innehall){
    return
  }
  
  const newInnehall = appendNameAndDate(innehall);
  const numberID = Number(id)
  const tags = JSON.stringify(findTaggedUsers(innehall))
  const kommentar = {arendeID: numberID, innehall: newInnehall, tagged_users: tags, seen: 0}
  await addKommentarer(kommentar)
}

function isUnassignedSten(sten) {
  const arendeID = sten.attr?.arendeID
  return arendeID == null || arendeID === '' || Number(arendeID) === 0
}

function buildStenAttr(stenData, { modell, arendeID }) {
  return {
    material: stenData.material ?? '',
    modell: modell ?? stenData.modell ?? '',
    hojd: cmToMm(stenData.hojd),
    bredd: cmToMm(stenData.bredd),
    djup: cmToMm(stenData.djup),
    skulptur: stenData.skulptur || '',
    laserportratt: !!stenData.laserportratt,
    lykthal: !!stenData.lykthal,
    specialBlasting: !!stenData.specialBlasting,
    prisKategori: stenData.prisKategori || 'A',
    framsida: '',
    baksida: '',
    kanter: '',
    arendeID,
    status: stenData.status || 'Behöver beställas',
  }
}

function stenLabel(sten) {
  const a = sten.attr ?? {}
  const dims = `${mmToCm(a.bredd ?? 0)}x${mmToCm(a.hojd ?? 0)}x${mmToCm(a.djup ?? 0)}cm`
  return `#${sten.id} ${a.modell ?? ''} ${a.material ?? ''} ${dims}`.trim()
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

const [createNewGraveyard, setCreateNewGraveyard] = useState(false)
const [useExistingSten, setUseExistingSten] = useState(false)
const [lagerStenar, setLagerStenar] = useState([])
const [selectedLagerStenId, setSelectedLagerStenId] = useState("")
const [amountOverrides, setAmountOverrides] = useState({})
const [fargTillagg, setFargTillagg] = useState(null)
const depKeysRef = useRef({})

const inputField = (label, namn, type, required = false) => {
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
      </select>
      </label>}
    </div>
}

const mapInputFields = (entryArray, sectionLabel) => {
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
  reset,
  setValue,
  getValues,
  }  = useForm({
    defaultValues: {
      arendeTyp: '',
      sten: { status: 'Behöver beställas', skulptur: '', material: '', prisKategori: 'A' },
      sockelSten: { status: 'Behöver beställas', skulptur: '', material: '', prisKategori: 'A' },
      pris: '',
    }
  });

const arendeTypValue = watch('arendeTyp');
const arendeTypes = getTypes(arendeTypValue);
const sockelChecked = watch('sockel');
const forsanktValue = watch('forsankt');
// Watch leaf fields so price updates when RHF mutates nested `sten` in place.
const stenHojd = watch('sten.hojd');
const stenBredd = watch('sten.bredd');
const stenDjup = watch('sten.djup');
const stenPrisKategori = watch('sten.prisKategori');
const stenSkulptur = watch('sten.skulptur');
const stenLykthal = watch('sten.lykthal');
const stenLaserportratt = watch('sten.laserportratt');
const stenSpecialBlasting = watch('sten.specialBlasting');
const hasNySten = hasType(arendeTypValue, 'Ny sten');
const isNyinskription = hasType(arendeTypValue, 'Nyinskription');
const needsStenObjekt = hasNySten || isNyinskription;
const stenStatusOptions = isNyinskription && !hasNySten ? TEXTKOMPLETTERING_STATUS : STEN_STATUS_OPTIONS;
const stenDefaultStatus = isNyinskription && !hasNySten ? 'Behöver hämtas' : 'Behöver beställas';

const selectedLagerSten = useExistingSten
  ? lagerStenar.find((s) => String(s.id) === String(selectedLagerStenId))
  : null

const defaultKostnadLines = buildKostnadLines({
  arendeTyp: arendeTypes,
  sten: {
    hojd: stenHojd,
    bredd: stenBredd,
    djup: stenDjup,
    prisKategori: stenPrisKategori,
    skulptur: stenSkulptur,
    lykthal: stenLykthal,
    laserportratt: stenLaserportratt,
    specialBlasting: stenSpecialBlasting,
  },
  sockelChecked: !!(needsStenObjekt && sockelChecked),
  useExistingSten,
  selectedLagerSten,
})

function handleArendeTypesChange(nextTypes) {
  setValue('arendeTyp', nextTypes.join(', '), { shouldValidate: true, shouldDirty: true })
}

const defaultKostnadKey = JSON.stringify(
  defaultKostnadLines.map((line) => ({
    id: line.id,
    dependencyKey: line.dependencyKey,
    amount: line.amount,
    children: line.children?.map((child) => ({
      id: child.id,
      dependencyKey: child.dependencyKey,
      amount: child.amount,
    })),
  }))
)

useEffect(() => {
  setAmountOverrides((prev) => {
    const { overrides, depKeys, changed } = reconcileOverrides(
      defaultKostnadLines,
      prev,
      depKeysRef.current
    )
    depKeysRef.current = depKeys
    return changed ? overrides : prev
  })
  // defaultKostnadLines is captured from the render that produced defaultKostnadKey
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [defaultKostnadKey])

const kostnadLines = applyAmountOverrides(defaultKostnadLines, amountOverrides)

const fargTillaggLine = fargTillagg
  ? {
      id: 'farg-tillagg',
      label: fargTillagg.label,
      amount: fargTillagg.amount,
      optionId: fargTillagg.optionId,
    }
  : null

const kostnadTotal = sumKostnadLines(
  fargTillaggLine ? [...kostnadLines, fargTillaggLine] : kostnadLines
)

useEffect(() => {
  setValue('pris', typeof kostnadTotal === 'number' ? String(kostnadTotal) : '')
}, [kostnadTotal, setValue])

function handleKostnadAmountChange(lineId, amount) {
  setAmountOverrides((prev) => {
    if (amount == null) {
      const next = { ...prev }
      // Keep explicit null overrides only for lines that default to null ("Pris saknas.")
      const defaultLine = defaultKostnadLines
        .flatMap((line) => (line.children?.length ? line.children : [line]))
        .find((line) => line.id === lineId)
      if (defaultLine && defaultLine.amount == null) {
        next[lineId] = null
        return next
      }
      delete next[lineId]
      return next
    }
    return { ...prev, [lineId]: amount }
  })
}

function applyFargTillagg(option) {
  setFargTillagg({
    optionId: option.id,
    label: option.label,
    amount: option.amount,
    defaultAmount: option.amount,
  })
  setValue('farg', option.farg)
}

function handleAddFargTillagg(option) {
  applyFargTillagg(option)
  if (option.id === 'relief') {
    setValue('forsankt', 'Förhöjd')
  } else {
    // Bladguld / guldfärg / silverfärg / kopparfärg → Försänkt
    setValue('forsankt', 'Försänkt')
  }
}

function handleRemoveFargTillagg() {
  const currentFarg = getValues('farg')
  const removingRelief = fargTillagg?.optionId === 'relief'
  setFargTillagg(null)
  if (FARG_TILLAGG_LABELS.has(currentFarg)) {
    setValue('farg', '')
  }
  if (removingRelief && getValues('forsankt') === 'Förhöjd') {
    setValue('forsankt', '')
  }
}

function handleFargTillaggAmountChange(amount) {
  setFargTillagg((prev) => (prev ? { ...prev, amount } : prev))
}

function resetKostnadState() {
  setAmountOverrides({})
  setFargTillagg(null)
  depKeysRef.current = {}
}

// Förhöjd ↔ Relief stay in sync.
useEffect(() => {
  if (forsanktValue === 'Förhöjd') {
    if (fargTillagg?.optionId === 'relief') return
    if (!RELIEF_OPTION) return
    applyFargTillagg(RELIEF_OPTION)
    return
  }
  if (fargTillagg?.optionId === 'relief') {
    setFargTillagg(null)
    if (FARG_TILLAGG_LABELS.has(getValues('farg'))) {
      setValue('farg', '')
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [forsanktValue])

useEffect(() => {
  if (!needsStenObjekt) return
  setValue('sten.status', stenDefaultStatus)
}, [needsStenObjekt, stenDefaultStatus, setValue])

useEffect(() => {
  if (needsStenObjekt && sockelChecked) {
    setValue('staende', '1')
  }
}, [needsStenObjekt, sockelChecked, setValue])

useEffect(() => {
  if (!needsStenObjekt || !useExistingSten) return
  async function loadLager() {
    try {
      const data = await getStenObjekt()
      setLagerStenar(
        data.filter((s) => s.attr?.status === "I lager" && isUnassignedSten(s))
      )
    } catch (err) {
      console.error(err)
    }
  }
  loadLager()
}, [needsStenObjekt, useExistingSten])

const onSubmit = async (data) => {
  try {
    const datum = new Date().toISOString().split('T')[0];
    const sten = data.sten;
    const sockelSten = data.sockelSten;
    const selectedLagerSten = useExistingSten
      ? lagerStenar.find((s) => String(s.id) === String(selectedLagerStenId))
      : null

    const submitTypes = getTypes(data.arendeTyp)
    if (!submitTypes.length) {
      window.alert("Välj minst en ärendetyp.")
      return
    }

    if (needsStenObjekt && useExistingSten && !selectedLagerSten) {
      window.alert("Välj en sten i lager eller skapa en ny.")
      return
    }

    const sourceStenAttr = useExistingSten ? selectedLagerSten?.attr : sten
    const submitIsNyinskription = hasType(data.arendeTyp, 'Nyinskription')
    const submitHasNySten = hasType(data.arendeTyp, 'Ny sten')

    const newArende = await addArende({
      datum,
      arendeTyp: data.arendeTyp,
      avlidenNamn: data.avlidenNamn,
      fodelseDatum: data.fodelseDatum,
      dodsDatum: data.dodsDatum,
      bestallare: data.bestallare,
      adress: data.adress,
      ort: data.ort,
      postnummer: data.postnummer,
      tel: data.tel,
      email: data.email,
      kyrkogard: data.kyrkogard,
      kvarter: data.kvarter,
      gravnummer: data.gravnummer,
      modell: useExistingSten
        ? (sourceStenAttr?.modell ?? "")
        : (submitIsNyinskription && !submitHasNySten
          ? "Textkomplettering"
          : (sten?.modell ?? "")),
      material: sourceStenAttr?.material ?? "",
      symboler: data.symboler,
      framsida: sourceStenAttr?.framsida ?? "",
      kanter: sourceStenAttr?.kanter ?? "",
      typsnitt: data.typsnitt,
      forsankt: data.forsankt,
      farg: data.farg,
      dekor: data.dekor,
      platsForFlerNamn: data.platsForFlerNamn,
      minnesord: data.minnesord,
      pris: data.pris,
      tillbehor: data.tillbehor,
      sockel: data.sockel ? 1 : 0,
      staende: data.staende,
      status: 'Nytt',
      gravrattsinnehavare: data.gravrattsinnehavare,
      ursprung: data.ursprung,
      nuvarandeText: data.nuvarandeText,
    })

    laggTillTrace("har skapat ärendet", newArende)
    if (data.kommentar) {
      await addNewKommentar(data.kommentar, newArende.id)
    }

    const kostnadCommentLines = fargTillaggLine
      ? [...kostnadLines, fargTillaggLine]
      : kostnadLines
    const kostnadComment = formatKostnadspecifikationComment(
      kostnadCommentLines,
      kostnadTotal
    )
    if (kostnadComment) {
      await addNewKommentar(kostnadComment, newArende.id)
    }

    if (needsStenObjekt && useExistingSten && selectedLagerSten) {
      await updateStenObjekt(selectedLagerSten.id, {
        attr: {
          ...selectedLagerSten.attr,
          arendeID: newArende.id,
        },
      })
    } else if (needsStenObjekt && !useExistingSten && sten) {
      await addStenObjekt({
        attr: buildStenAttr(sten, {
          modell: submitIsNyinskription && !submitHasNySten
            ? "Textkomplettering"
            : (sten.modell || ""),
          arendeID: newArende.id,
        }),
      })
    }

    if (needsStenObjekt && data.sockel && sockelSten) {
      await addStenObjekt({
        attr: buildStenAttr(sockelSten, {
          modell: "Sockel",
          arendeID: newArende.id,
        }),
      })
    }

    setArenden([...arenden, newArende]);
        
    const kundNamn = data.bestallare;
    const kundTel = data.tel;

    if (!kunder.some(k => k.namn === kundNamn && k.tel === kundTel)) {
      const newKund = await addKund({bestallare: data.bestallare, email: data.email, telefonnummer: data.tel, adress: data.adress})
      setKunder([...kunder, newKund])
    }

    if (createNewGraveyard && !kyrkogardar.some(k => k.namn === data.kyrkogard)){
      await addKyrkogard({namn: data.kyrkogard, kontaktperson: "", email: "", telefonnummer: "", address: "", ort: "", postnummer: "", kyrkogard_grupp: "", regler: ""})
    }

    reset();
    setUseExistingSten(false)
    setSelectedLagerStenId("")
    resetKostnadState()
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

  const utsmyckningEntries = [
    {label: "Dekor", type: "text", name: "dekor"},
    {label: "Plats för fler namn", type: "text", name: "platsForFlerNamn"},
    {label: "Minnesord", type: "text", name: "minnesord"}
  ]

  useEffect(() => {
    async function checkSession() {
      const token = await getToken();
      if (!token) {
        setSkapaArende(false);
      }
    }
    checkSession();
  }, []);

  return (
    <div className="new-arende-form-layout">
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        {skapaArende && (
          <button
            type="button"
            className="tillbaka-till-oversikt-button"
            onClick={() => setSkapaArende(false)}
            aria-label="Tillbaka till översikt"
            title="Tillbaka till översikt"
          >
            ×
          </button>
        )}

        <div className = "new-stone-form-top">
          <input
            type="hidden"
            {...register('arendeTyp', {
              validate: (value) => getTypes(value).length > 0 || 'Välj ärendetyp',
            })}
          />
          <ArendeTypTagPicker
            types={arendeTypes}
            onChange={handleArendeTypesChange}
          />
        </div>

        <div className = "form-column">
          {mapInputFields(avlidenEntries, "Avliden")}
          <div className = "gravsten-entries section-block">
            <h4>Text</h4>
            {inputField("Symboler vid datum", "symboler", "text", false)}
            {inputField("Typsnitt", "typsnitt", "text", false)}
            {inputField("Färg", "farg", "text", false)}
            <label className="input-field">
              Förhöjd/Försänkt
              <select name="forsankt" {...register("forsankt", {required: false})}>
                <option value="">Förhöjd/Försänkt</option>
                <option>Förhöjd</option>
                <option>Försänkt</option>
              </select>
            </label>
          </div>
        </div>

        <div className = "form-column">
          {mapInputFields(bestallareEntries, "Beställare")}
          <div className = "section-block">
            <h4>Övrigt</h4>
            {inputField("Gravrättsinnehavare", "gravrattsinnehavare", "text", false)}
            {inputField("Sockel", "sockel", "checkbox", false)}
            <input type="hidden" {...register('pris')} />
          </div>
        </div>

        <div className = "form-column">
          <div className = "begravningsplats-entries section-block">
            <h4>Begravningsplats</h4>
            <div className = "begravningsplats-field">
              {!createNewGraveyard ? (
                <select
                  name="kyrkogard"
                  {...register('kyrkogard', {required: "Välj kyrkogård"})}>
                  <option value="">Välj begravningsplats</option>
                  {[...kyrkogardar].filter(k => k && k.namn).sort((a, b) => a.namn.localeCompare(b.namn)).map((k) => (
                    <option key = {k.id} value={k.namn}>
                      {k.namn}
                    </option>
                  ))}
                </select>
              ) : (
                <input {...register('kyrkogard', {required: "Välj kyrkogård"})} />
              )}
              {!createNewGraveyard ? (
                <p className = "add-new-graveyard" onClick = {() => setCreateNewGraveyard(true)}>+Lägg till ny</p>
              ) : (
                <p className = "add-new-graveyard" onClick = {() => setCreateNewGraveyard(false)}>Använd existerande</p>
              )}
            </div>
            {inputField("Kvarter", "kvarter", "text", false)}
            {inputField("Gravnummer", "gravnummer", "text", false)}
          </div>
          <div className = "utsmyckning-entries section-block">
            {mapInputFields(utsmyckningEntries, "Utsmyckning")}
            {!hasNySten && arendeTypes.length > 0 && (
              inputField("Nuvarande Text", "nuvarandeText", "text", false)
            )}
            <select
              className = "select staende-select"
              name="stande"
              {...register('staende')}>
              <option value="">Stående/Liggande</option>
              <option value = {1}>Stående</option>
              <option value = {0}>Liggande</option>
            </select>
          </div>
        </div>

        {needsStenObjekt && (
          <div className="use-existing-sten-row">
            <button
              type="button"
              onClick={() => {
                setUseExistingSten((v) => !v)
                setSelectedLagerStenId("")
              }}
            >
              {useExistingSten ? "Skapa ny sten" : "Använd existerande sten"}
            </button>
            {useExistingSten && (
              <select
                value={selectedLagerStenId}
                onChange={(e) => setSelectedLagerStenId(e.target.value)}
                required
              >
                <option value="">Välj sten i lager</option>
                {lagerStenar.map((s) => (
                  <option key={s.id} value={s.id}>
                    {stenLabel(s)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {needsStenObjekt && !useExistingSten && (
          <div className="sten-objekt-full">
            <StenObjektSection
              key={`sten-${hasNySten ? 'ny-sten' : 'nyinskription'}`}
              title="Sten"
              prefix="sten"
              register={register}
              setValue={setValue}
              required={true}
              fixedModell={isNyinskription && !hasNySten ? "Textkomplettering" : null}
              showMaterial={!(isNyinskription && !hasNySten)}
              showSkulptur={!(isNyinskription && !hasNySten)}
              showPrisKategori={!(isNyinskription && !hasNySten)}
              showLaserportratt={!(isNyinskription && !hasNySten)}
              showLykthal={!(isNyinskription && !hasNySten)}
              showSpecialBlasting={true}
              statusOptions={stenStatusOptions}
              defaultStatus={stenDefaultStatus}
            />
          </div>
        )}

        {needsStenObjekt && sockelChecked && (
          <div className="sten-objekt-full">
            <StenObjektSection
              title="Sockel"
              prefix="sockelSten"
              register={register}
              setValue={setValue}
              required={true}
              fixedModell="Sockel"
              showMaterial={true}
              showSkulptur={false}
              showPrisKategori={false}
              showLaserportratt={false}
              showLykthal={false}
              showSpecialBlasting={false}
              statusOptions={STEN_STATUS_OPTIONS}
              defaultStatus="Behöver beställas"
            />
          </div>
        )}

        <label className="skapaarende-kommentar-wrap">
          Kommentar
          <textarea className = "skapaarende-kommentar" id = "kommentar" {...register("kommentar", {required: false})}></textarea>
        </label>
        <div className="form-footer">
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
        </div>
      </form>
      <Kostnadspecifikation
        lines={kostnadLines}
        emptyMessage={
          hasNySten
            ? 'Fyll i stenmått för att se pris.'
            : 'Välj ärendetyp för att se kostnader.'
        }
        onAmountChange={handleKostnadAmountChange}
        fargTillagg={fargTillaggLine}
        onAddFargTillagg={handleAddFargTillagg}
        onRemoveFargTillagg={handleRemoveFargTillagg}
        onFargTillaggAmountChange={handleFargTillaggAmountChange}
      />
    </div>
  )
}

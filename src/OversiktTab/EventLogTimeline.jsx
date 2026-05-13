import {getArenden, getTraces, getKyrkogardar, updateTrace, removeTraces} from '../api.js'
import {useEffect, useState} from 'react'

function parseDate(str) {
  if (!str) return null;

  // normalize format
  const cleaned = str
    .replace(",", "")     // remove comma
    .replace(" ", "T");   // replace space with T

  const [datePart, timePart] = cleaned.split("T");
  if (!datePart || !timePart) return null;

  let [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return null;

  let [hours, minutes] = timePart.split(":")

  if (!hours || !minutes) return null;

  hours = hours.padStart(2, "0");
  minutes = minutes.padStart(2, "0");

  month = month.padStart(2, "0");
  day = day.padStart(2, "0");

  return new Date(`${year}-${month}-${day}T${hours}:${minutes}`);
}

function average(arr) {
  if (!arr.length) return null; // avoid division by 0

  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
}

function stdev(arr) {
  if (arr.length < 2) return null;

  const mean = average(arr);

  const deviationsSquared = arr.map((obs) => (obs - mean) ** 2)

  const stdev = Math.sqrt(average(deviationsSquared))

  return stdev
}

function interpretPrice(price){

  let priceString = price ?? ""

  if (priceString.includes("=")){
    const equalsSplit = priceString.split("=");
    priceString = equalsSplit[equalsSplit.length-1];
  }

  if (priceString.includes(",")){
    const commaSplit = priceString.split(",");
    if (commaSplit[commaSplit.length-1].length === 2 && commaSplit[commaSplit.length-1].replace(/\D/g, "").length === 2){
      priceString = commaSplit.slice(0, -1).join("");
    }
  }

  if (priceString.includes(".")){
    const periodSplit = priceString.split(".");
    if (periodSplit[periodSplit.length-1].length === 2 && periodSplit[periodSplit.length-1].replace(/\D/g, "").length === 2){
      priceString = periodSplit.slice(0, -1).join("");
    }
  }

  const numericalPrice = Number(priceString.replace(/\D/g, ""));

  if (numericalPrice < 500 || numericalPrice > 100000){
    return
  }

  return numericalPrice;

}

function producePriceList(arenden, typ, status, ursprung){
  const relevantArenden = arenden.filter((arende) => 
    (typ.includes(arende.arendeTyp) || !typ.length) 
    && (status.includes(arende.status) || !status.length) 
    && (ursprung.includes(arende.ursprung) || !ursprung.length) 
    && arende.status !== "LEGACY" && arende.status !== "raderad")

  const priceList = relevantArenden.map((arende) => interpretPrice(arende.pris))

  const cleanPriceList = priceList.filter((price) => price !== undefined)

  return cleanPriceList
}

function produceTimeSpanList(arenden, kyrkogard, traces, arr){

  const relevantArenden = arenden.filter((arende) => (arende.kyrkogard === kyrkogard || !kyrkogard
    && arende.status !== "LEGACY" && arende.status !== "raderad"))

  if (relevantArenden.length === 0){
    return []
  }

  const timeSpanList = relevantArenden.map((arende) =>{

    const arendeTraces = traces.filter((t) => t.arendeID === arende.id)

    if (!arendeTraces || arendeTraces.length === 0){
      return "reallyspecificvalue"
    }
    const creationTime = arendeTraces.find((trace) => trace.body.includes("skapat"))?.time;
    const closingTime = arendeTraces.find((trace) => arr === "timeToFinish" ? trace.body.includes("Stängt") : trace.body.includes("kyrkogård"))?.time;
    const start = parseDate(creationTime)
    const end = parseDate(closingTime)

    if (!start || !end) return null;

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      console.log(start, end)
      return null;
    }
    const result = (end - start) / (1000 * 60 * 60 * 24); //Express in days
    return result;
    }
    )
  const result = timeSpanList.filter(
  (t) =>
    t !== undefined &&
    t !== null &&
    t !== "reallyspecificvalue" &&
    !Number.isNaN(t)
);

  return result

}

function findPriceDescriptiveStatistics(arr) {

  console.log(arr)

  if (!arr){
    return <p>Ingen variabel vald</p>
  }

  return <div>
      <p><strong>Mean: </strong>{average(arr)}</p>
      <p><strong>SD: </strong>{stdev(arr)}</p>
      <p><strong>n: </strong>{arr.length}</p>
    </div>

}

function ButtonPanel({category, setCommand, command, fields}){
  return <div>
    <h3>{category}</h3>
    <p>{command.join(", ")}</p>
    <div>
      {fields.map((field) => <button 
  key={field}
  onClick={() => {
    if (command.includes(field)) {
      setCommand(command.filter(c => c !== field)); 
    } else {
      setCommand([...command, field]);
    }
  }}
>
  {field}
</button>)}
    </div>
  </div>
}

export default function EventLogTimeline(){

    const [arenden, setArenden] = useState([])
    const [traces, setTraces] = useState([])
    const [kyrkogardar, setKyrkogardar] = useState([])
    const [status, setStatus] = useState([])
    const [typ, setTyp] = useState([])
    const [ursprung, setUrsprung] = useState([])
    const [arr, setArr] = useState(null)
    const [kyrkogard, setKyrkogard] = useState(null)
    const [kyrkogardCounts, setKyrkogardCounts] = useState([])

    useEffect(() => {
      function loadKyrkogardsCount() {
      const kyrkogardCounts = kyrkogardar.reduce((acc, k) => {
        acc[k.namn] = produceTimeSpanList(arenden, k.namn, traces, arr).length;
        return acc;
      }, {});
      setKyrkogardCounts(kyrkogardCounts);
      }
      loadKyrkogardsCount();
    }, [arr, arenden, traces, kyrkogardar])

    useEffect(() => {
      async function loadArenden() {
        const data = await getArenden(); 
        setArenden(data); 
        }
      loadArenden(); 
      }, []);

    useEffect(() => {
      async function loadKyrkogardar() {
        const data = await getKyrkogardar(); 
        setKyrkogardar(data); 
        }
      loadKyrkogardar(); 
      }, []);

    useEffect(() => {
          async function loadTraces() {
            const data = await getTraces(); 
            setTraces(data); 
          }
          loadTraces(); 
        }, []);
      
    return <div>
        <select onChange = {(e) => setArr(e.target.value)}>
          <option value = "">
            Välj variabel
          </option>
          <option value = "price">
            Pris
          </option>
          <option value = "timeToFinish">
            Tid att avsluta
          </option>
          <option value = "timeToGraveyardApproval">
            Tid till godkännande av kyrkogård
          </option>
        </select>
        {arr === "price" && <div><p>{findPriceDescriptiveStatistics(producePriceList(arenden,typ,status,ursprung))}</p>
          <ButtonPanel category = {"Ärendetyp"} setCommand = {setTyp} command = {typ} fields = {["Ny sten", "Nyinskription", "Stabilisering"]} />
          <ButtonPanel category = {"Status"} setCommand = {setStatus} command = {status} fields = {["Stängt", "Nytt", "Godkänd av kund"]} />
          <ButtonPanel category = {"Ursprung"} setCommand = {setUrsprung} command = {ursprung} fields = {["Eaststone", "Stockholms Gravstenar"]} /></div>}
        {(arr === "timeToFinish" || arr === "timeToGraveyardApproval") && <div>
          <p>{findPriceDescriptiveStatistics(produceTimeSpanList(arenden, kyrkogard, traces, arr))}</p> 
          <select onChange = {(e) => setKyrkogard(e.target.value)}>
            <option value = {""}>Alla kyrkogårdar</option>
            {kyrkogardar.filter((k) => kyrkogardCounts[k?.namn] > 0 && k.namn).sort((a, b) => (a.namn ?? "").localeCompare((b.namn ?? ""))).map((k) => <option value = {k?.namn} >{k?.namn} {kyrkogardCounts[k?.namn]}</option>)}
          </select>
          </div>}
        </div>
}
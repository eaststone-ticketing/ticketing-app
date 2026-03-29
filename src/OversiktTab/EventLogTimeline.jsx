import {getTraces, updateTrace, removeTraces} from '../api.js'
import {useEffect, useState} from 'react'



async function setTracesTime(traces) {



}
export default function EventLogTimeline(){

    const [traces, setTraces] = useState([])

    useEffect(() => {
          async function loadTraces() {
            const data = await getTraces(); 
            setTraces(data); 
          }
          loadTraces(); 
        }, []);
    
    return <div>
        <button onClick = {() => console.log(traces)}>aaa</button>
        </div>
}
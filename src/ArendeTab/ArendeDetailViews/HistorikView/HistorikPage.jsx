import {getTraces} from '../../../api.js'
import {useState, useEffect} from 'react'
import './HistorikPage.css'
    
export default function HistorikPage({arende}) {

    const [traces, setTraces] = useState([]);

    useEffect(() => {
        getTraces().then(setTraces);
    }, []);

    const arendeTraces = traces.filter(t => Number(t.arendeID) === Number(arende.id));

    return <div className = "trace-container"> 
        <h3>Historik</h3>
        {arendeTraces.map( t => <div>
            {t.body}
            </div>)}
    </div>
}
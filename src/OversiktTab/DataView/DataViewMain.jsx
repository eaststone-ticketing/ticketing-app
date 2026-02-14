import { getArenden } from "../../api";
import { useState, useEffect, useRef } from 'react'
import Plotly from "plotly.js-dist-min";

export function DataViewMain() {

    const [arendenData, setArendenData] = useState([])
    const [chartMode, setChartMode] = useState(false)
    const chartRef = useRef(null);

    useEffect(() => {
      async function loadArenden() {
        const data = await getArenden(); 
        setArendenData(data); 
      }
      loadArenden(); 
      }, []);

    const validAgeArenden = arendenData.filter(a =>
        /^[12]\d{3}/.test(a.dodsDatum) &&
        /^[12]\d{3}/.test(a.fodelseDatum)   
        );

    
    const ages = validAgeArenden.map((arende) => Number(arende.dodsDatum.slice(0,4)) - Number(arende.fodelseDatum.slice(0,4)))
    const validAges = ages.filter((a) => a > 0 && a < 110)

    const chart = chartMode ? [{x: validAges, type: "histogram"}] : [{y: validAges, type: "box"}]
    const title = chartMode ? {title: "Age distribution", xaxis: {title: "Age"}, yaxis: {title: "Count"}} : {}
    
    useEffect(() => {
        if (!chartRef.current) return;
        if (validAges.length === 0) return;

        Plotly.react(
        chartRef.current,
        chart,
        title
        );
    }, [ages]);

        
    const mean = validAges.reduce((sum, value) => sum + value, 0) / validAges.length;

    const variance = validAges.reduce((sum, value) => {
    return sum + Math.pow(value - mean, 2);
    }, 0) / validAges.length;

    const standardDeviation = Math.sqrt(variance);

    return <div><div ref={chartRef} style={{ width: "100%", height: "500px" }}> </div>
                <p>Mean: {mean} Standard deviation: {standardDeviation}</p>
                <p>n: {validAges.length}</p>
                <button onClick = {() => setChartMode(!chartMode)}>{chartMode ? "Visa boxplot" : "Visa histogram"}</button>
            </div>; 
}
import { useEffect, useState } from 'react'
import { getStenObjekt } from '../../../api.js'
import StenCard from '../../../StenarTab/StenCard.jsx'
import './StenView.css'

export default function StenView({ activeArende }) {
  const [stenar, setStenar] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getStenObjekt()
        setStenar(data)
      } catch (err) {
        console.error('Failed to load stenObjekt:', err)
      }
    }
    load()
  }, [activeArende?.id])

  const linked = stenar.filter(
    (s) => Number(s.attr?.arendeID) === Number(activeArende.id)
  )

  return (
    <div className="sten-info-container">
      <h4>Stenar</h4>
      {linked.length === 0 ? (
        <p className="sten-view-empty">Inga stenar kopplade till detta ärende.</p>
      ) : (
        <div className="sten-view-list">
          {linked.map((sten) => (
            <StenCard
              key={sten.id}
              sten={sten}
              arenden={[activeArende]}
              setStenar={setStenar}
            />
          ))}
        </div>
      )}
    </div>
  )
}

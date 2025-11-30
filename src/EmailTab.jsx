//import SearchArenden from './ArendeTab/SearchArenden.jsx'
import { useState } from 'react'
import NewArendeForm from './ArendeTab/NewArendeForm/NewArendeForm.jsx'


export default function EmailTab({arenden, setArenden, kyrkogardar, kunder, setKunder}) {
    const emails = [
    {
      id: 1,
      sender: 'Anna Svensson',
      subject: 'Möte på torsdag',
      preview: 'Hej! Kan vi flytta mötet till kl 14 istället?',
      date: '2025-10-12',
    },
    {
      id: 2,
      sender: 'Jonas Eriksson',
      subject: 'Faktura #12345',
      preview: 'Här kommer fakturan för oktober...',
      date: '2025-10-11',
    },
    {
      id: 3,
      sender: 'Maria Lind',
      subject: 'Tack för senast!',
      preview: 'Det var trevligt att ses på eventet.',
      date: '2025-10-10',
    },
  ]

const [activeEmail, setActiveEmail] = useState(null)
const [selectedForm, setSelectedForm] = useState('')

return (
  <div className="email-feed">

    {activeEmail === null && (
    <div className = "email-list">
    {emails.map((email) => (
      
      <div key={email.id} className={`email-item ${activeEmail === email.id ? 'active' : ''}`} 
      onClick={() => setActiveEmail(activeEmail === email.id ? null : email.id)}>
        
        <div
          className="email-header">
          <strong>{email.sender}</strong>
          <span className="email-date">{email.date}</span>
          <span className="email-subject">{email.subject}</span>
        </div>
      </div>
    ))}
  </div>
    )}

    {activeEmail !== null && (
      <div className = "email-detail">
        {(() => {
          const email = emails.find((e) => e.id === activeEmail)
          const renderForm = () => {
            switch (selectedForm) {
              case 'newStone':
                return <NewStoneForm arenden = {arenden} setArenden = {setArenden} kyrkogardar = {kyrkogardar} kunder = {kunder} setKunder = {setKunder}/>
              default:
                return null
              
            }
          }
          return (
            <div className="email-content">
              <div>
              <div className = "subject-and-create-new-form">
                <h2>{email.subject}</h2>
                <div>
                <button onClick = {() => setSelectedForm("searchArenden")}>Bifoga i ärende</button>
                <button onClick = {() => setSelectedForm("newStone")}>Skapa ärende</button>
                </div>
              </div>

              <p><strong>From:</strong> {email.sender}</p>
              <p><strong>Date:</strong> {email.date}</p>
              <hr />
              <p>{email.preview}</p>
              </div>
              <div className="form-container">{renderForm()}</div>
            </div>
          )
        })()}
        <button onClick = {() => {setActiveEmail(null) 
                                  setSelectedForm('')}}>Back</button>
      </div>
    )}
    </div>
)
}


import {addGodkannande, removeGodkannande, getGodkannanden, getArenden, updateArende} from './api.js'
import laggTillTrace from './laggTillTrace.jsx'

export default async function handleStatusChange(approver, arende, setArenden, setActiveGodkannanden = null, setActiveArende = null) {

  

  async function addDefaultGodkannande(id, godkannare) {
      const arenden = await getArenden()
      const godkannandeData = {arendeID: Number(id), godkannare: godkannare, datum: new Date().toISOString().split('T')[0], kalla: "Email"}
      await addGodkannande(godkannandeData)
      await laggTillTrace(`lade till godkännande av ${godkannare}`, arenden.find(a => a.id === id))
    }

  async function findAndRemoveGodkannande(id, godkannare) {
    const arenden = await getArenden()
    const godkannanden = await getGodkannanden();
    const toRemove = godkannanden.find(g => g.arendeID === id && g.godkannare === godkannare)

    if (toRemove){
        await removeGodkannande(toRemove.id)
        await laggTillTrace(`tog bort godkännande av ${godkannare}`, arenden.find(a => a.id === id))
    }
    
    else {
        console.warn(`No matching godkännande found for ${godkannare} on ärende ${id}`);
    }
    }

  let newStatus = arende.status;

  if (approver === "kund") {
    if (arende.status === "Nytt") {
      newStatus = "Godkänd av kund";
      await addDefaultGodkannande(arende.id, "kund");

    } else if (arende.status === "Godkänd av kund") {
      newStatus = "Nytt";
      await findAndRemoveGodkannande(arende.id, "kund");

    } else if (arende.status === "Godkänd av kyrkogård") {
      newStatus = "Redo";
      await addDefaultGodkannande(arende.id, "kund");

    } else if (arende.status === "Redo") {
      newStatus = "Godkänd av kyrkogård";
      await findAndRemoveGodkannande(arende.id, "kund");

    } else if ( arende.status ==="Godkänd av kyrkogård, väntar svar av kund"){
      newStatus = "Redo";
      await addDefaultGodkannande(arende.id, "kund")
    } else if (arende.status ==="Godkänd av kund, väntar svar av kyrkogård"){
      newStatus = "Väntar svar av kyrkogård";
      await findAndRemoveGodkannande(arende.id, "kund")
    } else if (arende.status ==="Väntar svar av kund och kyrkogård"){
      newStatus = "Godkänd av kund, väntar svar av kyrkogård"
      await addDefaultGodkannande(arende.id, "kund")
    }  else if (arende.status === "Väntar svar av kyrkogård") {
      newStatus = "Godkänd av kund, väntar svar av kyrkogård"
      await addDefaultGodkannande(arende.id, "kund")
    } else if (arende.status === "Väntar svar av kund") {
      newStatus = "Godkänd av kund"
      await addDefaultGodkannande(arende.id, "kund")
    }
  }

  if (approver === "kyrkogård") {
    if (arende.status === "Nytt") {
      newStatus = "Godkänd av kyrkogård";
      await addDefaultGodkannande(arende.id, "kyrkogård");
    } else if (arende.status === "Godkänd av kyrkogård") {
      newStatus = "Nytt";
      await findAndRemoveGodkannande(arende.id, "kyrkogård");
    } else if (arende.status === "Godkänd av kund") {
      newStatus = "Redo";
      await addDefaultGodkannande(arende.id, "kyrkogård");
    } else if (arende.status === "Redo") {
      newStatus = "Godkänd av kund";
      await findAndRemoveGodkannande(arende.id, "kyrkogård");
    } else if (arende.status ==="Godkänd av kund, väntar svar av kyrkogård"){
      newStatus = "Redo";
      await addDefaultGodkannande(arende.id, "kyrkogård")
    } else if (arende.status ==="Godkänd av kyrkogård, väntar svar av kund"){
      newStatus = "Väntar svar av kund";
      await findAndRemoveGodkannande(arende.id, "kyrkogård")
    } else if (arende.status ==="Väntar svar av kund och kyrkogård"){
      newStatus = "Godkänd av kyrkogård, väntar svar av kund"
      await addDefaultGodkannande(arende.id, "kyrkogård")
    } else if (arende.status === "Väntar svar av kyrkogård") {
      newStatus = "Godkänd av kyrkogård"
      await addDefaultGodkannande(arende.id, "kyrkogård")
    } else if (arende.status === "Väntar svar av kund") {
      newStatus = "Godkänd av kyrkogård, väntar svar av kund"
      await addDefaultGodkannande(arende.id, "kyrkogård")
    }
  }

  setArenden(prev =>
    prev.map(a =>
      a.id === arende.id ? { ...a, status: newStatus } : a
    )
  );
  
  //If setActiveArende is not null, that means we are in the detail view. 
  if (setActiveArende){
  setActiveArende(prev => ({ ...prev, status: newStatus }));}

  await updateArende(arende.id, { status: newStatus });

  getArenden().then(data => setArenden(data));

  if (setActiveGodkannanden){
  // Refresh godkannanden for display
  getGodkannanden().then(updatedGodk => setActiveGodkannanden(updatedGodk.filter(g => g.arendeID === arende.id)))
  }
}
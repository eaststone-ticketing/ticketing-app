import { addKommentarer } from '../api.js';

function appendNameAndDate(innehall){
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch {
      user = null;
    }
    const time = new Date();
    const timestamp = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}, ${time.getHours()}:${time.getMinutes() > 9 ? time.getMinutes(): `0${time.getMinutes()}`}`
    if (user?.userName) {
      const name = user.userName.charAt(0).toUpperCase() + user.userName.slice(1);
      return innehall + `\n\n${name}\n${timestamp}`;
    }
    return innehall + `\n\n${timestamp}`;
  }


export default async function addFinishComment(jobbForm, arende, typ) {
    if (!(jobbForm.problem || jobbForm.utforare || jobbForm.anteckningar)) {
      return;
    }

    const innehall = `${typ ? `${typ}\n\n` : ""}${jobbForm.utforare ? `Utfört av: ${jobbForm.utforare}\n\n` : ""}${jobbForm.problem ? `Problem: ${jobbForm.problem}\n\n` : ""}${jobbForm.anteckningar ? `Anteckningar: ${jobbForm.anteckningar}` : ""}`;

    const newInnehall = appendNameAndDate(innehall);
    const kommentar = {
      arendeID: Number(arende.id),
      innehall: newInnehall,
      tagged_users: JSON.stringify([]),
      seen: 0,
    };
    await addKommentarer(kommentar);
}

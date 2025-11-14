import express from 'express';
import sqlite3 from "sqlite3";
import { open } from 'sqlite';
import cors from 'cors';
import authRouter from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json());


const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database
});

app.use("/auth", authRouter(db));

await db.exec(`
  CREATE TABLE IF NOT EXISTS kyrkogardar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    namn TEXT,
    kontaktperson TEXT,
    email TEXT,
    telefonnummer TEXT,
    address TEXT,
    ort TEXT,
    postnummer INTEGER
  );
`);

await db.exec( `
  CREATE TABLE IF NOT EXISTS arenden (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    datum TEXT,
    arendeTyp TEXT,
    avlidenNamn TEXT,
    fodelseDatum TEXT,
    dodsDatum TEXT,
    fakturaTillDodsbo INTEGER,
    bestallare TEXT,
    adress TEXT,
    ort TEXT,
    postnummer TEXT,
    tel TEXT,
    email TEXT,
    kyrkogard TEXT,
    kvarter TEXT,
    gravnummer TEXT,
    modell TEXT,
    material TEXT,
    symboler TEXT,
    beteckning TEXT,
    framsida TEXT,
    kanter TEXT,
    sockelBearbetning TEXT,
    typsnitt TEXT,
    forsankt TEXT,
    farg TEXT,
    dekor TEXT,
    platsForFlerNamn TEXT,
    minnesord TEXT,
    pris TEXT,
    tillbehor TEXT,
    sockel INTEGER,
    staende INTEGER,
    GRO INTEGER,
    status TEXT
  );
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS kunder (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bestallare TEXT,
    email TEXT,
    telefonnummer TEXT,
    address TEXT
  );
`)

await db.exec(`
  CREATE TABLE IF NOT EXISTS godkannanden (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    arendeID INTEGER,
    godkannare TEXT,
    datum TEXT,
    kalla TEXT
  );
`)

await db.exec(`
  CREATE TABLE IF NOT EXISTS kommentarer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    arendeID INTEGER,
    innehall TEXT,
    tagged_users TEXT
  );
`)

await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT
  );
`);





app.post("/kyrkogardar", async (req, res) => {
    const { namn, kontaktperson, email, telefonnummer, address, ort, postnummer } = req.body;

    const result = await db.run(`
        INSERT INTO kyrkogardar (namn, kontaktperson, email, telefonnummer, address, ort, postnummer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [namn, kontaktperson, email, telefonnummer, address, ort, postnummer]);

    const newKyrkogard = {
        id: result.lastID,
        namn,
        kontaktperson,
        email,
        telefonnummer,
        address,
        ort,
        postnummer
    };

    res.json(newKyrkogard);
});


app.post("/arenden", async (req, res) => {
    const {datum, arendeTyp, avlidenNamn, fodelseDatum, dodsDatum, fakturaTillDodsbo, bestallare, adress, ort, postnummer, tel, email, kyrkogard, kvarter, gravnummer, modell, material, symboler, beteckning, framsida, kanter, sockelBearbetning, typsnitt, forsankt, farg, dekor, platsForFlerNamn, minnesord, pris, tillbehor, sockel, staende, GRO, status}  = req.body;
    const result = await db.run (`
        INSERT INTO arenden (datum, arendeTyp, avlidenNamn, fodelseDatum, dodsDatum, fakturaTillDodsbo, bestallare, adress, ort, postnummer, tel, email, kyrkogard, kvarter, gravnummer, modell, material, symboler, beteckning, framsida, kanter, sockelBearbetning, typsnitt, forsankt, farg, dekor, platsForFlerNamn, minnesord, pris, tillbehor, sockel, staende, GRO, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [datum, arendeTyp, avlidenNamn, fodelseDatum, dodsDatum, fakturaTillDodsbo, bestallare, adress, ort, postnummer, tel, email, kyrkogard, kvarter, gravnummer, modell, material, symboler, beteckning, framsida, kanter, sockelBearbetning, typsnitt, forsankt, farg, dekor, platsForFlerNamn, minnesord, pris, tillbehor, sockel, staende, GRO, status]);
    
    const newArende = {
        id: result.lastID,
        datum,
        arendeTyp,
        avlidenNamn,
        fodelseDatum,
        dodsDatum,
        fakturaTillDodsbo, 
        bestallare, 
        adress, 
        ort, 
        postnummer, 
        tel, 
        email, 
        kyrkogard, 
        kvarter, 
        gravnummer, 
        modell, 
        material, 
        symboler, 
        beteckning, 
        framsida, 
        kanter, 
        sockelBearbetning, 
        typsnitt, 
        forsankt,
        farg, 
        dekor, 
        platsForFlerNamn, 
        minnesord, 
        pris,
        tillbehor,
        sockel,
        staende,
        GRO,
        status
    };

    res.json(newArende);
})

app.post("/kunder", async (req, res) => {
    const {bestallare, email, telefonnummer, address} = req.body;
    const result = await db.run (`
        INSERT INTO kunder (bestallare, email, telefonnummer, address)
        VALUES (?, ?, ?, ?)
    `,[bestallare, email, telefonnummer, address]);

    const newKund = {
        id: result.lastID,
        bestallare,
        email,
        telefonnummer,
        address
    };

    res.json(newKund);
})

app.post("/godkannanden", async(req,res) => {
    const {arendeID, godkannare, datum, kalla} = req.body;
    const result = await db.run(`
        INSERT INTO godkannanden (arendeID, godkannare, datum, kalla)
        VALUES(?,?,?,?)
        `,[arendeID, godkannare, datum, kalla]);
    const newGodkannande = {
        id: result.lastID,
        arendeID,
        godkannare,
        datum,
        kalla
    };

    res.json(newGodkannande)
    })

app.post("/kommentarer", async(req,res) => {
  const {arendeID, innehall, tagged_users} = req.body;
  const result = await db.run(`
    INSERT INTO kommentarer(arendeID, innehall, tagged_users)
    VALUES(?,?,?)
    `,[arendeID, innehall, tagged_users])
  const newKommentar = {
    id: result.lastID,
    arendeID,
    innehall,
    tagged_users
  };

  res.json(newKommentar)
})

app.get("/kyrkogardar", async (req, res) => {
    const kyrkogardar = await db.all("SELECT * FROM kyrkogardar");
    res.json(kyrkogardar);
})

app.get("/arenden", async (req, res) => {
    const arenden = await db.all("SELECT * FROM arenden")
    res.json(arenden);
})

app.get("/kunder", async (req, res) => {
    const kunder = await db.all("SELECT * FROM kunder")
    res.json(kunder);
})

app.get("/godkannanden", async (req, res) => {
    const godkannanden = await db.all("SELECT * FROM godkannanden")
    res.json(godkannanden);
})

app.get("/kommentarer", async(req, res) => {
  const kommentarer = await db.all("SELECT * FROM kommentarer")
  res.json(kommentarer);
})

app.get("/users", async (req, res) => {
    const users = await db.all("SELECT * FROM users");
    res.json(users);
});


app.delete("/kyrkogardar/:id", async (req, res) => {
    const {id} = req.params;

    await db.run("DELETE FROM kyrkogardar WHERE id = ?", id);

    res.json({ message: `Kyrkogard with ID ${id} deleted` });
});

app.delete("/arenden/:id", async (req, res) => {
    const {id} = req.params;

    await db.run("DELETE FROM arenden WHERE id = ?", id);

    res.json({message: `Ärende with ID ${id} deleted`})
})

app.delete("/kunder/:id", async (req, res) => {
    const {id} = req.params;

    await db.run ("DELETE FROM kunder WHERE id = ?", id);
    
    res.json({message: `Kund with ID ${id} deleted`})
})

app.delete("/godkannanden/:id", async(req, res) => {
    const {id} = req.params;

    await db.run ("DELETE FROM godkannanden WHERE id = ?", id);

    res.json({message: `Godkannande with ID ${id} deleted` })
})

app.delete("/kommentarer/:id", async(req, res) => {
  const {id} = req.params;

  await db.run ("DELETE FROM kommentarer WHERE id = ?", id);

  res.json({message: `Kommentar with ID ${id} deleted`  })
})

app.put("/kyrkogardar/:id", async (req, res) => {
  const { id } = req.params;
  const { namn, kontaktperson, email, telefonnummer, address, ort, postnummer } = req.body;

  try {
    await db.run(
      `UPDATE kyrkogardar 
       SET namn = ?, kontaktperson = ?, email = ?, telefonnummer = ?, address = ?, ort = ?, postnummer = ?
       WHERE id = ?`,
      [namn, kontaktperson, email, telefonnummer, address, ort, postnummer, id]
    );

    res.json({ message: `Kyrkogård with ID ${id} updated successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update kyrkogård" });
  }
});

app.put("/arenden/:id", async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  try {
    // Build a dynamic update query based on what fields are provided
    const columns = Object.keys(fields)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = Object.values(fields);
    values.push(id);

    await db.run(`UPDATE arenden SET ${columns} WHERE id = ?`, values);

    res.json({ message: `Ärende with ID ${id} updated successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update ärende" });
  }
});

app.put("/kunder/:id", async (req, res) => {
  const { id } = req.params;
  const { bestallare, email, telefonnummer, address } = req.body;

  try {
    await db.run(
      `UPDATE kunder 
       SET bestallare = ?, email = ?, telefonnummer = ?, address = ?
       WHERE id = ?`,
      [bestallare, email, telefonnummer, address, id]
    );

    res.json({ message: `Kund with ID ${id} updated successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update kund" });
  }
});

app.put("/godkannanden/:id", async (req, res) => {
    const {id} = req.params;
    const {arendeID, godkannare, datum, kalla} = req.body;

    console.log(req.body)

    try {
        await db.run(
            `UPDATE godkannanden
            SET arendeID = ?, godkannare = ?, datum = ?, kalla = ?
            WHERE id = ?`,
            [arendeID, godkannare, datum, kalla, id]
        );
        res.json({message: `Godkännande with ID ${id} updated successfully`});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to update godkännande"})
    }
});

app.put("/kommentarer/:id", async (req, res) => {
  const {id} = req.params;
  const{arendeID, innehall, tagged_users} = req.body;

  try {
    await db.run(
      `UPDATE kommentarer
      SET arendeID = ?, innehall = ?, tagged_users = ?
      WHERE id = ?`,
      [arendeID, innehall, tagged_users]
    );
    res.json({message: `Godkännande with ID ${id} updated successfully`})
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Failed to update kommentarer"})
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
import express from 'express';
import sqlite3 from "sqlite3";
import { open } from 'sqlite';
import cors from 'cors';
import authRouter from "./auth.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import 'dotenv/config'; 
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from 'cookie-parser';

const API_URL = process.env.API_URL || "http://localhost:3000";

const app = express();
app.use(cors({
  origin: [`${API_URL}`, "http://localhost:3000", "http://localhost:5173"],
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

function authenticateToken(req, res, next) {
    let token = null;
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer <token>"

    // 2. OR check query token in URLs like /arendepdf/1?token=abc
    if (!token && req.query.token) token = req.query.token;


    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET || "supersecret", (err, user) => {
        if (err){
            return res.sendStatus(403); // Forbidden
          }
        req.user = user; // attach decoded user info to request
        next();
    });
}

const db = await open({
    filename: "/data/database.db",
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
    postnummer INTEGER,
    kyrkogard_grupp TEXT,
    regler TEXT
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
    status TEXT,
    gravrattsinnehavare
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
    tagged_users TEXT,
    seen INTEGER
  );
`)

await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT
  );
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS leveranser (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    namn TEXT,
    leverantor TEXT,
    innehall TEXT,
    arenden TEXT,
    status TEXT
  );
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS komponenter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    arendeID INTEGER,
    leveransID INTEGER,
    body TEXT
    )
  `
)

await db.exec(`
  CREATE TABLE IF NOT EXISTS traces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  arendeID INTEGER,
  body TEXT
  )
  `)

await db.exec(`
  CREATE TABLE IF NOT EXISTS stenar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  namn TEXT,
  info TEXT
  );
  ` 
);
app.post("/kyrkogardar", authenticateToken,  async (req, res) => {
    const { namn, kontaktperson, email, telefonnummer, address, ort, postnummer, kyrkogard_grupp, regler } = req.body;

    const result = await db.run(`
        INSERT INTO kyrkogardar (namn, kontaktperson, email, telefonnummer, address, ort, postnummer, kyrkogard_grupp, regler)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [namn, kontaktperson, email, telefonnummer, address, ort, postnummer, kyrkogard_grupp, JSON.stringify(regler)]);

    const newKyrkogard = {
        id: result.lastID,
        namn,
        kontaktperson,
        email,
        telefonnummer,
        address,
        ort,
        postnummer,
        kyrkogard_grupp,
        regler
    };

    res.json(newKyrkogard);
});


app.post("/arenden", authenticateToken, async (req, res) => {
    const {datum, arendeTyp, avlidenNamn, fodelseDatum, dodsDatum, fakturaTillDodsbo, bestallare, adress, ort, postnummer, tel, email, kyrkogard, kvarter, gravnummer, modell, material, symboler, beteckning, framsida, kanter, sockelBearbetning, typsnitt, forsankt, farg, dekor, platsForFlerNamn, minnesord, pris, tillbehor, sockel, staende, GRO, status, gravrattsinnehavare}  = req.body;
    const result = await db.run (`
        INSERT INTO arenden (datum, arendeTyp, avlidenNamn, fodelseDatum, dodsDatum, fakturaTillDodsbo, bestallare, adress, ort, postnummer, tel, email, kyrkogard, kvarter, gravnummer, modell, material, symboler, beteckning, framsida, kanter, sockelBearbetning, typsnitt, forsankt, farg, dekor, platsForFlerNamn, minnesord, pris, tillbehor, sockel, staende, GRO, status, gravrattsinnehavare)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [datum, arendeTyp, avlidenNamn, fodelseDatum, dodsDatum, fakturaTillDodsbo, bestallare, adress, ort, postnummer, tel, email, kyrkogard, kvarter, gravnummer, modell, material, symboler, beteckning, framsida, kanter, sockelBearbetning, typsnitt, forsankt, farg, dekor, platsForFlerNamn, minnesord, pris, tillbehor, sockel, staende, GRO, status, gravrattsinnehavare]);
    
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
        status,
        gravrattsinnehavare
    };

    res.json(newArende);
})

app.post("/kunder", authenticateToken, async (req, res) => {
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

app.post("/godkannanden", authenticateToken, async(req,res) => {
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

app.post("/kommentarer", authenticateToken, async(req,res) => {
  const {arendeID, innehall, tagged_users, seen} = req.body;
  const result = await db.run(`
    INSERT INTO kommentarer(arendeID, innehall, tagged_users, seen)
    VALUES(?,?,?,?)
    `,[arendeID, innehall, tagged_users, seen])
  const newKommentar = {
    id: result.lastID,
    arendeID,
    innehall,
    tagged_users,
    seen
  };

  res.json(newKommentar)
})

app.post("/leveranser", authenticateToken, async(req,res) => {
  const {namn, leverantor, innehall, arenden, status} = req.body;
  const result = await db.run(`
    INSERT INTO leveranser(namn, leverantor, innehall, arenden, status)
    VALUES(?,?,?,?,?)
    `,[namn, leverantor, JSON.stringify(innehall), JSON.stringify(arenden), status])
  const newLeverans = {
    id: result.lastID,
    namn, 
    leverantor, 
    innehall, 
    arenden, 
    status
  };

  res.json(newLeverans)
})

app.post("/komponenter", authenticateToken, async(req, res) => {
  const {arendeID, leveransID, body} = req.body;
  const result = await db.run(`
    INSERT INTO komponenter(arendeID, leveransID, body)
    VALUES(?,?,?)
    `, [arendeID, leveransID, JSON.stringify(body)])
    const newKomponent = {
      id: result.lastID,
      arendeID,
      leveransID,
      body
    };
    
    res.json(newKomponent)
})

app.post("/traces", authenticateToken, async(req, res) => {
const {arendeID, body} = req.body;
const result = await db.run(`
  INSERT INTO traces(arendeID, body)
  VALUES(?,?)
  `, [arendeID, body])
  const newTrace = {
    id: result.lastID,
    arendeID,
    body
  };

  res.json(newTrace)
})

app.post("/stenar", authenticateToken, async(req, res) => {
  const {namn, info} = req.body;
  const result = await db.run (`
    INSERT INTO stenar(namn, info)
    VALUES(?,?)`
  , [namn, info])
  const newSten = {
    id: result.lastID,
    namn,
    info
  };

  res.json(newSten)
})

app.get("/kyrkogardar", authenticateToken, async (req, res) => {
    const rows =  await db.all("SELECT * FROM kyrkogardar");

    const kyrkogardar = rows.map(row => ({
      ...row,
      regler: JSON.parse(row.regler || "[]")
    }))
    res.json(kyrkogardar);
})
app.get("/arenden", authenticateToken, async (req, res) => {
    const arenden = await db.all("SELECT * FROM arenden")
    res.json(arenden);
})

app.get("/kunder", authenticateToken, async (req, res) => {
    const kunder = await db.all("SELECT * FROM kunder")
    res.json(kunder);
})

app.get("/godkannanden", authenticateToken, async (req, res) => {
    const godkannanden = await db.all("SELECT * FROM godkannanden")
    res.json(godkannanden);
})

app.get("/kommentarer", authenticateToken, async(req, res) => {
  const kommentarer = await db.all("SELECT * FROM kommentarer")
  res.json(kommentarer);
})

app.get("/users", authenticateToken, async (req, res) => {
    const users = await db.all("SELECT * FROM users");
    res.json(users);
});

app.get("/leveranser", authenticateToken, async (req, res) => {
  const rows = await db.all("SELECT * FROM leveranser");

  const leveranser = rows.map(row => ({
    ...row,
    innehall: JSON.parse(row.innehall || "[]"),
    arenden: JSON.parse(row.arenden || "[]")
  }));

  res.json(leveranser);
});

app.get("/komponenter", authenticateToken, async (req, res) => {
  const rows = await db.all("SELECT * FROM komponenter")

  const komponenter = rows.map(row => ({
    ...row,
    body: JSON.parse(row.body || "{}")
  }));

  res.json(komponenter)
})

app.get("/traces", authenticateToken, async (req, res) => {
    const traces = await db.all("SELECT * FROM traces");
    res.json(traces);
});

app.get("/stenar", authenticateToken, async (req, res) => {
  const stenar = await db.all("SELECT * FROM stenar")
  res.json(stenar);
})


app.delete("/kyrkogardar/:id", authenticateToken, async (req, res) => {
    const {id} = req.params;

    await db.run("DELETE FROM kyrkogardar WHERE id = ?", id);

    res.json({ message: `Kyrkogard with ID ${id} deleted` });
});

app.delete("/arenden/:id", authenticateToken, async (req, res) => {
    const {id} = req.params;

    await db.run("DELETE FROM arenden WHERE id = ?", id);

    res.json({message: `Ärende with ID ${id} deleted`})
})

app.delete("/kunder/:id", authenticateToken, async (req, res) => {
    const {id} = req.params;

    await db.run ("DELETE FROM kunder WHERE id = ?", id);
    
    res.json({message: `Kund with ID ${id} deleted`})
})

app.delete("/godkannanden/:id", authenticateToken, async(req, res) => {
    const {id} = req.params;

    await db.run ("DELETE FROM godkannanden WHERE id = ?", id);

    res.json({message: `Godkannande with ID ${id} deleted` })
})

app.delete("/kommentarer/:id", authenticateToken, async(req, res) => {
  const {id} = req.params;

  await db.run ("DELETE FROM kommentarer WHERE id = ?", id);

  res.json({message: `Kommentar with ID ${id} deleted`  })
})

app.delete("/leveranser/:id", authenticateToken, async(req, res) => {
  const {id} = req.params;

  await db.run ("DELETE FROM leveranser WHERE id = ?", id);

  res.json({message: `Leverans with ID ${id} deleted`  })
})

app.delete("/komponenter/:id", authenticateToken, async(req, res) => {
  const {id} = req.params;

  await db.run ("DELETE FROM komponenter WHERE id = ?", id);

  res.json({message: `Leverans with ID ${id} deleted`})
})

app.delete("/traces/:id", authenticateToken, async(req, res) => {
  const {id} = req.params;

  await db.run ("DELETE FROM traces WHERE id = ?", id);

  res.json({message: `Leverans with ID ${id} deleted`})
})


app.delete("/stenar/:id", authenticateToken, async(req, res) => {
  const {id} = req.params;

  await db.run ("DELETE FROM stenar WHERE id = ?", id);

  res.json({message: `Sten with ID ${id} deleted`})
})

app.put("/kyrkogardar/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { namn, kontaktperson, email, telefonnummer, address, ort, postnummer, kyrkogard_grupp, regler } = req.body;

  try {
    await db.run(
      `UPDATE kyrkogardar 
       SET namn = ?, kontaktperson = ?, email = ?, telefonnummer = ?, address = ?, ort = ?, postnummer = ?, kyrkogard_grupp = ?, regler = ?
       WHERE id = ?`,
      [namn, kontaktperson, email, telefonnummer, address, ort, postnummer, kyrkogard_grupp, JSON.stringify(regler ?? []), id]
    );

    res.json({ message: `Kyrkogård with ID ${id} updated successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update kyrkogård" });
  }
});


app.put("/arenden/:id", authenticateToken, async (req, res) => {
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

app.put("/kunder/:id", authenticateToken, async (req, res) => {
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

app.put("/godkannanden/:id", authenticateToken, async (req, res) => {
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

app.put("/kommentarer/:id", authenticateToken, async (req, res) => {
  const {id} = req.params;
  const{arendeID, innehall, tagged_users, seen} = req.body;

  try {
    await db.run(
      `UPDATE kommentarer
      SET arendeID = ?, innehall = ?, tagged_users = ?, seen = ?
      WHERE id = ?`,
      [arendeID, innehall, tagged_users, seen, id]
    );
    res.json({message: `Kommentar with ID ${id} updated successfully`})
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Failed to update kommentarer"})
  }
});

app.put("/leveranser/:id", authenticateToken, async (req, res) => {
  const {id} = req.params;
  const{namn, leverantor, innehall, arenden, status} = req.body;

  try {
    await db.run(
      `UPDATE leveranser
      SET namn = ?, leverantor = ?, innehall = ?, arenden = ?, status = ?
      WHERE id = ?`,
      [namn, leverantor, JSON.stringify(innehall), JSON.stringify(arenden), status, id]
    );
    res.json({message: `Leverans with ID ${id} updated successfully`})
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Failed to update leveranser"})
  }
});

app.put("/komponenter/:id", authenticateToken, async (req, res) => {
  const {id} = req.params;
  const {arendeID, leveransID, body} = req.body;

  try {
    await db.run(
      `UPDATE komponenter
      SET arendeID = ?, leveransID = ?, body = ?
      WHERE id = ?`,
      [arendeID, leveransID, JSON.stringify(body), id]
    );
    res.json({message: `Komponent with ID ${id} updated successfully`})
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Failed to update komponenter"})
  }
})

app.put("/traces/:id", authenticateToken, async (req, res) => {
  const {id} = req.params;
  const {arendeID, body} = req.body;

  try {
    await db.run(
      `UPDATE traces
      SET arendeID = ?, body = ?
      WHERE id = ?`,
      [arendeID, body, id]
    );
    res.json({message: `Trace with ID ${id} updated successfully`})
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Failed to update traces"})
  }
})

app.put("/stenar/:id", authenticateToken, async (req, res) => {
  const {id} = req.params;
  const {namn, info} = req.body;

  try {
    await db.run(
      `UPDATE stenar
      SET namn = ?, info = ?
      WHERE id = ?`,
      [namn, info, id]
    );
    res.json({message: `Sten with ID ${id} updated successfully`})
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Failed to update stenar"})
  }
})



app.put("/users/:id", authenticateToken, async (req, res) => {
  const {id} = req.params;
  const{password} = req.body;
  const encrypted = await bcrypt.hash(password, 10);
  try {
    await db.run(
      `UPDATE users
      SET password_hash = ?
      WHERE id = ?`,
      [encrypted, id]
    );
    res.json({message: "Password updated successfully"})
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Failed to update password"})
  }
});

app.get("/arendepdf/:arendeId", authenticateToken, async (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const { arendeId } = req.params;

    // Get arende data from DB
    const arende = await db.get("SELECT * FROM arenden WHERE id = ?", [arendeId]);
    if (!arende) {
      return res.status(404).json({ error: "Ärende not found" });
    }

    let formName

    if (arende.arendeTyp === "Ny sten") {
      formName = "form.pdf"
    } else {
      formName = "form_ovrigt.pdf"
    }

    // Define the template path
    const templatePath = path.join(__dirname, "templates", formName);

    // Log template path
    console.log("Template Path:", templatePath);

    // Check if the file exists
    if (!fs.existsSync(templatePath)) {
      console.error("Template not found at path:", templatePath);
      return res.status(404).json({ error: "Template not found" });
    }

    // Read the PDF file
    let pdfBytes;
    try {
      pdfBytes = fs.readFileSync(templatePath);
      console.log("PDF file read successfully.");
    } catch (err) {
      console.error("Error reading PDF file:", err);
      return res.status(500).json({ error: "Failed to read PDF template" });
    }

    // Load the PDF document
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(pdfBytes);
      console.log("PDF loaded successfully.");
    } catch (err) {
      console.error("Error loading PDF document:", err);
      return res.status(500).json({ error: "Failed to load PDF document" });
    }

    // Get form from the PDF
    const form = pdfDoc.getForm();
    console.log("PDF FIELDS:", form.getFields().map(f => f.getName()));

    if (arende.arendeTyp === "Ny sten"){
    // Fill in the form fields (you can uncomment your form filling logic here)
    form.getTextField("Avlidnes_Namn").setText(arende.avlidenNamn || "");
    form.getTextField("Fodelsedatum").setText(arende.fodelseDatum || "");
    form.getTextField("Dodsdatum").setText(arende.dodsDatum || "");
    form.getTextField("Bestallarens_Namn").setText(arende.bestallare || "");
    form.getTextField("Adress").setText(arende.adress || "");
    form.getTextField("Postadress").setText(arende.ort || "");
    form.getTextField("Post Nr").setText(arende.postnummer || "");
    form.getTextField("Telefon").setText(arende.tel || "");
    form.getTextField("Epost").setText(arende.email || "");
    form.getTextField("Kyrkogard").setText(arende.kyrkogard || "");
    form.getTextField("Kvarter").setText(arende.kvarter || "");
    form.getTextField("Platsnummer").setText(arende.gravnummer || "");
    form.getTextField("Model").setText(arende.modell || "");
    form.getTextField("Typsnitt").setText(arende.typsnitt || "");
    form.getTextField("Farg_Teckensnitt").setText(arende.farg || "");
    form.getTextField("Dekor").setText(arende.dekor || "");
    form.getTextField("Ev_Antal_Platser_For_Ytterligare_Namn").setText(arende.platsForFlerNamn || "");
    form.getTextField("Minnesord").setText(arende.minnesord || "");
    form.getTextField("Totalpris").setText(arende.pris || "");
    form.getTextField("Tillbehor").setText(arende.tillbehor || "");
    form.getTextField("Datum").setText(arende.datum || "");
    form.getTextField("Gravrattsinnehavare").setText(arende.gravrattsinnehavare || ""); 

    // Handle checkboxes
    if (arende.sockel) form.getCheckBox("Check Box16").check();
    if (arende.staende) form.getCheckBox("Check Box18").check();
    if (!arende.staende) form.getCheckBox("Check Box19").check();
    if (arende.GRO) form.getCheckBox("Check Box20").check();
    if (arende.fakturaTillDodsbo) form.getCheckBox("Check Box10").check();
    if (arende.forsankt === "Försänkt") form.getCheckBox("Check Box23").check();
    if (arende.forsankt === "Förhöjd") form.getCheckBox("Check Box24").check();
    }

    else {
      form.getTextField("Avlidnes_Namn").setText(arende.avlidenNamn || "");
      form.getTextField("Fodelsedatum").setText(arende.fodelseDatum || "");
      form.getTextField("Dodsdatum").setText(arende.dodsDatum || "");
      form.getTextField("Bestallarens_Namn").setText(arende.bestallare || "");
      form.getTextField("Adress").setText(arende.adress || "");
      form.getTextField("Postadress").setText(arende.ort || "");
      form.getTextField("Post Nr").setText(arende.postnummer || "");
      form.getTextField("Telefon").setText(arende.tel || "");
      form.getTextField("Epost").setText(arende.email || "");
      form.getTextField("Kyrkogard").setText(arende.kyrkogard || "");
      form.getTextField("Kvarter").setText(arende.kvarter || "");
      form.getTextField("Platsnummer").setText(arende.gravnummer || "");
      form.getTextField("Typsnitt").setText(arende.typsnitt || "");
      form.getTextField("Farg_Teckensnitt").setText(arende.farg || "");
      form.getTextField("Nuvarande text").setText(arende.nuvarandeText || "");
      form.getTextField("Dekor").setText(arende.dekor || "");
      form.getTextField("Tillbehor").setText(arende.tillbehor || "");
      form.getTextField("Totalpris").setText(arende.pris || "");
      form.getTextField("Datum").setText(arende.datum || "");
      form.getTextField("Gravrattsinnehavare").setText(arende.gravrattsinnehavare || ""); 

      //Handle checkboxes
      if (arende.fakturaTillDodsbo) form.getCheckBox("Check Box10").check();
      if (arende.GRO) form.getCheckBox("Check Box20").check();

      if (arende.arendeTyp === "Nyinskription") form.getCheckBox("Check Box18").check();
      if (arende.arendeTyp === "Rengöring") form.getCheckBox("Check Box5").check();
      if (arende.arendeTyp === "Stabilisering") form.getCheckBox("Check Box6").check();
      if (arende.arendeTyp === "Förgyllning") form.getCheckBox("Check Box7").check();

      if (arende.forsankt === "Försänkt") form.getCheckBox("Check Box23").check();
      if (arende.forsankt === "Förhöjd") form.getCheckBox("Check Box24").check();
    }
    // Save the filled PDF
    let filledPdfBytes;
    try {
      filledPdfBytes = await pdfDoc.save();
      console.log("PDF saved successfully.");
    } catch (err) {
      console.error("Error saving PDF:", err);
      return res.status(500).json({ error: "Failed to save filled PDF" });
    }

     // Set response headers for PDF download
    const safeName = arende.avlidenNamn ?? "ärende";
    const asciiFallback = safeName.replace(/[^\x20-\x7E]/g, "_");
    const encoded = encodeURIComponent(`${safeName}.pdf`);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${asciiFallback}.pdf"; filename*=UTF-8''${encoded}`
    );
    
    // Send the PDF as response
    res.send(Buffer.from(filledPdfBytes));

  } catch (err) {
    console.error("General error:", err);
    res.status(500).json({ error: "Could not generate PDF" });
  }
});

app.post("/refresh-token", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const newAccessToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken: newAccessToken });
    });
});

app.get("/alter-table", authenticateToken, async (req,res) => {

  const alterTableSQL = 'ALTER TABLE arenden ADD COLUMN ursprung TEXT';

  db.run(alterTableSQL, (err) => {
      if (err) {
          console.error('Error altering table:', err.message);
          return res.status(500).json({ error: "Failed to alter table" });
      } else {
          console.log('Column ursprung added successfully.');
          res.status(200).json({ message: "Column seen added successfully." });
      }
    });
})


const PORT = process.env.PORT || 5000;
try {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (err) {
    console.error("Server failed to start:", err);
}




// Server-bit, setter opp en Express-app
const express = require("express");
const app = express();

const PORT = 3000;

// Databasen
const Database = require("better-sqlite3");
const db = new Database("fjelltur.db");

// CORS-middleware for å tillate forespørsler fra andre domener
const cors = require("cors");
app.use(cors());

// Eksempel på en rute som henter alle fjell og hoydene deres
app.get("/api/alle_fjell_hoyde", (_req, res) => {
  const rows = db.prepare("SELECT fjellnavn, hoyde FROM fjell").all();
  res.json(rows);
});

// Åpner en viss port på serveren, og starter serveren
app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});

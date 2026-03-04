const express = require('express');
const app = express();

const PORT = 3000;

const Database = require('better-sqlite3');
const db = new Database('fjelltur.db');

app.use(express.static('public'));

const cors = require('cors');
app.use(cors());

app.get('/api/fjell_info', (_, res) => {
    const rows = db.prepare('SELECT fjellnavn, hoyde, beskrivelse, foto FROM fjell').all();
    res.json(rows);
});

app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
});

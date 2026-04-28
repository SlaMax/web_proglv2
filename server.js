const express = require('express');
const path = require('path');
const fs = require('fs'); 
const app = express();
const PORT = process.env.PORT || 3000;

// Postavljanje EJS-a
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Služi statičke datoteke (CSS, JS, slike, index.html) iz 'public' mape
app.use(express.static('public'));

// Ruta za /slike koja koristi EJS (LV2/LV3 kombinacija)
app.get('/slike', (req, res) => {
    // Čitamo images.json (ili images.json ovisno kako si ga nazvao)
    fs.readFile(path.join(__dirname, 'images.json'), 'utf8', (err, data) => {
        if (err) {
            console.error("Greška pri čitanju:", err);
            return res.status(500).send("Greška na serveru");
        }
        const slikeIzJsona = JSON.parse(data);
        // Renderira datoteku views/slike.ejs
        res.render('slike', { podaci: slikeIzJsona });
    });
});

// Glavna ruta poslužuje index.html iz public mape
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`);
});
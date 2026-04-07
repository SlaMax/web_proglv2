const express = require('express');
const path = require('path');
const fs = require('fs'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Ruta za /slike koja čita iz JSON datoteke
app.get('/slike', (req, res) => {
    // Promijeni ovu liniju:
        fs.readFile(path.join(__dirname, 'images.json'), 'utf8', (err, data) => {
        if (err) {
            console.error("Greška pri čitanju datoteke:", err);
            return res.status(500).send("Greška na serveru");
        }
        const slikeIzJsona = JSON.parse(data);
        
        res.render('slike', { podaci: slikeIzJsona });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
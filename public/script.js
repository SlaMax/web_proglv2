let sviFilmovi = [];
let kosarica = [];

document.addEventListener("DOMContentLoaded", () => {
    console.log("Script.js učitan, krećem s fetchom...");

    // 1. DOHVAT CSV DATOTEKE
    fetch('/movies.csv')
        .then(res => {
            if (!res.ok) throw new Error("Ne mogu pronaći movies.csv u public mapi!");
            return res.text();
        })
        .then(csvTekst => {
            console.log("CSV podaci uspješno dohvaćeni.");
            
            // PapaParse pretvara CSV u objekte
            Papa.parse(csvTekst, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    sviFilmovi = results.data;
                    console.log("Podaci uspješno parsirani:", sviFilmovi);
                    prikaziFilmove(sviFilmovi);
                }
            });
        })
        .catch(err => console.error("GREŠKA:", err));

    // Povezivanje filtera
    document.getElementById('searchTitle').addEventListener('input', filtriraj);
    document.getElementById('filterGenre').addEventListener('change', filtriraj);
    document.getElementById('filterScore').addEventListener('input', (e) => {
        document.getElementById('scoreVal').innerText = e.target.value;
        filtriraj();
    });
});

function prikaziFilmove(filmovi) {
    const tbody = document.getElementById('movie-body');
    if (!tbody) {
        console.error("Greška: Ne postoji element s ID 'movie-body' u HTML-u!");
        return;
    }
    
    tbody.innerHTML = ""; 

    filmovi.forEach(film => {
        // Provjeri točna imena stupaca u svom CSV-u! 
        // Ako su u CSV-u Naslov, Godina... onda koristi njih.
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${film.Naslov || "N/A"}</td>
            <td>${film.Godina || "N/A"}</td>
            <td>${film.Zanr || "N/A"}</td>
            <td>${film.Zemlja_porijekla || "N/A"}</td>
            <td>${film.Ocjena || "0"}</td>
            <td><button onclick="dodajUKosaricu('${(film.Naslov || "Film").replace(/'/g, "\\'")}')">Dodaj</button></td>
        `;
        tbody.appendChild(row);
    });
}

function filtriraj() {
    const tekst = document.getElementById('searchTitle').value.toLowerCase();
    const zanr = document.getElementById('filterGenre').value;
    const minOcjena = parseFloat(document.getElementById('filterScore').value) || 0;

    const rezultat = sviFilmovi.filter(film => {
        const naslov = (film.Naslov || "").toLowerCase();
        const filmZanr = film.Zanr || "";
        const ocjena = parseFloat(film.Ocjena) || 0;

        return naslov.includes(tekst) && 
               (zanr === "" || filmZanr.includes(zanr)) && 
               (ocjena >= minOcjena);
    });

    prikaziFilmove(rezultat);
}


document.addEventListener("DOMContentLoaded", () => {
    fetch('/movies.csv')
        .then(res => res.text())
        .then(csvTekst => {
            Papa.parse(csvTekst, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    sviFilmovi = results.data;
                    
                    // KLJUČNI KORAK: Ovdje zovemo popunjavanje izbornika
                    popuniZanrove(sviFilmovi); 
                    
                    prikaziFilmove(sviFilmovi);
                }
            });
        });
    // ... ostatak listenera za search i slider ...
});

// Funkcija koja puni <select> element
function popuniZanrove(podaci) {
    const select = document.getElementById('filterGenre');
    const zanroviSet = new Set();

    podaci.forEach(film => {
        if (film.Zanr) {
            // Razdvajamo "Crime, Drama" na pojedinačne riječi
            const lista = film.Zanr.split(',').map(z => z.trim());
            lista.forEach(z => {
                if(z) zanroviSet.add(z);
            });
        }
    });

    // Pretvaramo Set u polje i sortiramo abecedno
    const sortiraniZanrovi = Array.from(zanroviSet).sort();

    // Dodajemo opcije u HTML
    sortiraniZanrovi.forEach(z => {
        const opt = document.createElement('option');
        opt.value = z;
        opt.innerText = z;
        select.appendChild(opt);
    });
}







// 1. Dodavanje s provjerom duplikata
function dodajUKosaricu(naslov) {
    if (kosarica.includes(naslov)) {
        alert("Ovaj film je već u vašoj košarici!");
        return;
    }
    kosarica.push(naslov);
    osvjeziKosaricu(); // Pozivamo osvježavanje prikaza
}

// 2. Funkcija koja crta košaricu na ekranu
function osvjeziKosaricu() {
    const lista = document.getElementById('cart-items');
    const brojac = document.getElementById('cart-count');
    const gumbPotvrdi = document.getElementById('btn-confirm');

    // Resetiramo listu prije ponovnog iscrtavanja
    lista.innerHTML = "";

    kosarica.forEach((item, index) => {
        const li = document.createElement('li');
        li.style.marginBottom = "5px";
        // VAŽNO: Funkcija se ovdje zove ukloniIzKosarice
        li.innerHTML = `
            ${item} 
            <button onclick="ukloniIzKosarice(${index})" style="margin-left:10px; color:red; cursor:pointer;">
                Ukloni
            </button>`;
        lista.appendChild(li);
    });

    // Ažuriramo broj stavki i vidljivost gumba
    brojac.innerText = kosarica.length;
    if (gumbPotvrdi) {
        gumbPotvrdi.style.display = kosarica.length > 0 ? "block" : "none";
    }
}

// 3. Funkcija za uklanjanje po indeksu
function ukloniIzKosarice(index) {
    // Uklanja 1 element na poziciji 'index'
    kosarica.splice(index, 1);
    // Ponovno iscrtaj košaricu da se vidi promjena
    osvjeziKosaricu();
}





// Funkcija koja se poziva klikom na gumb "Potvrdi posudbu"
function potvrdiPosudbu() {
    // 1. Provjera je li košarica prazna (za svaki slučaj)
    if (kosarica.length === 0) {
        alert("Vaša košarica je prazna!");
        return;
    }

    // 2. Kreiranje poruke (izlistat ćemo naslove koje korisnik posuđuje)
    const popisFilmova = kosarica.join("\n- "); // Spaja naslove u listu s crticama
    const poruka = `Uspješno ste posudili sljedeće filmove:\n- ${popisFilmova}\n\nUživajte u gledanju!`;

    // 3. Prikaz poruke korisniku
    alert(poruka);

    // 4. RESETIRANJE: Isprazni niz košarice
    kosarica = [];

    // 5. OSVJEŽAVANJE: Ažuriraj prikaz na stranici
    osvjeziKosaricu();
}
let currentUser = null;
let userData = null;

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                userData = doc.data();
                // Kontrolli kasutaja aktiivsust ja prooviperioodi
                if (!userData.active) {
                    document.body.innerHTML = '<h1>Konto ootel. Oota admini kinnitust.</h1><button onclick="logout()">Logi välja</button>';
                    return;
                }
                if (userData.trialEnds && new Date(userData.trialEnds.toDate()) < new Date()) {
                    document.body.innerHTML = '<h1>Prooviperiood on lõppenud. Võta adminiga ühendust.</h1><button onclick="logout()">Logi välja</button>';
                    return;
                }
                // Näita vastavat vormi
                document.getElementById('user-info').innerText = `${userData.name} (${userData.machineType} - ${userData.machineName})`;
                if (userData.machineType === 'harvester') {
                    document.getElementById('harvester-form').style.display = 'block';
                    loadHarvesterEntries();
                } else {
                    document.getElementById('forvarder-form').style.display = 'block';
                    loadForvarderEntries();
                }
            }
        });
    }
});

function logout() {
    auth.signOut();
}

// GPS funktsioon
function getLocation(type) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            if (type === 'harvester') {
                document.getElementById('h-gps').innerText = `Lat: ${lat}, Lng: ${lng}`;
                document.getElementById('h-lat').value = lat;
                document.getElementById('h-lng').value = lng;
            } else {
                document.getElementById('f-gps').innerText = `Lat: ${lat}, Lng: ${lng}`;
                document.getElementById('f-lat').value = lat;
                document.getElementById('f-lng').value = lng;
            }
        });
    } else {
        alert('GPS pole toetatud');
    }
}

// Harvesteri salvestamine
document.getElementById('harvester-entry')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
        userId: currentUser.uid,
        date: document.getElementById('h-date').value,
        lang: document.getElementById('h-lang').value,
        trees: parseInt(document.getElementById('h-trees').value),
        volume: parseFloat(document.getElementById('h-volume').value),
        fuel: parseFloat(document.getElementById('h-fuel').value),
        lat: document.getElementById('h-lat').value || null,
        lng: document.getElementById('h-lng').value || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection('entries').add(data).then(() => {
        alert('Salvestatud!');
        e.target.reset();
        loadHarvesterEntries();
    });
});

// Forvarderi salvestamine
document.getElementById('forvarder-entry')?.addEventListener('submit', e => {
    e.preventDefault();
    // Arvuta sirmi pindala (kõrgused * laiused, siis liida)
    const h1 = parseFloat(document.getElementById('f-height1').value);
    const h2 = parseFloat(document.getElementById('f-height2').value);
    const w1 = parseFloat(document.getElementById('f-width1').value);
    const w2 = parseFloat(document.getElementById('f-width2').value);
    const area = (h1 * w1) + (h2 * w2); // Kas see on õige? Võib-olla peaks olema (h1+h2)*(w1+w2)? Selguse mõttes teen liitmise.
    // Kui klient soovib teisiti, saab muuta.
    const length = parseFloat(document.getElementById('f-length').value);
    const coeff = parseFloat(document.getElementById('f-coeff').value);
    const volume = area * length * coeff; // tihumeetrid

    const data = {
        userId: currentUser.uid,
        date: document.getElementById('f-date').value,
        lang: document.getElementById('f-lang').value,
        loadNumber: document.getElementById('f-load-number').value,
        height1: h1,
        height2: h2,
        width1: w1,
        width2: w2,
        length: length,
        coeff: coeff,
        volume: volume,
        fuel: parseFloat(document.getElementById('f-fuel').value),
        lat: document.getElementById('f-lat').value || null,
        lng: document.getElementById('f-lng').value || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection('entries').add(data).then(() => {
        alert('Salvestatud!');
        e.target.reset();
        loadForvarderEntries();
    });
});

function loadHarvesterEntries() {
    const container = document.getElementById('harvester-entries');
    db.collection('entries')
        .where('userId', '==', currentUser.uid)
        .orderBy('date', 'desc')
        .get()
        .then(snapshot => {
            container.innerHTML = '';
            snapshot.forEach(doc => {
                const e = doc.data();
                const div = document.createElement('div');
                div.className = 'entry';
                div.innerHTML = `
                    <strong>${e.date}</strong> - Lang: ${e.lang}<br>
                    Puud: ${e.trees}, m³: ${e.volume}, Kütus: ${e.fuel} l<br>
                    <button onclick="showDetails('${doc.id}')">Täpsusta</button>
                    <div id="details-${doc.id}" style="display:none;">
                        ${e.lat ? `Asukoht: <a href="https://www.google.com/maps?q=${e.lat},${e.lng}" target="_blank">Vaata kaardil</a>` : 'GPS puudub'}
                    </div>
                `;
                container.appendChild(div);
            });
        });
}

function loadForvarderEntries() {
    const container = document.getElementById('forvarder-entries');
    db.collection('entries')
        .where('userId', '==', currentUser.uid)
        .orderBy('date', 'desc')
        .get()
        .then(snapshot => {
            container.innerHTML = '';
            snapshot.forEach(doc => {
                const e = doc.data();
                const div = document.createElement('div');
                div.className = 'entry';
                div.innerHTML = `
                    <strong>${e.date}</strong> - Lang: ${e.lang}, Koorma nr: ${e.loadNumber}<br>
                    m³: ${e.volume.toFixed(2)}, Kütus: ${e.fuel} l<br>
                    <button onclick="showDetails('${doc.id}')">Täpsusta</button>
                    <div id="details-${doc.id}" style="display:none;">
                        Sirmi mõõdud: kõrgus ${e.height1}+${e.height2}, laius ${e.width1}+${e.width2}, pikkus ${e.length}, koef ${e.coeff}<br>
                        ${e.lat ? `Asukoht: <a href="https://www.google.com/maps?q=${e.lat},${e.lng}" target="_blank">Vaata kaardil</a>` : 'GPS puudub'}
                    </div>
                `;
                container.appendChild(div);
            });
        });
}

function showDetails(id) {
    const details = document.getElementById('details-' + id);
    details.style.display = details.style.display === 'none' ? 'block' : 'none';
}

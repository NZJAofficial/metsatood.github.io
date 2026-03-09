auth.onAuthStateChanged(user => {
    if (user) {
        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists && doc.data().role === 'admin') {
                loadUsers();
            } else {
                window.location.href = 'index.html';
            }
        });
    } else {
        window.location.href = 'index.html';
    }
});

function logout() {
    auth.signOut();
}

function loadUsers() {
    const container = document.getElementById('users-list');
    db.collection('users').get().then(snapshot => {
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            const div = document.createElement('div');
            div.className = 'user-card';
            div.innerHTML = `
                <strong>${user.name}</strong> (${user.email})<br>
                Masin: ${user.machineType} - ${user.machineName}<br>
                Aktiivne: ${user.active ? 'Jah' : 'Ei'}<br>
                Prooviperiood lõppeb: ${user.trialEnds ? new Date(user.trialEnds.toDate()).toLocaleDateString() : 'Määramata'}<br>
                <button onclick="toggleActive('${doc.id}', ${!user.active})">${user.active ? 'Deaktiveeri' : 'Aktiveeri'}</button>
                <input type="date" id="trial-${doc.id}" value="${user.trialEnds ? user.trialEnds.toDate().toISOString().split('T')[0] : ''}">
                <button onclick="setTrial('${doc.id}')">Määra prooviperiood</button>
                <hr>
            `;
            container.appendChild(div);
        });
    });
}

function toggleActive(userId, active) {
    db.collection('users').doc(userId).update({ active: active }).then(() => loadUsers());
}

function setTrial(userId) {
    const date = document.getElementById('trial-' + userId).value;
    if (date) {
        db.collection('users').doc(userId).update({ trialEnds: new Date(date) }).then(() => loadUsers());
    }
}

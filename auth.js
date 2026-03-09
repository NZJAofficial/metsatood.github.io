// Kontrolli sisselogimise olekut
auth.onAuthStateChanged(user => {
  if (user) {
    // Kasutaja on sisse logitud, aga kontrollime, kas ta on admin või tavakasutaja
    db.collection('users').doc(user.uid).get().then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        if (userData.role === 'admin') {
          // Suuna admin paneeli
          window.location.href = 'admin.html';
        } else {
          // Suuna dashboardile
          window.location.href = 'dashboard.html';
        }
      } else {
        // Uus kasutaja, pole veel andmeid
        window.location.href = 'index.html';
      }
    });
  } else {
    // Pole sisse logitud, suuna sisselogimise lehele
    if (!window.location.pathname.includes('index.html')) {
      window.location.href = 'index.html';
    }
  }
});

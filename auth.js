// auth.js
auth.onAuthStateChanged(user => {
  const currentPath = window.location.pathname;

  if (user) {
    // Kasutaja on sisse logitud
    db.collection('users').doc(user.uid).get().then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        // Suuna admin vaatesse, kui pole juba seal
        if (userData.role === 'admin' && !currentPath.includes('admin.html')) {
          window.location.href = 'admin.html';
        }
        // Suuna tavakasutaja vaatesse, kui pole juba seal
        else if (userData.role !== 'admin' && !currentPath.includes('dashboard.html')) {
          window.location.href = 'dashboard.html';
        }
        // Muidu jää samale lehele (nt dashboard juba lahti)
      } else {
        // Kasutaja on olemas Auth-is, aga andmebaasi dokument puudub
        console.error('Kasutaja dokument puudub Firestore andmebaasis!');
        alert('Konto andmed on puudulikud. Palun võta ühendust adminiga.');
        // Võimalusel logi välja
        auth.signOut();
      }
    });
  } else {
    // Pole sisse logitud – suuna sisselogimisele, kui pole juba index.html
    if (!currentPath.includes('index.html')) {
      window.location.href = 'index.html';
    }
  }
});

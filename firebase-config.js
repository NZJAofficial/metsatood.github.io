// Sinu Firebase konfiguratsioon (asenda oma andmetega)
const firebaseConfig = {
  apiKey: "AIzaSyBOmzpiwKzy9F1dQmIBB2_p0VDUnG8NQIA",
  authDomain: "metsatood-447b5.firebaseapp.com",
  projectId: "metsatood-447b5",
  storageBucket: "metsatood-447b5.firebasestorage.app",
  messagingSenderId: "337538744836",
  appId: "1:337538744836:web:d8e973750e1f242b11ab51"
};

// Initsialiseeri Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

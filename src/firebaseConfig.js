import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyAdyN-5Db1F23BDKBK-bLou8vwlPAFbqTM",
  authDomain: "daz-connect.firebaseapp.com",
  projectId: "daz-connect",
  storageBucket: "daz-connect.firebasestorage.app", // Geändert zur Firebase-Vorgabe
  messagingSenderId: "387828016372",
  appId: "1:387828016372:web:7e33bbb433ebec3829aaa1",
  measurementId: "G-WWL8ZKCR2J"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// enableIndexedDbPersistence ENTFERNT

console.log("Firebase initialisiert:", !!app);
console.log("Firestore initialisiert:", !!db);
console.log("Auth initialisiert:", !!auth);

export { app, db, auth };
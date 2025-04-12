import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyAdyN-5Db1F23BDKBK-bLou8vwlPAFbqTM",
  authDomain: "daz-connect.firebaseapp.com",
  projectId: "daz-connect",
  storageBucket: "daz-connect.appspot.com", // Korrigierte Domain
  messagingSenderId: "387828016372",
  appId: "1:387828016372:web:7e33bbb433ebec3829aaa1",
  measurementId: "G-WWL8ZKCR2J"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Einstellungen für Tauri-spezifische Umgebung
// Da Tauri eine Desktop-App ist, können wir einige Einschränkungen lockern
const isTauri = window.navigator.userAgent.includes('Tauri');

// Für Debugging
console.log("Firebase initialisiert:", !!app);
console.log("Firestore initialisiert:", !!db);
console.log("Auth initialisiert:", !!auth);

export { app, db, auth };
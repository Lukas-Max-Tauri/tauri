// routes/authRoutes.js
import express from 'express';
import { 
  register, 
  login, 
  logout, 
  protect, 
  getCurrentUser,
  updatePassword 
} from '../controllers/authController.js';
import admin from 'firebase-admin';

const router = express.Router();

// Debug-Logging für Firebase Admin-Initialisierung
console.log('Versuche Firebase Admin zu initialisieren...');
console.log('GOOGLE_APPLICATION_CREDENTIALS_JSON vorhanden:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Firebase Admin initialisieren, wenn es noch nicht initialisiert wurde
if (!admin.apps.length) {
  try {
    // Service Account aus Umgebungsvariablen laden
    const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
      : null;
      
    console.log('Service Account geladen:', !!serviceAccount);
    
    if (serviceAccount) {
      // Zeige einige Schlüssel (nicht den privaten Schlüssel!)
      console.log('Service Account enthält:', 
        Object.keys(serviceAccount).filter(key => key !== 'private_key').join(', '));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK erfolgreich initialisiert');
    } else {
      console.warn('Firebase Admin kann nicht initialisiert werden: Keine Credentials gefunden');
      
      // Alternative Initialisierung versuchen
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: "daz-connect",
            clientEmail: "firebase-adminsdk-fbsvc@daz-connect.iam.gserviceaccount.com",
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDdaRSN112EuUul\nE9qQDCOe6zK1JwO0cAsRs5U4uJ9qgzjsKHK09EDXWv9cy7MJesIEoHdmIwojhY48\n8K9PowVG3VWmS4Nb3bO/LN8+5S7nq4raOjZFxs4MRtH7rckzv8j+A7nLa9XbtxqJ\nqh80s7udfYKUeg1C2yXkGPu5eHafCX7/SFD5yiJnA97Wm9I6tCqJ6fwe0LZ8ztUi\nM5As8r7BWlMjwTnH3uTKrgG1+rLfZxFabqMr5/uAN0TQ3aOOUM/EGNT0DsSkQ+Fj\nr0cdW4RyiDcZij8CIvzmnk2Wn8GPmjN3N36K0EVhjRMj8H7/2unABmLZd5ZNhEEC\nBpyCzGDPAgMBAAECggEAMDCGwLh3KkQKKsu/bkq2Fgiq6LKtI8CfKCMl/0pvqAcX\nhI7pKGlhE35CxjevqAiH4enrEtfdhQ20f58DCRo6M8pIsgENfhkq3hkuHcpUAyha\n+FRjK5yxjAp9+YFBoXnEjUTSU2wNB906cWwNjrLvyr9ehGJsMHjyLkshvqRxbPuE\nRafXLpsyr1cQTnOaUS/Os0ij9ifi3urL+FcOiNDJN4bgqGvXakXGdQebi8ik9tm9\nrdyNfCl5CT7RgRK2lliWeAw5dMZkBkMc+bcHDRDn2e2s7Dz2h7jLJtHfh23cmlNH\narRx7WiFCOqskgF8itHJixEVA1eEqiQ2aDN7GKOzAQKBgQD+FD035KGPFIqW4c6G\nDF+bpvGiLnjCFO+us4PeELIKt3U6TCIaAQFx4CIYLO6+L+OlE6NK7N8cPi7/NP/x\nLeSe1pXKJopRtCy8rpFupMQQvlmBWSecU0C4KoD/eI5PiKyUBZOls7icmHtAhprC\n/HWfosHMo/6yIjZ84Lqw5dZyfwKBgQDfFZy+Obptg/oTvQX/R9leu3941GubQ+Aa\ndYYUCHN+VbPYrOXpQD0z1cMt9hdI+Z97pYQR4Uv5MmKIhKyZYAG2lnSDiL8DuYvQ\ne+aN4WeNWn2OFu3bT/2j7yNddPrUzjeIy3Ngxol5F3fzsnnMco4hicQVMjtwjxMt\nJm52qp9JsQKBgQCz8QWCJiu9N2EHhphLG0xC4jLTF3JykX1GDuDfTpepO1CMnwqv\nu/KYAZJj6L6UdzoT2RqWn7dLO0bxe0mgN05op7Sh3DWts5rTbhaVc59f9E9Tah7B\nebymMYP2ahzveu4uTtzIR8YBMYRoqGvGmCF9kzkJg0OISO6p9kaBreT4ZQKBgCsG\noBSQTcSRj8n+ywlRcjszLoK/dYGctbxkrlduydez79v6fN1f5m347IwQyqzoeDoA\n0lgge+a0MQzjieaK/cmZex9jYHP3dV/ghbcXokFBErY09es2olTb6pY72aTxoQRh\nOP+RSzJvtFLsOVGVRpRxXcA4z/4Fmk06/FMm1VIBAoGBAJV1STkp+SqoYr38nQlW\nIVdyj70yeTcNx/+mnmvGkaVqu0nsh7M5br+nQbMecevCvgr9Oin41iWFLXUMo1qJ\nCIqN3XOi6liBP+247zfb0FkBpOFkEUSLi3UHprENm0n8yuSz8Ptnl5zr2grbrLYx\nR1R38+Ka10JZZMgzR9lbbUAV\n-----END PRIVATE KEY-----\n"
          })
        });
        console.log('Firebase Admin SDK erfolgreich initialisiert (Alternative Methode)');
      } catch (altError) {
        console.error('Fehler bei der alternativen Initialisierung von Firebase Admin:', altError);
      }
    }
  } catch (error) {
    console.error('Fehler bei der Initialisierung von Firebase Admin:', error);
  }
}

// Konstanten für die bekannten Benutzer-IDs
const KNOWN_FIREBASE_UID = 'Gy824L3UNYZGVBIa6cNdLpQ81nG2'; // Deine Firebase UID
const KNOWN_EMAIL = 'lukasbeutler@gmx.de'; // Deine E-Mail-Adresse

// Hilfs-Funktion zur Verknüpfung von Legacy und Firebase Benutzer
const linkLegacyToFirebaseUser = async (legacyUserId) => {
  try {
    // Versuche zuerst, den Benutzer per E-Mail zu finden
    try {
      const userRecord = await admin.auth().getUserByEmail(KNOWN_EMAIL);
      console.log(`Firebase-Benutzer mit E-Mail ${KNOWN_EMAIL} gefunden: ${userRecord.uid}`);
      return userRecord.uid;
    } catch (emailError) {
      // Wenn Benutzer nicht per E-Mail gefunden wird, verwende die bekannte UID
      console.log(`Verwende bekannte Firebase UID: ${KNOWN_FIREBASE_UID}`);
      try {
        const userRecord = await admin.auth().getUser(KNOWN_FIREBASE_UID);
        console.log(`Firebase-Benutzer mit UID ${KNOWN_FIREBASE_UID} bestätigt`);
        return userRecord.uid;
      } catch (uidError) {
        console.error('Fehler beim Abrufen des Firebase-Benutzers:', uidError);
        throw uidError;
      }
    }
  } catch (error) {
    console.error('Fehler bei der Verknüpfung Legacy<->Firebase:', error);
    throw error;
  }
};

// Auth Routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getCurrentUser);

// NEUER ENDPUNKT: Firebase Custom Token generieren
router.get('/getFirebaseToken', protect, async (req, res) => {
  try {
    if (!admin.apps.length) {
      return res.status(500).json({
        status: 'error',
        message: 'Firebase Admin ist nicht initialisiert'
      });
    }

    // Nutzer-ID aus dem JWT-Token verwenden
    const legacyUserId = req.user._id.toString();
    console.log('Legacy-User-ID für Firebase-Token:', legacyUserId);
    
    // Verwende die bekannte Firebase UID für das Custom Token
    let firebaseUid;
    try {
      firebaseUid = await linkLegacyToFirebaseUser(legacyUserId);
    } catch (linkError) {
      // Fallback zur bekannten UID im Fehlerfall
      console.warn('Fallback zur bekannten Firebase UID:', KNOWN_FIREBASE_UID);
      firebaseUid = KNOWN_FIREBASE_UID;
    }
    
    // Custom Claims hinzufügen (optional)
    const customClaims = {
      legacyUserId: legacyUserId,
      email: KNOWN_EMAIL
    };
    
    // Firebase Custom Token generieren mit der bekannten UID
    const firebaseToken = await admin.auth().createCustomToken(firebaseUid, customClaims);
    console.log('Firebase-Token erfolgreich erstellt für UID:', firebaseUid);
    
    res.status(200).json({
      status: 'success',
      firebaseToken
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Firebase-Tokens:', error);
    res.status(500).json({
      status: 'error',
      message: 'Firebase-Token konnte nicht erstellt werden',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Protected Routes
router.patch('/me', protect, async (req, res) => {
  try {
    const { progress, selectedLanguages } = req.body;
    const user = req.user;

    // Aktualisiere die Felder, wenn sie vorhanden sind
    if (progress) {
      user.progress = {
        ...user.progress,
        ...progress
      };
    }

    if (selectedLanguages) {
      user.selectedLanguages = selectedLanguages;
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Fehler beim Aktualisieren des Benutzers'
    });
  }
});

router.patch('/updatePassword', protect, updatePassword);

export default router;
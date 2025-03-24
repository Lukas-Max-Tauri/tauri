// Importiere die Firebase-Funktionen
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Lizenz anhand des Codes überprüfen
export const verifyLicense = async (licenseCode) => {
  try {
    // Suche in der Firestore-Datenbank nach der Lizenz
    const licensesRef = collection(db, 'licenses');
    const q = query(licensesRef, where('code', '==', licenseCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { 
        valid: false, 
        message: 'Ungültiger Lizenzschlüssel. Bitte überprüfen Sie Ihre Eingabe.' 
      };
    }
    
    // Erstes (und idealerweise einziges) Dokument abrufen
    const licenseDoc = querySnapshot.docs[0];
    const licenseData = licenseDoc.data();
    const licenseId = licenseDoc.id;
    
    // Prüfen, ob die Lizenz abgelaufen ist
    const expiryDate = licenseData.expiresAt ? new Date(licenseData.expiresAt) : null;
    const currentDate = new Date();
    
    if (expiryDate && currentDate > expiryDate) {
      return {
        valid: false,
        message: 'Diese Lizenz ist abgelaufen.',
        expired: true
      };
    }
    
    // Prüfen, ob die Lizenz zu oft aktiviert wurde
    const maxActivationsAllowed = licenseData.maxActivations || 3; // Standard: 3 Aktivierungen
    if (licenseData.activations && licenseData.activations.length >= maxActivationsAllowed) {
      return {
        valid: false,
        message: `Diese Lizenz wurde bereits auf der maximalen Anzahl von ${maxActivationsAllowed} Geräten aktiviert.`
      };
    }
    
    // Berechnung der verbleibenden Tage
    let remainingDays = 0;
    if (expiryDate) {
      const diffTime = expiryDate - currentDate;
      remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Aktivierungszählung
    const activationsCount = licenseData.activations ? licenseData.activations.length : 0;
    const maxActivations = licenseData.maxActivations || 3;

    // Erfolgreiche Validierung
    return {
      valid: true,
      licenseId: licenseId,
      code: licenseData.code,
      productName: licenseData.product || 'DaZ Connect',
      expiryDate: expiryDate || new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000),
      remainingDays: remainingDays,
      licenseType: licenseData.type || 'year',
      activationsCount: activationsCount,
      maxActivations: maxActivations
    };
  } catch (error) {
    console.error('Fehler bei der Lizenzüberprüfung:', error);
    throw error;
  }
};

// Aktualisieren der Aktivierungsinformationen einer Lizenz
export const updateLicenseActivation = async (licenseId, deviceInfo) => {
  try {
    const licenseRef = doc(db, 'licenses', licenseId);
    const licenseDoc = await getDoc(licenseRef);
    
    if (!licenseDoc.exists()) {
      throw new Error('Lizenz nicht gefunden');
    }
    
    const licenseData = licenseDoc.data();
    let activations = licenseData.activations || [];
    
    // Neue Aktivierung hinzufügen
    const currentTimestamp = new Date().toISOString();
    activations.push({
      ...deviceInfo,
      timestamp: currentTimestamp
    });
    
    // Lizenz aktualisieren
    await updateDoc(licenseRef, { 
      activations: activations,
      isActive: true,
      lastActivated: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Lizenzaktivierung:', error);
    throw error;
  }
};
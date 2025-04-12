// src/contexts/GameSaveContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  getDocs, 
  Timestamp,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { SERVER_URL, isTauri } from '../utils/api';
const API_URL = SERVER_URL;

// GameSave-Context erstellen
const GameSaveContext = createContext({});


// Hook zum einfachen Zugriff auf den GameSave-Context
export const useGameSave = () => useContext(GameSaveContext);

export const GameSaveProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error
  const [syncQueue, setSyncQueue] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);
  const [syncTimeoutId, setSyncTimeoutId] = useState(null);
  const syncQueueRef = useRef(syncQueue);
  const [syncErrorCount, setSyncErrorCount] = useState(0); // Zähler für Fehler
  const [syncErrorItems, setSyncErrorItems] = useState({}); // Speichert Elemente, die Fehler verursachen

  // Debug-Informationen für Firebase User
  useEffect(() => {
    if (user) {
      console.log("Auth Debug - User Objekt:", {
        _id: user._id,
        uid: user.uid,
        userId: user._id || user.uid // Wir verwenden diese Variable später
      });
    }
  }, [user]);

  // Hilfsfunktion zur Bereinigung von Daten für Firestore
  const sanitizeDataForFirestore = (data) => {
    try {
      // Versuche das Objekt zu JSON zu serialisieren und wieder zurück
      // Dies entfernt kreisförmige Referenzen und Funktionen
      return JSON.parse(JSON.stringify(data));
    } catch (err) {
      console.error("Fehler beim Serialisieren von Daten für Firestore:", err);
      // Im Fehlerfall gib ein leeres Objekt zurück
      return {};
    }
  };

  // Hilfsfunktion zum Erstellen eines benutzerspezifischen localStorage-Schlüssels
  const getUserStorageKey = (key) => {
    const userId = user?.uid || user?._id;
    return userId ? `user_${userId}_${key}` : `anonymous_${key}`;
  };

  // Hilfsfunktion zum Löschen aller lokalen Spielstände eines Benutzers
  const clearUserLocalStorage = (userId) => {
    if (!userId) return;
    
    // Alle localStorage-Schlüssel durchgehen
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`user_${userId}_`)) {
        localStorage.removeItem(key);
      }
    }
  };

  // Aktualisiere die Referenz, wenn sich syncQueue ändert
  useEffect(() => {
    syncQueueRef.current = syncQueue;
  }, [syncQueue]);

  // Online-Status überwachen
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Versuche zu synchronisieren, wenn wieder online
      const currentQueue = syncQueueRef.current;
      if (Object.keys(currentQueue).length > 0) {
        batchSyncToFirebase();
      }
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wenn Benutzer-ID sich ändert, setze Synchronisationsstatus zurück
  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user.uid || user._id; // Beide Varianten unterstützen
      console.log("Benutzer authentifiziert:", userId);
      setSyncStatus('idle');
      
      // Initialen Sync durchführen
      syncFromFirebase();
    } else {
      setSyncStatus('idle');
      setSyncQueue({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.uid, user?._id]);

  // Debounced Batch-Synchronisation mit Firebase
  const batchSyncToFirebase = useCallback(async () => {
    if (!isAuthenticated || !user || !isOnline || Object.keys(syncQueueRef.current).length === 0) return;

    // Die korrekte User-ID ermitteln
    const userId = user.uid || user._id;
    if (!userId) {
      console.error("Keine Benutzer-ID gefunden für die Synchronisation");
      return;
    }

    // Bereits laufenden Timeout abbrechen
    if (syncTimeoutId) {
      clearTimeout(syncTimeoutId);
    }

    // Neuen Timeout setzen
    const timeoutId = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        console.log("Starte Batch-Synchronisation mit Firebase...");

        const batch = writeBatch(db);
        const currentQueue = { ...syncQueueRef.current };

        // Für jeden Eintrag in der Warteschlange
        for (const [key, data] of Object.entries(currentQueue)) {
          // Überspringe Elemente, die bereits Fehler verursacht haben
          if (syncErrorItems[key]) {
            console.warn(`Überspringe "${key}" wegen vorheriger Fehler`);
            continue;
          }

          const docRef = doc(db, 'users', userId, 'gameData', key);
          const sanitizedData = sanitizeDataForFirestore(data);
          
          batch.set(docRef, {
            data: sanitizedData,
            updatedAt: Timestamp.now()
          });
        }

        await batch.commit();
        console.log("Batch-Synchronisation erfolgreich!");
        
        // Warteschlange leeren, nachdem alle Daten synchronisiert wurden
        setSyncQueue({});
        setSyncErrorCount(0); // Fehler zurücksetzen
        setSyncStatus('synced');
        setLastSync(new Date().toISOString());
      } catch (error) {
        console.error("Fehler bei der Batch-Synchronisation:", error);
        setSyncStatus('error');
        setSyncErrorCount(prev => prev + 1);
        
        // Bei zu vielen Fehlern die Warteschlange leeren
        if (syncErrorCount > 3) {
          console.warn("Zu viele Fehler bei der Synchronisation. Warteschlange wird geleert.");
          setSyncQueue({});
          setSyncErrorItems({});
          setSyncErrorCount(0);
        }
      }
    }, 1000); // 1 Sekunde Verzögerung

    setSyncTimeoutId(timeoutId);
  }, [isAuthenticated, isOnline, syncTimeoutId, user, syncErrorItems, syncErrorCount]);

  // Spielstand speichern - MIT BENUTZERSPEZIFISCHEM SCHLÜSSEL
  const saveGameState = useCallback(async (key, data) => {
    if (!key || data === undefined) {
      console.error("Ungültige Parameter für saveGameState:", { key, data });
      return false;
    }

    try {
      // Benutzer-spezifischen Schlüssel erstellen
      const storageKey = getUserStorageKey(key);
      
      // Mit dem benutzerabhängigen Schlüssel speichern
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log(`Spielstand "${key}" lokal gespeichert.`);
      
      // Wenn authentifiziert, zur Sync-Warteschlange hinzufügen
      if (isAuthenticated && user) {
        // Die korrekte User-ID ermitteln
        const userId = user.uid || user._id;
        if (!userId) {
          console.error("Keine Benutzer-ID gefunden für die Synchronisation");
          return true; // Trotzdem lokalen Speichererfolg zurückgeben
        }

        // Überprüfen, ob dieses Element bereits fehlgeschlagen ist
        if (syncErrorItems[key]) {
          console.warn(`Überspringe "${key}" wegen vorheriger Synchronisierungsfehler`);
          return true; // Lokaler Speichererfolg
        }

        setSyncQueue(prev => ({
          ...prev,
          [key]: data
        }));
        
        // Wenn online, sofort synchronisieren
        if (isOnline) {
          console.log(`Spielstand "${key}" wird mit Firebase synchronisiert.`);
          
          try {
            const docRef = doc(db, 'users', userId, 'gameData', key);
            const sanitizedData = sanitizeDataForFirestore(data);
            
            await setDoc(docRef, {
              data: sanitizedData,
              updatedAt: Timestamp.now()
            });
            
            // Entferne den erfolgreichen Eintrag aus der Warteschlange
            setSyncQueue(prev => {
              const { [key]: removed, ...rest } = prev;
              return rest;
            });
            
            // Entferne aus der Fehlerliste, falls es dort war
            if (syncErrorItems[key]) {
              setSyncErrorItems(prev => {
                const { [key]: removed, ...rest } = prev;
                return rest;
              });
            }
            
            setSyncStatus('synced');
            setLastSync(new Date().toISOString());
            console.log(`Spielstand "${key}" erfolgreich synchronisiert.`);
          } catch (error) {
            console.error(`Fehler beim Synchronisieren von "${key}":`, error);
            setSyncStatus('error');

            // Berechtigungsfehler behandeln
            if (error && (
              error.message.includes("Missing or insufficient permissions") || 
              error.code === 'permission-denied' || 
              error.code === 'unauthenticated')) {
              
              console.warn(`Berechtigungsfehler für "${key}": Entferne aus der Warteschlange`);
              
              // Entferne den Eintrag aus der Warteschlange
              setSyncQueue(prev => {
                const { [key]: removed, ...rest } = prev;
                return rest;
              });
              
              // Füge zur Fehlerliste hinzu
              setSyncErrorItems(prev => ({
                ...prev,
                [key]: {
                  error: error.message,
                  timestamp: new Date().toISOString()
                }
              }));
            }
            
            return false;
          }
        } else {
          console.log(`Spielstand "${key}" zur Offline-Warteschlange hinzugefügt.`);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Speichern von "${key}":`, error);
      return false;
    }
  }, [isAuthenticated, isOnline, user, syncErrorItems]);

  // Spielstand laden - MIT BENUTZERSPEZIFISCHEM SCHLÜSSEL UND TYPÜBERPRÜFUNG
const loadGameState = useCallback(async (key) => {
  if (!key) {
    console.error("Kein Schlüssel für loadGameState angegeben");
    return null;
  }

  try {
    // Standardwerte für verschiedene Datentypen definieren
    const defaultValues = {
      'dailyWords': [],
      'wordCategories': [],
      'sentenceCategories': [],
      'dailySentences': [],
      'difficultWords': {},
      'missionsFortschritt': {
        erstellt: 0,
        gelernt: 0,
        verben: 0,
        gesamtPunkte: 0
      }
    };

    // Zuerst versuchen, Daten aus Firebase zu laden (wenn authentifiziert und online)
    if (isAuthenticated && user && isOnline) {
      try {
        // Die korrekte User-ID ermitteln
        const userId = user.uid || user._id;
        if (!userId) {
          console.error("Keine Benutzer-ID gefunden für das Laden");
          // Fallback auf localStorage
        } else {
          const docRef = doc(db, 'users', userId, 'gameData', key);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const remoteData = docSnap.data().data;
            console.log(`Spielstand "${key}" aus Firebase geladen.`);
            
            // Prüfen, ob die geladenen Daten den erwarteten Typ haben
            if (Array.isArray(defaultValues[key]) && !Array.isArray(remoteData)) {
              console.warn(`Typ-Korrektur für ${key}: Objekt -> Array`);
              const correctedData = Array.isArray(remoteData) ? remoteData : [];
              
              // In localStorage speichern mit benutzerspezifischem Schlüssel
              const storageKey = getUserStorageKey(key);
              localStorage.setItem(storageKey, JSON.stringify(correctedData));
              
              return correctedData;
            } 
            else if (typeof defaultValues[key] === 'object' && !Array.isArray(defaultValues[key]) && 
                    (Array.isArray(remoteData) || typeof remoteData !== 'object')) {
              console.warn(`Typ-Korrektur für ${key}: ${typeof remoteData} -> Objekt`);
              const correctedData = typeof remoteData === 'object' && !Array.isArray(remoteData) ? 
                                    remoteData : defaultValues[key];
              
              // In localStorage speichern mit benutzerspezifischem Schlüssel
              const storageKey = getUserStorageKey(key);
              localStorage.setItem(storageKey, JSON.stringify(correctedData));
              
              return correctedData;
            }
            
            // In localStorage speichern mit benutzerspezifischem Schlüssel
            const storageKey = getUserStorageKey(key);
            localStorage.setItem(storageKey, JSON.stringify(remoteData));
            
            return remoteData;
          }
        }
      } catch (error) {
        console.warn(`Fehler beim Laden von "${key}" aus Firebase:`, error);
        // Fallback auf localStorage
      }
    }
    
    // Daten aus localStorage laden - MIT BENUTZERSPEZIFISCHEM SCHLÜSSEL
    const storageKey = getUserStorageKey(key);
    const localData = localStorage.getItem(storageKey);
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        
        // Auch hier auf Typkorrektheit prüfen
        if (Array.isArray(defaultValues[key]) && !Array.isArray(parsedData)) {
          console.warn(`Typ-Korrektur für ${key} in localStorage: Objekt -> Array`);
          return [];
        } 
        else if (typeof defaultValues[key] === 'object' && !Array.isArray(defaultValues[key]) && 
                (Array.isArray(parsedData) || typeof parsedData !== 'object')) {
          console.warn(`Typ-Korrektur für ${key} in localStorage: ${typeof parsedData} -> Objekt`);
          return defaultValues[key];
        }
        
        console.log(`Spielstand "${key}" aus localStorage geladen.`);
        return parsedData;
      } catch (error) {
        console.error(`Fehler beim Parsen von "${key}" aus localStorage:`, error);
        return defaultValues[key] || null;
      }
    }
    
    console.log(`Kein Spielstand für "${key}" gefunden.`);
    return defaultValues[key] || null;
  } catch (error) {
    console.error(`Fehler beim Laden von "${key}":`, error);
    return null;
  }
}, [isAuthenticated, isOnline, user]);
  // Alle gespeicherten Spielstände eines Benutzers aus Firebase laden
  const syncFromFirebase = useCallback(async () => {
    if (!isAuthenticated || !user || !isOnline) return;

    // Die korrekte User-ID ermitteln
    const userId = user.uid || user._id;
    if (!userId) {
      console.error("Keine Benutzer-ID gefunden für die Synchronisation");
      return;
    }

    try {
      setSyncStatus('syncing');
      console.log("Lade alle Spielstände aus Firebase...");
      
      const gameDataRef = collection(db, 'users', userId, 'gameData');
      const querySnapshot = await getDocs(gameDataRef);
      
      if (querySnapshot.empty) {
        console.log("Keine Spielstände in Firebase gefunden.");
        setSyncStatus('synced');
        setLastSync(new Date().toISOString());
        return;
      }
      
      // Alle Spielstände aus Firebase in localStorage speichern
      querySnapshot.forEach((doc) => {
        const key = doc.id;
        const data = doc.data().data;
        
        // Benutzerspezifischen Schlüssel für localStorage erstellen
        const storageKey = getUserStorageKey(key);
        
        // Prüfen, ob lokale Daten neuer sind (falls vorhanden)
        const localDataStr = localStorage.getItem(storageKey);
        if (localDataStr) {
          try {
            // Wenn lokale Daten vorhanden, prüfen ob sie aktueller sind
            const localData = JSON.parse(localDataStr);
            
            // Einfache Implementierung: Lokale Daten bevorzugen und zur Synchronisation markieren
            if (JSON.stringify(localData).length > JSON.stringify(data).length) {
              console.log(`Lokale Daten für "${key}" scheinen aktueller zu sein, werden später synchronisiert.`);
              setSyncQueue(prev => ({
                ...prev,
                [key]: localData
              }));
              return; // Überspringe die Ersetzung durch Firebase-Daten
            }
          } catch (error) {
            console.error(`Fehler beim Verarbeiten lokaler Daten für "${key}":`, error);
          }
        }
        
        // Speichere Firebase-Daten lokal mit benutzerspezifischem Schlüssel
        localStorage.setItem(storageKey, JSON.stringify(data));
        console.log(`Spielstand "${key}" aus Firebase in localStorage gespeichert.`);
      });
      
      setSyncStatus('synced');
      setLastSync(new Date().toISOString());
      console.log("Alle Spielstände erfolgreich synchronisiert.");
      
      // Wenn es Einträge in der Warteschlange gibt, synchronisiere sie
      if (Object.keys(syncQueueRef.current).length > 0) {
        batchSyncToFirebase();
      }
    } catch (error) {
      console.error("Fehler beim Laden der Spielstände aus Firebase:", error);
      setSyncStatus('error');
    }
  }, [isAuthenticated, isOnline, user, batchSyncToFirebase]);

  // Manuelle Synchronisation erzwingen
  const forceSync = useCallback(async () => {
    if (!isAuthenticated || !isOnline) {
      return { success: false, message: "Synchronisation nicht möglich: Offline oder nicht angemeldet." };
    }
    
    try {
      // Fehler zurücksetzen
      setSyncErrorCount(0);
      setSyncErrorItems({});
      
      // Zuerst von Firebase laden
      await syncFromFirebase();
      
      // Dann zur Firebase hochladen
      if (Object.keys(syncQueueRef.current).length > 0) {
        await batchSyncToFirebase();
      }
      
      return { success: true, message: "Synchronisation erfolgreich!" };
    } catch (error) {
      console.error("Fehler bei der erzwungenen Synchronisation:", error);
      return { success: false, message: "Synchronisation fehlgeschlagen: " + error.message };
    }
  }, [isAuthenticated, isOnline, syncFromFirebase, batchSyncToFirebase]);

  // Spielstände exportieren - BENUTZERSPEZIFISCHE SCHLÜSSEL BERÜCKSICHTIGEN
  const exportGameData = useCallback(() => {
    try {
      const exportData = {};
      
      // Die bekannten Spielstandschlüssel
      const gameStateKeys = [
        'dailyWords', 
        'wordCategories', 
        'sentenceCategories', 
        'dailySentences', 
        'difficultWords', 
        'missionsFortschritt',
        'verbCategories',
        'customVerbs'
      ];
      
      // Für jeden Schlüssel den benutzerspezifischen localStorage-Schlüssel generieren
      gameStateKeys.forEach(key => {
        const storageKey = getUserStorageKey(key);
        const value = localStorage.getItem(storageKey);
        
        if (value) {
          try {
            exportData[key] = JSON.parse(value);
          } catch (error) {
            console.error(`Fehler beim Parsen von "${key}":`, error);
            exportData[key] = value; // Rohwert speichern
          }
        }
      });
      
      // Zusätzliche Metadaten
      exportData._meta = {
        exportDate: new Date().toISOString(),
        userId: user?.uid || user?._id || 'anonymous',
        version: '1.0'
      };
      
      // Als JSON-String konvertieren
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // JSON-Datei erstellen und herunterladen
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daz-connect-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, message: "Spielstände erfolgreich exportiert!" };
    } catch (error) {
      console.error("Fehler beim Exportieren der Spielstände:", error);
      return { success: false, message: "Export fehlgeschlagen: " + error.message };
    }
  }, [user]);

  // Spielstände importieren - MIT BENUTZERSPEZIFISCHEN SCHLÜSSELN
  const importGameData = useCallback(async (jsonData) => {
    try {
      // JSON-Daten parsen, falls als String übergeben
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // Metadaten validieren
      if (!data._meta || !data._meta.version) {
        return { success: false, message: "Ungültiges Backup-Format: Metadaten fehlen." };
      }
      
      // Die Spielstände in localStorage speichern
      const gameStateKeys = [
        'dailyWords', 
        'wordCategories', 
        'sentenceCategories', 
        'dailySentences', 
        'difficultWords', 
        'missionsFortschritt',
        'verbCategories',
        'customVerbs'
      ];
      
      gameStateKeys.forEach(key => {
        if (data[key]) {
          // Benutzerspezifischen Schlüssel verwenden
          const storageKey = getUserStorageKey(key);
          localStorage.setItem(storageKey, JSON.stringify(data[key]));
          console.log(`Spielstand "${key}" importiert.`);
        }
      });
      
      // Auch in Firebase speichern, wenn online
      if (isAuthenticated && user && isOnline) {
        try {
          // Die korrekte User-ID ermitteln
          const userId = user.uid || user._id;
          if (!userId) {
            console.error("Keine Benutzer-ID gefunden für den Import");
            // Trotzdem fortfahren mit lokaler Speicherung
          } else {
            const batch = writeBatch(db);
            
            gameStateKeys.forEach(key => {
              if (data[key]) {
                const docRef = doc(db, 'users', userId, 'gameData', key);
                const sanitizedData = sanitizeDataForFirestore(data[key]);
                batch.set(docRef, {
                  data: sanitizedData,
                  updatedAt: Timestamp.now(),
                  importedAt: Timestamp.now()
                });
              }
            });
            
            await batch.commit();
            console.log("Alle importierten Spielstände erfolgreich mit Firebase synchronisiert.");
          }
        } catch (error) {
          console.error("Fehler beim Synchronisieren der importierten Spielstände:", error);
          // Weitermachen, auch wenn Firebase-Sync fehlschlägt
        }
      }
      
      return { 
        success: true, 
        message: "Spielstände erfolgreich importiert! Bitte lade die Seite neu, um die Änderungen zu sehen." 
      };
    } catch (error) {
      console.error("Fehler beim Importieren der Spielstände:", error);
      return { success: false, message: "Import fehlgeschlagen: " + error.message };
    }
  }, [isAuthenticated, isOnline, user]);

  // Spielstände zurücksetzen - MIT BENUTZERSPEZIFISCHEN SCHLÜSSELN
  const resetGameData = useCallback(async () => {
    try {
      // Die zu löschenden Schlüssel
      const gameStateKeys = [
        'dailyWords', 
        'wordCategories', 
        'sentenceCategories', 
        'dailySentences', 
        'difficultWords', 
        'verbCategories',
        'customVerbs'
      ];
      
      // Die korrekte User-ID ermitteln
      const userId = user?.uid || user?._id;
      
      // Lokale Daten löschen mit benutzerspezifischen Schlüsseln
      if (userId) {
        gameStateKeys.forEach(key => {
          const storageKey = getUserStorageKey(key);
          localStorage.removeItem(storageKey);
          console.log(`Spielstand "${key}" zurückgesetzt.`);
        });
      } else {
        console.warn("Keine Benutzer-ID zum Zurücksetzen der Daten gefunden");
      }
      
      // Fortschritt auf 0 setzen, aber nicht komplett löschen
      const defaultProgress = { erstellt: 0, gelernt: 0, verben: 0, gesamtPunkte: 0 };
      const progressKey = getUserStorageKey('missionsFortschritt');
      localStorage.setItem(progressKey, JSON.stringify(defaultProgress));
      
      // Auch in Firebase zurücksetzen, wenn online
      if (isAuthenticated && user && isOnline && userId) {
        try {
          const batch = writeBatch(db);
          
          // Spielstände löschen (setze auf leere Objekte)
          gameStateKeys.forEach(key => {
            const docRef = doc(db, 'users', userId, 'gameData', key);
            batch.set(docRef, {
              data: {},
              updatedAt: Timestamp.now(),
              resetAt: Timestamp.now()
            });
          });
          
          // Fortschritt zurücksetzen
          const progressRef = doc(db, 'users', userId, 'gameData', 'missionsFortschritt');
          batch.set(progressRef, {
            data: defaultProgress,
            updatedAt: Timestamp.now(),
            resetAt: Timestamp.now()
          });
          
          await batch.commit();
          console.log("Alle Spielstände erfolgreich in Firebase zurückgesetzt.");
        } catch (error) {
          console.error("Fehler beim Zurücksetzen der Spielstände in Firebase:", error);
          // Weitermachen, auch wenn Firebase-Reset fehlschlägt
        }
      }
      
      return { 
        success: true, 
        message: "Spielstände erfolgreich zurückgesetzt! Bitte lade die Seite neu, um die Änderungen zu sehen." 
      };
    } catch (error) {
      console.error("Fehler beim Zurücksetzen der Spielstände:", error);
      return { success: false, message: "Zurücksetzen fehlgeschlagen: " + error.message };
    }
  }, [isAuthenticated, isOnline, user]);

  // Daten beim Logout bereinigen
  const clearUserData = useCallback(() => {
    // Die korrekte User-ID ermitteln
    const userId = user?.uid || user?._id;
    if (userId) {
      // Lokale Daten dieses Benutzers löschen
      clearUserLocalStorage(userId);
      console.log(`Lokale Daten für Benutzer ${userId} gelöscht.`);
    }
    
    // Alle zustandsbezogenen Daten zurücksetzen
    setSyncQueue({});
    setSyncStatus('idle');
    setSyncErrorCount(0);
    setSyncErrorItems({});
    setLastSync(null);
    
    return { success: true, message: "Benutzerdaten erfolgreich gelöscht." };
  }, [user]);

  // Warteschlange manuell leeren
  const clearSyncQueue = useCallback(() => {
    setSyncQueue({});
    setSyncErrorItems({});
    setSyncErrorCount(0);
    return { success: true, message: "Synchronisationswarteschlange geleert." };
  }, []);

  // Werte, die im Context zur Verfügung gestellt werden
  const value = {
    saveGameState,
    loadGameState,
    syncStatus,
    isOnline,
    apiUrl: API_URL,
    lastSync,
    forceSync,
    exportGameData,
    importGameData,
    resetGameData,
    syncFromFirebase,
    clearSyncQueue,
    clearUserData, // Neue Funktion zur Bereinigung der Benutzerdaten
    pendingSyncCount: Object.keys(syncQueue).length,
    syncErrorCount   // Für UI-Feedback
  };

  return (
    <GameSaveContext.Provider value={value}>
      {children}
    </GameSaveContext.Provider>
  );
};

export default GameSaveContext;
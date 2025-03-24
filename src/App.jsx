import { useState, useEffect } from 'react';
import { Navigate, Routes, Route, BrowserRouter } from 'react-router-dom';

// Komponenten Imports
import LearnGerman from './components/LearnGerman';
import SentenceStructureMenu from './components/SentenceStructureMenu';
import SentenceStructureGame from './components/SentenceStructureGame';
import LanguageFilter from './components/LanguageFilter';
import VerbEndings from './components/VerbEndings';
import SentenceCategories from './components/SentenceCategories';
import DailyWordView from './components/DailyWordView';
import DifficultWords from './components/DifficultWords';
import DailySentence from './components/DailySentence';
import VocabMenu from './components/VocabMenu';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProfileForm from './components/ProfileForm';
import LevelHeader from './components/LevelHeader/LevelHeader';
import LevelUpCelebration from './components/LevelUpCelebration';
import LicenseActivation from './components/LicenseActivation';
import GameSaveSync from './components/GameSaveSync';

// Kontext Imports
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameSaveProvider, useGameSave } from './contexts/GameSaveContext';
import * as S from './styles/App.styles';

// Inline SimpleMissionsFortschritt-Komponente
const SimpleMissionsFortschritt = ({ fortschritt }) => {
  // Sicherstellen, dass fortschritt immer ein gültiges Objekt ist
  const validFortschritt = {
    erstellt: fortschritt?.erstellt || 0,
    gelernt: fortschritt?.gelernt || 0,
    verben: fortschritt?.verben || 0,
    gesamtPunkte: fortschritt?.gesamtPunkte || 0
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
        <span style={{ color: '#93c5fd' }}>🧠 Wörter gelernt</span>
        <span style={{ color: 'white', fontWeight: 'bold' }}>{validFortschritt.gelernt}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
        <span style={{ color: '#93c5fd' }}>📝 Sätze erstellt</span>
        <span style={{ color: 'white', fontWeight: 'bold' }}>{validFortschritt.erstellt}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
        <span style={{ color: '#93c5fd' }}>🔄 Verben konjugiert</span>
        <span style={{ color: 'white', fontWeight: 'bold' }}>{validFortschritt.verben}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
        <span style={{ color: '#93c5fd' }}>🏆 Gesamt-Punkte</span>
        <span style={{ color: 'white', fontWeight: 'bold' }}>{validFortschritt.gesamtPunkte}</span>
      </div>
    </div>
  );
};

// Verbesserte fetchWithClient-Funktion für App.jsx
const fetchWithClient = async (url, options = {}) => {
  try {
    // Token aus localStorage holen
    const token = localStorage.getItem('token');
    
    // Prüfen, ob ein gültiges Token vorhanden ist, wenn die Anfrage an /api/auth/me geht
    if (url.includes('/api/auth/me')) {
      if (!token || token === 'undefined') {
        console.log('Kein gültiges Token für API-Anfrage vorhanden - überspringe Anfrage');
        return { 
          success: false, 
          authError: true, 
          message: 'Nicht authentifiziert' 
        };
      }
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };

    // Standard Browser-Fetch mit Try/Catch auf Anfrage-Ebene
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers
      });

      if (!response.ok) {
        // Bei 401-Fehlern sofort ein spezielles Objekt zurückgeben
        if (response.status === 401) {
          console.log('Authentifizierungsfehler - lokale Prozesse werden fortgesetzt');
          return { 
            success: false, 
            authError: true, 
            message: 'Authentifizierungsfehler - lokale Daten werden verwendet' 
          };
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (fetchError) {
      // Besonderes Handling für Netzwerkfehler
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        console.warn('Netzwerkfehler bei API-Anfrage:', fetchError.message);
        return {
          success: false,
          networkError: true,
          message: 'Netzwerkfehler - lokale Daten werden verwendet'
        };
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    
    // Bei 401-Fehlern besondere Behandlung
    if (error.message && error.message.includes('401')) {
      return { 
        success: false, 
        authError: true, 
        message: 'Authentifizierungsfehler - lokale Daten werden verwendet' 
      };
    }
    
    throw error;
  }
};

const hasStateChanged = (key, currentState) => {
  try {
    // Gespeicherten Zustand aus sessionStorage laden
    const lastSyncedState = sessionStorage.getItem(`lastSynced_${key}`);
    if (!lastSyncedState) return true; // Wenn noch nie synchronisiert, dann ja
    
    // Vergleichen (stringifiziert)
    return JSON.stringify(currentState) !== lastSyncedState;
  } catch (error) {
    console.error(`Fehler beim Vergleichen des Zustands für ${key}:`, error);
    return true; // Im Zweifelsfall synchronisieren
  }
};

// Funktion zum Aktualisieren des synchronisierten Zustands
const updateLastSyncedState = (key, state) => {
  try {
    sessionStorage.setItem(`lastSynced_${key}`, JSON.stringify(state));
  } catch (error) {
    console.error(`Fehler beim Speichern des Zustands für ${key}:`, error);
  }
};
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <S.LoadingContainer>
        <S.LoadingSpinner>Laden...</S.LoadingSpinner>
      </S.LoadingContainer>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// LicenseProtectedRoute Component
const LicenseProtectedRoute = ({ children }) => {
  const [hasValidLicense, setHasValidLicense] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Prüfen, ob eine gültige Lizenz gespeichert ist
    try {
      const savedLicense = localStorage.getItem('dazConnectLicense');
      
      if (savedLicense) {
        const licenseInfo = JSON.parse(savedLicense);
        const expiryDate = new Date(licenseInfo.expiryDate);
        const currentDate = new Date();
        
        if (currentDate <= expiryDate) {
          setHasValidLicense(true);
        }
      }
    } catch (error) {
      console.error('Fehler beim Überprüfen der Lizenz:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);
  
  if (isChecking) {
    return (
      <S.LoadingContainer>
        <S.LoadingSpinner>Lizenz wird überprüft...</S.LoadingSpinner>
      </S.LoadingContainer>
    );
  }
  
  return hasValidLicense ? children : <LicenseActivation onLicenseActivated={() => setHasValidLicense(true)} />;
};

// Main App Component
const MainAppContent = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { saveGameState, loadGameState, syncStatus, isOnline } = useGameSave();
  const [currentView, setCurrentView] = useState('main');
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [sentenceLevel, setSentenceLevel] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  // Neuer State zur Vermeidung von Endlosschleifen bei der Synchronisation
  const [syncInProgress, setSyncInProgress] = useState(false);
  // Neue State-Variable für API-Authentifizierung
  const [apiAuthenticated, setApiAuthenticated] = useState(false);

  // Überprüfe einmalig bei Initialisierung, ob ein gültiges Token existiert
  useEffect(() => {
    const token = localStorage.getItem('token');
    setApiAuthenticated(!!token && token !== 'undefined');
  }, []);

  // Words State Management
  const [words, setWords] = useState(() => {
    try {
      const saved = localStorage.getItem('dailyWords');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Fehler beim Laden der täglichen Wörter:', error);
      return [];
    }
  });

  // Categories State Management
  const [wordCategories, setWordCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('wordCategories');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Fehler beim Laden der Wortkategorien:', error);
      return [];
    }
  });

  const [sentenceCategories, setSentenceCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('sentenceCategories');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Fehler beim Laden der Satzkategorien:', error);
      return [];
    }
  });

  // Sentences State Management
  const [sentences, setSentences] = useState(() => {
    try {
      const saved = localStorage.getItem('dailySentences');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Fehler beim Laden der Sätze:', error);
      return [];
    }
  });

  // Difficult Words State Management
  const [difficultWords, setDifficultWords] = useState(() => {
    try {
      const saved = localStorage.getItem('difficultWords');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Fehler beim Laden der schwierigen Wörter:', error);
      return {};
    }
  });

  // Missions Fortschritt State Management
  const [missionsFortschritt, setMissionsFortschritt] = useState(() => {
    try {
      const gespeichert = localStorage.getItem('missionsFortschritt');
      return gespeichert ? JSON.parse(gespeichert) : {
        erstellt: 0,
        gelernt: 0,
        verben: 0,
        gesamtPunkte: 0
      };
    } catch (error) {
      console.error('Fehler beim Laden des Missions-Fortschritts:', error);
      return {
        erstellt: 0,
        gelernt: 0,
        verben: 0,
        gesamtPunkte: 0
      };
    }
  });

  // Word Category Management Functions
  const handleAddWordCategory = (name, parentId = null) => {
    const newCategory = {
      id: Date.now().toString(),
      name,
      parentId,
      path: parentId 
        ? [...wordCategories.find(c => c.id === parentId).path, name]
        : [name]
    };

    const updatedCategories = [...wordCategories, newCategory];
    setWordCategories(updatedCategories);
    localStorage.setItem('wordCategories', JSON.stringify(updatedCategories));
    handleMissionComplete('erstellt');
    return newCategory.id;
  };

  const deleteWordCategory = (categoryId) => {
    const childCategories = wordCategories.filter(cat => cat.parentId === categoryId);
    const categoryIds = [categoryId, ...childCategories.map(cat => cat.id)];

    const updatedCategories = wordCategories.filter(cat => !categoryIds.includes(cat.id));
    setWordCategories(updatedCategories);
    localStorage.setItem('wordCategories', JSON.stringify(updatedCategories));

    const updatedWords = words.filter(word => !categoryIds.includes(word.category));
    setWords(updatedWords);
    localStorage.setItem('dailyWords', JSON.stringify(updatedWords));
  };

  // Sentence Category Management Functions
  const handleAddSentenceCategory = (name, parentId = null) => {
    const newCategory = {
      id: Date.now().toString(),
      name,
      parentId,
      path: parentId 
        ? [...sentenceCategories.find(c => c.id === parentId).path, name]
        : [name]
    };

    const updatedCategories = [...sentenceCategories, newCategory];
    setSentenceCategories(updatedCategories);
    localStorage.setItem('sentenceCategories', JSON.stringify(updatedCategories));
    handleMissionComplete('erstellt');
    return newCategory.id;
  };

  const deleteSentenceCategory = (categoryId) => {
    const childCategories = sentenceCategories.filter(cat => cat.parentId === categoryId);
    const categoryIds = [categoryId, ...childCategories.map(cat => cat.id)];

    const updatedCategories = sentenceCategories.filter(cat => !categoryIds.includes(cat.id));
    setSentenceCategories(updatedCategories);
    localStorage.setItem('sentenceCategories', JSON.stringify(updatedCategories));

    const updatedSentences = sentences.filter(sentence => !categoryIds.includes(sentence.category));
    setSentences(updatedSentences);
    localStorage.setItem('dailySentences', JSON.stringify(updatedSentences));
  };

  // Word Result Handler - VERBESSERTE VERSION
  const handleWordResult = (word, isCorrect, source) => {
    if (!isCorrect) {
      // Stelle sicher, dass die Quelle (source) richtig gesetzt ist
      const sourceValue = source || word.source || 'unknown';
      
      // Konsistenten Schlüssel erstellen
      const wordKey = `${word.german}-${word.category || 'learn'}`;
      const existingWord = difficultWords[wordKey];
      
      const updatedDifficultWords = {
        ...difficultWords,
        [wordKey]: {
          word: word,
          source: sourceValue,
          failCount: (existingWord?.failCount || 0) + 1,
          wrongCount: (existingWord?.wrongCount || 0) + 1, // Beide Zähler aktualisieren
          lastFailed: new Date().toISOString(),
          correctCount: existingWord?.correctCount || 0
        }
      };
      
      setDifficultWords(updatedDifficultWords);
      localStorage.setItem('difficultWords', JSON.stringify(updatedDifficultWords));
    } else {
      handleMissionComplete('gelernt');
      
      // Bei korrekter Antwort den richtigen Schlüssel finden
      const wordKey = `${word.german}-${word.category || 'learn'}`;
      
      if (difficultWords[wordKey]) {
        const existingWord = difficultWords[wordKey];
        
        if (existingWord.correctCount >= 2) {
          // Wort aus der Liste entfernen, wenn es 3x richtig beantwortet wurde
          const { [wordKey]: removed, ...rest } = difficultWords;
          setDifficultWords(rest);
          localStorage.setItem('difficultWords', JSON.stringify(rest));
        } else {
          // Zähler für korrekte Antworten erhöhen
          const updatedDifficultWords = {
            ...difficultWords,
            [wordKey]: {
              ...existingWord,
              correctCount: (existingWord.correctCount || 0) + 1
            }
          };
          setDifficultWords(updatedDifficultWords);
          localStorage.setItem('difficultWords', JSON.stringify(updatedDifficultWords));
        }
      }
    }
  };

  // Auth Effect: Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setSelectedLanguages(user.selectedLanguages);
      setMissionsFortschritt({
        erstellt: user.progress.missions.erstellt || 0,
        gelernt: user.progress.missions.gelernt || 0,
        verben: user.progress.missions.verben || 0,
        gesamtPunkte: user.progress.totalScore || 0
      });
      setCurrentLevel(Math.floor(user.progress.totalScore / 100) + 1);
      
      // Setze apiAuthenticated auf true, wenn der Benutzer authentifiziert ist
      const token = localStorage.getItem('token');
      setApiAuthenticated(!!token && token !== 'undefined');
    } else {
      setApiAuthenticated(false);
    }
  }, [isAuthenticated, user]);

  // Firebase Integration: Laden der Spielstände bei Authentifizierung
  useEffect(() => {
    const loadGameStates = async () => {
      if (isAuthenticated) {
        try {
          // Lade gespeicherte Daten aus Firebase
          const savedWords = await loadGameState('dailyWords');
          if (savedWords) setWords(savedWords);
          
          const savedWordCategories = await loadGameState('wordCategories');
          if (savedWordCategories) setWordCategories(savedWordCategories);
          
          const savedSentenceCategories = await loadGameState('sentenceCategories');
          if (savedSentenceCategories) setSentenceCategories(savedSentenceCategories);
          
          const savedSentences = await loadGameState('dailySentences');
          if (savedSentences) setSentences(savedSentences);
          
          const savedDifficultWords = await loadGameState('difficultWords');
          if (savedDifficultWords) setDifficultWords(savedDifficultWords);
          
          const savedMissionsFortschritt = await loadGameState('missionsFortschritt');
          if (savedMissionsFortschritt) setMissionsFortschritt(savedMissionsFortschritt);
        } catch (error) {
          console.error('Fehler beim Laden der Spielstände:', error);
        }
      }
    };
    
    loadGameStates();
  }, [isAuthenticated, loadGameState]);

  // Firebase Integration: Speichern der Daten bei Änderungen - KOMBINIERTER ANSATZ
  // Ersetzt alle einzelnen useEffects durch einen einzigen
 // Ersetze mit einem Debounce-Ansatz
 // Ersetzen Sie die bestehende useEffect-Implementierung mit dieser Version
 useEffect(() => {
  // Wenn nicht authentifiziert oder bereits Synchronisation läuft, nichts tun
  if (!isAuthenticated || syncInProgress) return;

  console.log("Auto-Sync Effekt wird ausgeführt...");
  
  // Timeout für Debounce erstellen
  const syncTimeoutId = setTimeout(() => {
    // Wenn nach der Verzögerung immer noch nicht synchronisiert wird
    if (!syncInProgress) {
      setSyncInProgress(true);
      
      // Liste der zu synchronisierenden Zustände mit ihren Bedingungen
      const statesToSync = [
        { key: 'dailyWords', data: words, condition: words.length > 0 },
        { key: 'wordCategories', data: wordCategories, condition: wordCategories.length > 0 },
        { key: 'sentenceCategories', data: sentenceCategories, condition: sentenceCategories.length > 0 },
        { key: 'dailySentences', data: sentences, condition: sentences.length > 0 },
        { key: 'difficultWords', data: difficultWords, condition: Object.keys(difficultWords).length > 0 },
        { key: 'missionsFortschritt', data: missionsFortschritt, condition: true }
      ];

      // Finde Zustände, die die Bedingung erfüllen UND sich geändert haben
      const filledStates = statesToSync
        .filter(state => state.condition)
        .filter(state => hasStateChanged(state.key, state.data));
      
      if (filledStates.length > 0) {
        console.log(`Auto-Sync: Starte Synchronisation von ${filledStates.length} Zuständen...`);
        
        // Erstelle ein Array von Promises für alle zu synchronisierenden Zustände
        const syncPromises = filledStates.map(state => {
          console.log(`Auto-Sync: Synchronisiere ${state.key}...`);
          return saveGameState(state.key, state.data).then(() => {
            // Nach erfolgreicher Synchronisierung den Zustand speichern
            updateLastSyncedState(state.key, state.data);
            return state.key; // Rückgabewert für die Promise
          });
        });
        
        // Warte auf die Ausführung aller Promises
        Promise.all(syncPromises)
          .then(syncedKeys => {
            console.log(`Auto-Sync: Folgende Zustände wurden synchronisiert: ${syncedKeys.join(', ')}`);
          })
          .catch(error => {
            console.error("Fehler bei der Auto-Synchronisation:", error);
          })
          .finally(() => {
            // Verzögerung, um zu verhindern, dass sofort wieder eine Sync ausgelöst wird
            setTimeout(() => {
              console.log("Auto-Sync abgeschlossen, setze syncInProgress auf false");
              setSyncInProgress(false);
            }, 2000); // Kürzere Verzögerung (2 Sekunden)
          });
      } else {
        console.log("Auto-Sync: Keine Änderungen gefunden, keine Synchronisation notwendig");
        // Sofort den Sync-Status zurücksetzen, wenn nichts zu synchronisieren ist
        setSyncInProgress(false);
      }
    }
  }, 2000); // Kürzere Verzögerung (2 Sekunden)

  return () => {
    clearTimeout(syncTimeoutId);
    console.log("Auto-Sync: Timeout aufgeräumt");
  };
}, [
  isAuthenticated, 
  syncInProgress, 
  words, 
  wordCategories, 
  sentenceCategories, 
  sentences, 
  difficultWords, 
  missionsFortschritt,
  saveGameState
]); // Alle Abhängigkeiten einschließen

  // Sync progress with backend - MIT VERBESSERTER FEHLERBEHANDLUNG
  useEffect(() => {
    if (isAuthenticated) {
      const updateProgress = async () => {
        // Überprüfe API-Authentifizierungsstatus
        if (!apiAuthenticated) {
          console.log('API nicht authentifiziert - überspringe Server-Synchronisation');
          return; // Früher Return, um die Anfrage ganz zu vermeiden
        }
        
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
          
          const result = await fetchWithClient(`${API_URL}/api/auth/me`, {
            method: 'PATCH',
            body: JSON.stringify({
              progress: {
                missions: {
                  erstellt: missionsFortschritt.erstellt,
                  gelernt: missionsFortschritt.gelernt,
                  verben: missionsFortschritt.verben
                },
                gesamtPunkte: missionsFortschritt.gesamtPunkte
              }
            })
          });
          
          // Prüfen, ob das Ergebnis einen Authentifizierungsfehler enthält
          if (result && result.authError) {
            setApiAuthenticated(false);
            console.log('Fortschritt lokal aktualisiert, aber nicht mit Server synchronisiert');
          } else {
            console.log('Fortschritt aktualisiert');
          }
        } catch (error) {
          setApiAuthenticated(false);
          console.error('Fehler beim Aktualisieren des Fortschritts:', error);
        }
      };
      updateProgress();
    }
  }, [missionsFortschritt, isAuthenticated, apiAuthenticated]);

  // Verbesserte handleMissionComplete mit besserer Fehlerbehandlung
  // Verbesserte handleMissionComplete mit optionalem Level-Up-Dialog
const handleMissionComplete = async (missionsTyp, anzahl = 1, showLevelUpPopup = true) => {
  const neuerFortschritt = {
    ...missionsFortschritt,
    [missionsTyp]: missionsFortschritt[missionsTyp] + anzahl,
    gesamtPunkte: missionsFortschritt.gesamtPunkte + (anzahl * 10)
  };

  // Berechne das neue Level
  const newLevel = Math.floor(neuerFortschritt.gesamtPunkte / 100) + 1;
  
  // Level-Up nur anzeigen, wenn:
  // 1. Ein Level-Up stattgefunden hat
  // 2. showLevelUpPopup auf true gesetzt ist
  if (newLevel > currentLevel && showLevelUpPopup) {
    setCurrentLevel(newLevel);
    setShowLevelUp(true);
  } else {
    // Auch bei Level-Up ohne Popup das aktuelle Level aktualisieren
    if (newLevel > currentLevel) {
      setCurrentLevel(newLevel);
    }
  }

  setMissionsFortschritt(neuerFortschritt);

  if (isAuthenticated && apiAuthenticated) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      
      const result = await fetchWithClient(`${API_URL}/api/auth/me`, {
        method: 'PATCH',
        body: JSON.stringify({
          progress: {
            missions: {
              erstellt: neuerFortschritt.erstellt,
              gelernt: neuerFortschritt.gelernt,
              verben: neuerFortschritt.verben
            },
            gesamtPunkte: neuerFortschritt.gesamtPunkte
          }
        })
      });
      
      // Prüfen, ob das Ergebnis einen Authentifizierungsfehler enthält
      if (result && result.authError) {
        setApiAuthenticated(false);
        console.log('Fortschritt lokal aktualisiert, aber nicht mit Server synchronisiert');
      }
    } catch (error) {
      setApiAuthenticated(false);
      console.error('Fehler beim Aktualisieren des Missions-Fortschritts:', error);
    }
  } else if (isAuthenticated) {
    console.log('API nicht authentifiziert - überspringe Server-Synchronisation');
  }
};

  // Language Toggle Handler - MIT VERBESSERTER FEHLERBEHANDLUNG
  const handleLanguageToggle = async (language) => {
    const newSelection = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language];
    
    if (newSelection.length === 0) return;
    
    setSelectedLanguages(newSelection);
  
    if (isAuthenticated && apiAuthenticated) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        
        const result = await fetchWithClient(`${API_URL}/api/auth/me`, {
          method: 'PATCH',
          body: JSON.stringify({
            selectedLanguages: newSelection
          })
        });
        
        // Prüfen, ob das Ergebnis einen Authentifizierungsfehler enthält
        if (result && result.authError) {
          setApiAuthenticated(false);
          console.log('Sprachenauswahl lokal aktualisiert, aber nicht mit Server synchronisiert');
        }
      } catch (error) {
        setApiAuthenticated(false);
        console.log('Fehler beim Aktualisieren der Sprachenauswahl:', error.message);
      }
    } else if (isAuthenticated) {
      console.log('API nicht authentifiziert - überspringe Server-Synchronisation');
    }
  };

  // Navigation Handlers
  const handleBack = () => {
    setCurrentView('main');
    setActiveSubmenu(null);
    setSentenceLevel(null);
  };

  const handleVocabMenuSelect = (option) => {
    const viewMapping = {
      'daily': 'dailyWord',
      'learn': 'learnVocab',
      'difficult': 'difficultWords'
    };
    
    setActiveSubmenu(option);
    setCurrentView(viewMapping[option]);
  };

  const handleReturnToVocabMenu = () => {
    setCurrentView('learn');
    setActiveSubmenu(null);
  };

  if (loading) {
    return <S.LoadingSpinner>Laden...</S.LoadingSpinner>;
  }

  return (
    <S.AppContainer>
      <S.StarsBackground />
      
      <S.MainContent>
        <S.Card>
          {currentView === 'main' ? (
            <>
              <LevelHeader 
                user={user} 
                missionProgress={{
                  vokabeln: missionsFortschritt.gelernt,
                  satzbau: missionsFortschritt.erstellt,
                  verben: missionsFortschritt.verben,
                  totalScore: missionsFortschritt.gesamtPunkte
                }}
                logout={logout}
                onProfileClick={() => setCurrentView('profile')}
              />

              <S.ContentSection>
                <LanguageFilter
                  selectedLanguages={selectedLanguages}
                  onLanguageToggle={handleLanguageToggle}
                />
                
                <S.MissionGroup>
                  <S.MissionButton onClick={() => setCurrentView('learn')}>
                    <S.MissionContent>
                      <S.PlanetIcon>🌍</S.PlanetIcon>
                      <S.MissionInfo>
                        <S.MissionTitle>Vokabel-Training</S.MissionTitle>
                        <S.MissionDescription>Neue Wörter und Übungen</S.MissionDescription>
                      </S.MissionInfo>
                    </S.MissionContent>
                  </S.MissionButton>

                  <S.MissionButton onClick={() => setCurrentView('sentence')}>
                    <S.MissionContent>
                      <S.PlanetIcon>🌌</S.PlanetIcon>
                      <S.MissionInfo>
                        <S.MissionTitle>Satzstruktur</S.MissionTitle>
                        <S.MissionDescription>Grammatik und Satzbau</S.MissionDescription>
                      </S.MissionInfo>
                    </S.MissionContent>
                  </S.MissionButton>

                  <S.MissionButton onClick={() => setCurrentView('verbEndings')}>
                    <S.MissionContent>
                      <S.PlanetIcon>🌠</S.PlanetIcon>
                      <S.MissionInfo>
                        <S.MissionTitle>Verb-Training</S.MissionTitle>
                        <S.MissionDescription>Verben und Konjugationen</S.MissionDescription>
                      </S.MissionInfo>
                    </S.MissionContent>
                  </S.MissionButton>
                  
                  {/* Option für Spielstand-Synchronisation */}
                  <S.MissionButton onClick={() => setCurrentView('savesync')}>
                    <S.MissionContent>
                      <S.PlanetIcon>💾</S.PlanetIcon>
                      <S.MissionInfo>
                        <S.MissionTitle>Spielstände</S.MissionTitle>
                        <S.MissionDescription>Synchronisieren und verwalten</S.MissionDescription>
                      </S.MissionInfo>
                    </S.MissionContent>
                  </S.MissionButton>
                </S.MissionGroup>

                <S.ProgressSection>
                  <S.ProgressTitle>
                    <span>📡</span> Missions-Fortschritt
                  </S.ProgressTitle>
                  
                  {/* Direkt eingefügter Fortschritt ohne externe Komponenten */}
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                      <span style={{ color: '#93c5fd' }}>🧠 Wörter gelernt</span>
                      <span style={{ color: 'white', fontWeight: 'bold' }}>{missionsFortschritt.gelernt}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                      <span style={{ color: '#93c5fd' }}>📝 Erstellte Elemente</span>
                      <span style={{ color: 'white', fontWeight: 'bold' }}>{missionsFortschritt.erstellt}</span>
                    </div>
                   
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                      <span style={{ color: '#93c5fd' }}>🏆 Gesamt-Punkte</span>
                      <span style={{ color: 'white', fontWeight: 'bold' }}>{missionsFortschritt.gesamtPunkte}</span>
                    </div>
                  </div>
                  
                  {/* Online/Offline Status-Anzeige */}
                  <div style={{ marginTop: '15px', fontSize: '12px', textAlign: 'center', color: '#93c5fd' }}>
                    {isOnline ? '🌐 Online' : '📵 Offline'} • 
                    Sync: {syncStatus === 'synced' ? '✅' : 
                            syncStatus === 'syncing' ? '🔄' : 
                            syncStatus === 'error' ? '❌' : '⏳'}
                  </div>
                </S.ProgressSection>
              </S.ContentSection>
            </>
          ) : (
            <>
              <S.SubHeader>
                <S.BackButton onClick={handleBack}>
                  <span>←</span> Zurück zur Kommandozentrale
                </S.BackButton>
                <S.SubTitle>
                  {currentView === 'learn' && 'Vokabel-Training'}
                  {currentView === 'learnVocab' && 'Vokabeln lernen'}
                  {currentView === 'dailyWord' && 'Wort des Tages'}
                  {currentView === 'difficultWords' && 'Schwierige Wörter'}
                  {currentView === 'sentence' && 'Satzstruktur'}
                  {currentView === 'sentenceStructure' && 'Satzstruktur lernen'}
                  {currentView === 'dailySentence' && 'Satz des Tages'}
                  {currentView === 'verbEndings' && 'Verb-Training'}
                  {currentView === 'savesync' && 'Spielstände verwalten'}
                </S.SubTitle>
              </S.SubHeader>

              <S.SubContent>
                {currentView === 'learn' && !activeSubmenu && (
                  <VocabMenu onSelectOption={handleVocabMenuSelect} />
                )}

                {currentView === 'learnVocab' && (
                  <LearnGerman 
                    selectedLanguages={selectedLanguages}
                    onComplete={() => handleMissionComplete('gelernt')}
                    onBack={handleReturnToVocabMenu}
                    onWordResult={handleWordResult}
                  />
                )}

                {currentView === 'dailyWord' && (
                  <DailyWordView
                    words={words}
                    categories={wordCategories}
                    selectedLanguages={selectedLanguages}
                    onBack={handleReturnToVocabMenu}
                    onAddWord={(word) => {
                      const newWord = { ...word, id: Date.now().toString() };
                      const updatedWords = [...words, newWord];
                      setWords(updatedWords);
                      localStorage.setItem('dailyWords', JSON.stringify(updatedWords));
                      // Level-Up-Dialog deaktivieren für Worthinzufügung
                      handleMissionComplete('erstellt', 1, false);
                    }}
                    onDeleteWord={(wordId) => {
                      const updatedWords = words.filter(w => w.id !== wordId);
                      setWords(updatedWords);
                      localStorage.setItem('dailyWords', JSON.stringify(updatedWords));
                    }}
                    onAddCategory={handleAddWordCategory}
                    onDeleteCategory={deleteWordCategory}
                    onWordResult={(word, isCorrect) => handleWordResult(word, isCorrect, 'daily')}
                  />
                )}

                {currentView === 'difficultWords' && (
                  <DifficultWords
                    difficultWords={difficultWords}
                    selectedLanguages={selectedLanguages}
                    onComplete={() => handleMissionComplete('gelernt')}
                    onBack={handleReturnToVocabMenu}
                    onWordResult={(word, isCorrect) => handleWordResult(word, isCorrect, word.source || 'daily')} 
                    onDeleteWord={(wordKey) => {
                      const newDifficultWords = { ...difficultWords };
                      delete newDifficultWords[wordKey];
                      setDifficultWords(newDifficultWords);
                      localStorage.setItem('difficultWords', JSON.stringify(newDifficultWords));
                    }}
                    wordCategories={wordCategories}
                    dailyWords={words}
                  />
                )}

                {currentView === 'sentence' && (
                  <SentenceCategories 
                    onSelectCategory={(category) => {
                      switch(category) {
                        case 'structure':
                          setCurrentView('sentenceStructure');
                          break;
                        case 'dailySentence':
                          setCurrentView('dailySentence');
                          break;
                      }
                    }}
                  />
                )}

                {currentView === 'sentenceStructure' && (
                  sentenceLevel ? (
                    <SentenceStructureGame 
                      level={sentenceLevel} 
                      onBack={() => setSentenceLevel(null)}
                      selectedLanguages={selectedLanguages}
                      onComplete={() => handleMissionComplete('erstellt')}
                    />
                  ) : (
                    <SentenceStructureMenu 
                      onSelectLevel={(level) => setSentenceLevel(level)} 
                    />
                  )
                )}

                {currentView === 'dailySentence' && (
                  <DailySentence
                    sentences={sentences}
                    categories={sentenceCategories}
                    selectedLanguages={selectedLanguages}
                    onComplete={() => handleMissionComplete('erstellt')}
                    onAddSentence={(sentence) => {
                      const newSentence = { ...sentence, id: Date.now().toString() };
                      const updatedSentences = [...sentences, newSentence];
                      setSentences(updatedSentences);
                      localStorage.setItem('dailySentences', JSON.stringify(updatedSentences));
                      handleMissionComplete('erstellt');
                    }}
                    onDeleteSentence={(sentenceId) => {
                      const updatedSentences = sentences.filter(s => s.id !== sentenceId);
                      setSentences(updatedSentences);
                      localStorage.setItem('dailySentences', JSON.stringify(updatedSentences));
                    }}
                    onAddCategory={handleAddSentenceCategory}
                    onDeleteCategory={deleteSentenceCategory}
                  />
                )}

                {currentView === 'verbEndings' && (
                  <VerbEndings 
                    onBack={handleBack}
                    selectedLanguages={selectedLanguages}
                    onComplete={() => handleMissionComplete('verben')}
                  />
                )}

                {currentView === 'profile' && (
                  <ProfileForm />
                )}
                
                {currentView === 'savesync' && (
                  <GameSaveSync />
                )}
              </S.SubContent>
            </>
          )}
        </S.Card>
      </S.MainContent>

      <LevelUpCelebration 
        level={currentLevel}
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
      />
    </S.AppContainer>
  );
};

// Die App-Komponente mit dem entsprechenden Router
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameSaveProvider>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route 
              path="/" 
              element={
                <LicenseProtectedRoute>
                  <ProtectedRoute>
                    <MainAppContent />
                  </ProtectedRoute>
                </LicenseProtectedRoute>
              } 
            />
          </Routes>
        </GameSaveProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

// WICHTIG: Der default-Export, der in main.jsx importiert wird
export default App;
                  
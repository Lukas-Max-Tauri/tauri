import React, { useState, useEffect } from 'react';
import { verbData, verbTemplate } from '../data/verbData';
import './VerbEndings.css';
import AudioButton from './AudioButton';
import { useGameSave } from '../contexts/GameSaveContext'; // GameSave-Context importieren

function VerbEndings({ onBack, selectedLanguages, onComplete }) {
  const { saveGameState, loadGameState } = useGameSave(); // GameSave-Context verwenden
  const [mode, setMode] = useState('select');
  const [gameVerbs, setGameVerbs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customVerbs, setCustomVerbs] = useState([]);

  // Language configuration for all supported languages
  const languageConfig = {
    english: { flag: '🇬🇧', label: 'Englisch', code: 'en-GB' },
    spanish: { flag: '🇪🇸', label: 'Spanisch', code: 'es-ES' },
    turkish: { flag: '🇹🇷', label: 'Türkisch', code: 'tr-TR' },
    arabic: { flag: '🇸🇦', label: 'Arabisch', code: 'ar-XA' },
    ukrainian: { flag: '🇺🇦', label: 'Ukrainisch', code: 'uk-UA' },
    russian: { flag: '🇷🇺', label: 'Russisch', code: 'ru-RU' },
    polish: { flag: '🇵🇱', label: 'Polnisch', code: 'pl-PL' },
    romanian: { flag: '🇷🇴', label: 'Rumänisch', code: 'ro-RO' },
    italian: { flag: '🇮🇹', label: 'Italienisch', code: 'it-IT' },
    ku: { flag: '🇹🇯', label: 'Kurdisch', code: 'tr-TR' },
    farsi: { flag: '🇮🇷', label: 'Farsi', code: 'ar-XA' },
    albanian: { flag: '🇦🇱', label: 'Albanisch', code: 'it-IT' },
    serbian: { flag: '🇷🇸', label: 'Serbisch', code: 'ru-RU' },
    pashto: { flag: '🇦🇫', label: 'Paschtu', code: 'ar-XA' },
    somali: { flag: '🇸🇴', label: 'Somali', code: 'ar-XA' },
    tigrinya: { flag: '🇪🇷', label: 'Tigrinya', code: 'ar-XA' }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Lade Daten über den GameSave-Context statt direkt aus localStorage
        const savedCategories = await loadGameState('verbCategories');
        if (savedCategories) {
          setCategories(savedCategories);
        }
        
        const savedVerbs = await loadGameState('customVerbs');
        if (savedVerbs) {
          setCustomVerbs(savedVerbs);
          verbData.custom = savedVerbs;
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };
    
    loadData();
  }, [loadGameState]);

  const handleDeleteCategory = (categoryId) => {
    const getSubcategories = (catId) => {
      const subcats = categories.filter(c => c.parentId === catId);
      return [catId, ...subcats.flatMap(sub => getSubcategories(sub.id))];
    };
    
    const categoryIdsToDelete = getSubcategories(categoryId);
    const currentCategory = categories.find(c => c.id === categoryId);
    const subcategories = categoryIdsToDelete.slice(1);
    
    const verbsInCategories = verbData.custom.filter(verb => 
      categoryIdsToDelete.includes(verb.category)
    );

    let confirmMessage = `Möchtest du den Ordner "${currentCategory.name}" wirklich löschen?`;
    
    if (subcategories.length > 0) {
      confirmMessage += `\n\nDieser Ordner enthält ${subcategories.length} Unterordner.`;
    }
    
    if (verbsInCategories.length > 0) {
      confirmMessage += `\n\nDieser Ordner und seine Unterordner enthalten insgesamt ${verbsInCategories.length} Verb${
        verbsInCategories.length === 1 ? '' : 'en'
      }.`;
    }

    confirmMessage += '\n\nDieser Vorgang kann nicht rückgängig gemacht werden.';
    
    const confirmDelete = window.confirm(confirmMessage);
    if (!confirmDelete) return;

    const newCategories = categories.filter(cat => 
      !categoryIdsToDelete.includes(cat.id)
    );
    setCategories(newCategories);
    // Speichern über GameSave statt localStorage
    saveGameState('verbCategories', newCategories);

    const newVerbs = verbData.custom.filter(verb => 
      !categoryIdsToDelete.includes(verb.category)
    );
    setCustomVerbs(newVerbs);
    // Speichern über GameSave statt localStorage
    saveGameState('customVerbs', newVerbs);
    verbData.custom = newVerbs;
  };

  const handleAddCategory = (name, parentId = null) => {
    const newCategory = {
      id: Date.now().toString(),
      name,
      parentId,
      path: parentId 
        ? [...categories.find(c => c.id === parentId).path, name]
        : [name]
    };
    
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    // Speichern über GameSave statt localStorage
    saveGameState('verbCategories', newCategories);
  };

  const handleSaveVerb = (verb) => {
    const newVerb = {
      ...verb,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    const newVerbs = [...customVerbs, newVerb];
    setCustomVerbs(newVerbs);
    // Speichern über GameSave statt localStorage
    saveGameState('customVerbs', newVerbs);
    verbData.custom = newVerbs;
  };

  // Verb Type Selection Component
  const VerbTypeSelection = ({ onStartGame, onCreateVerb, categories }) => {
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [error, setError] = useState('');

    const handleStartGame = () => {
      if (selectedTypes.length === 0 && selectedCategories.length === 0) {
        setError('Bitte wähle mindestens einen Verbtyp oder eine Kategorie aus');
        return;
      }
      
      let gameVerbs = [];

      // Sammle alle Verben basierend auf der Auswahl
      if (selectedTypes.includes('regular')) {
        gameVerbs = [...gameVerbs, ...verbData.regular];
      }
      if (selectedTypes.includes('irregular')) {
        gameVerbs = [...gameVerbs, ...verbData.irregular];
      }
      if (selectedCategories.length > 0) {
        const categoryVerbs = verbData.custom.filter(verb => 
          selectedCategories.includes(verb.category)
        );
        gameVerbs = [...gameVerbs, ...categoryVerbs];
      }
      else if (selectedTypes.includes('custom')) {
        gameVerbs = [...gameVerbs, ...verbData.custom];
      }

      if (gameVerbs.length === 0) {
        setError('Keine Verben in den ausgewählten Kategorien gefunden');
        return;
      }

      // Stelle sicher, dass mehr als 2 Verben existieren
      console.log(`Anzahl der Verben vor dem Mischen: ${gameVerbs.length}`);
      
      // Zufällige Sortierung der Verben
      const shuffledVerbs = [...gameVerbs].sort(() => Math.random() - 0.5);
      
      console.log(`Anzahl der Verben nach dem Mischen: ${shuffledVerbs.length}`);
      console.log('Verben:', shuffledVerbs.map(v => v.verb || v.stems?.ich || 'Unbekannt').join(', '));
      
      onStartGame(shuffledVerbs);
    };

    return (
      <div className="verb-endings-container">
        <h3 className="verb-endings-title">Verbtypen auswählen</h3>
        
        <div className="verb-category-selection">
          <div className="verb-selection-group">
            <div className="verb-selection-title">Standard-Verben:</div>
            <label className="verb-checkbox-label">
              <input
                type="checkbox"
                checked={selectedTypes.includes('regular')}
                onChange={() => {
                  setSelectedTypes(prev => 
                    prev.includes('regular')
                      ? prev.filter(t => t !== 'regular')
                      : [...prev, 'regular']
                  );
                  setError('');
                }}
              />
              <span>Regelmäßige Verben</span>
            </label>
            <label className="verb-checkbox-label">
              <input
                type="checkbox"
                checked={selectedTypes.includes('irregular')}
                onChange={() => {
                  setSelectedTypes(prev => 
                    prev.includes('irregular')
                      ? prev.filter(t => t !== 'irregular')
                      : [...prev, 'irregular']
                  );
                  setError('');
                }}
              />
              <span>Unregelmäßige Verben</span>
            </label>
          </div>

          {customVerbs.length > 0 && (
            <div className="verb-selection-group">
              <div className="verb-selection-title">Eigene Verben:</div>
              <label className="verb-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes('custom')}
                  onChange={() => {
                    setSelectedTypes(prev => {
                      const newTypes = prev.includes('custom')
                        ? prev.filter(t => t !== 'custom')
                        : [...prev, 'custom'];
                      if (newTypes.includes('custom')) {
                        setSelectedCategories([]);
                      }
                      return newTypes;
                    });
                    setError('');
                  }}
                />
                <span>Alle eigenen Verben ({customVerbs.length})</span>
              </label>

              <div className="category-selection">
                <fieldset disabled={selectedTypes.includes('custom')}>
                  {categories
                    .filter(cat => !cat.parentId)
                    .map(category => (
                      <CategoryCheckbox
                        key={category.id}
                        category={category}
                        categories={categories}
                        verbs={verbData.custom}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        setError={setError}
                        onDeleteCategory={handleDeleteCategory}
                      />
                    ))}
                </fieldset>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="success-message error">
            {error}
          </div>
        )}
        
        <div className="verb-button-group">
          <button
            onClick={handleStartGame}
            className="verb-button verb-button-primary"
          >
            🚀 Spiel starten
          </button>
          <button
            onClick={onCreateVerb}
            className="verb-button verb-button-secondary"
          >
            ✨ Eigenes Verb erstellen
          </button>
        </div>
      </div>
    );
  };

  // Game Component - Vollständig überarbeitete Version
  const VerbEndingsGame = ({ verbs, onBack, selectedLanguages, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState(Array(6).fill(''));
    const [showFeedback, setShowFeedback] = useState(false);
    const [verbCompleted, setVerbCompleted] = useState(false);
    // Verbesserte Zustandsverwaltung
    const [completedVerbs, setCompletedVerbs] = useState(new Set()); // Speichert abgeschlossene Verben
    const [usedIndices, setUsedIndices] = useState([0]); // Speichert besuchte Indizes für die Zurück-Funktion
    const [verbQueue, setVerbQueue] = useState([]); // Warteschlange für Verben
    const [xpAwarded, setXpAwarded] = useState(false); // Verhindert mehrfache XP-Vergabe 
    
    const pronouns = ["Ich", "Du", "Er/Sie/Es", "Wir", "Ihr", "Sie"];
    const stemKeys = ["ich", "du", "er", "wir", "ihr", "sie"];
    
    // Initialisiere Verb-Warteschlange beim ersten Laden
    useEffect(() => {
      if (verbs && verbs.length > 0) {
        // Erstelle eine zufällige Reihenfolge aller Verben außer dem ersten
        const shuffledIndices = Array.from(
          { length: verbs.length }, 
          (_, i) => i
        )
        .filter(i => i !== 0) // Erstes Verb (0) ausschließen, da es bereits angezeigt wird
        .sort(() => Math.random() - 0.5); // Zufällige Sortierung
        
        console.log("Initialisiere Verb-Warteschlange:", shuffledIndices);
        setVerbQueue(shuffledIndices);
      }
    }, [verbs]);
    
    // Debug-Ausgabe für die verfügbaren Verben
    useEffect(() => {
      console.log("VerbEndingsGame erhalten:", verbs.length, "Verben");
      console.log("Verben:", verbs.map((v, i) => `${i+1}: ${v.verb || v.stems?.ich || 'Unbekannt'}`).join(", "));
    }, [verbs]);
    
    // Debug-Ausgabe für den aktuellen Index
    useEffect(() => {
      console.log(`Aktueller Verb-Index: ${currentIndex} von ${verbs.length - 1}`);
      if (verbs[currentIndex]) {
        console.log("Aktuelles Verb:", verbs[currentIndex].verb || verbs[currentIndex].stems?.ich || 'Unbekannt');
      }
    }, [currentIndex, verbs]);
    
    // Debug-Ausgabe für die Warteschlange
    useEffect(() => {
      console.log("Aktuelle Verb-Warteschlange:", verbQueue);
      console.log("Abgeschlossene Verben:", Array.from(completedVerbs));
    }, [verbQueue, completedVerbs]);
    
    // Prüfen der Korrektheit der Antworten
    const areAllAnswersCorrect = () => {
      if (!verbs || !verbs[currentIndex]) return false;
      return userAnswers.every((answer, i) => 
        answer === verbs[currentIndex].endings[i]
      );
    };
    
    if (!verbs || verbs.length === 0) {
      return (
        <div className="verb-endings-container">
          <h2 className="verb-endings-title">Keine Verben gefunden</h2>
          <button onClick={onBack} className="verb-button verb-button-secondary">
            ↩️ Zurück
          </button>
        </div>
      );
    }

    const currentVerb = verbs[currentIndex];
    
    if (!currentVerb || (!currentVerb.verb && !currentVerb.stems)) {
      console.error('Ungültige Verbdaten:', currentVerb);
      return (
        <div className="verb-endings-container">
          <h2 className="verb-endings-title">Fehler beim Laden der Verben</h2>
          <button onClick={onBack} className="verb-button verb-button-secondary">
            ↩️ Zurück
          </button>
        </div>
      );
    }

    const handleDrop = (e, index) => {
      e.preventDefault();
      const ending = e.dataTransfer.getData('text/plain');
      const newAnswers = [...userAnswers];
      newAnswers[index] = ending;
      setUserAnswers(newAnswers);
      
      // Wenn bereits Feedback angezeigt wird, aktualisieren wir den Zustand um ein Neuladen auszulösen
      if (showFeedback) {
        // Trick, um ein Neuladen zu erzwingen
        setShowFeedback(false);
        setTimeout(() => setShowFeedback(true), 10);
      }
    };

    const handleCheck = () => {
      // Nur das Feedback anzeigen, keine XP-Vergabe hier
      setShowFeedback(true);
    };

    // Verbesserte Funktion zum Holen des nächsten Verbs
    const getNextVerb = () => {
      if (verbQueue.length === 0) {
        // Alle Verben wurden bereits angezeigt
        console.log("Alle Verben wurden angezeigt, erstelle neue Reihenfolge");
        
        // Erstelle eine neue zufällige Reihenfolge aller Verben außer dem aktuellen
        const newQueue = Array.from(
          { length: verbs.length }, 
          (_, i) => i
        )
        .filter(i => i !== currentIndex) // Aktuelles Verb ausschließen
        .sort(() => Math.random() - 0.5); // Zufällige Sortierung
        
        console.log("Neue Verb-Warteschlange:", newQueue);
        
        // Nimm das erste Verb aus der neuen Warteschlange
        const nextIdx = newQueue[0];
        const remainingQueue = newQueue.slice(1);
        
        // Aktualisiere die Warteschlange
        setVerbQueue(remainingQueue);
        
        return nextIdx;
      }
      
      // Nimm das erste Verb aus der Warteschlange
      const nextIdx = verbQueue[0];
      const remainingQueue = verbQueue.slice(1);
      
      console.log(`Wähle nächstes Verb ${nextIdx}, verbleibende Warteschlange:`, remainingQueue);
      
      // Aktualisiere die Warteschlange
      setVerbQueue(remainingQueue);
      
      return nextIdx;
    };

    const handleNext = () => {
      // Zum nächsten Verb wechseln oder zurück zum Menü
      if (verbs.length > 0) {
        // Wenn alle Antworten korrekt sind, Verb als abgeschlossen markieren
        if (areAllAnswersCorrect()) {
          // Füge aktuellen Index zu den abgeschlossenen Verben hinzu
          setCompletedVerbs(prev => new Set([...prev, currentIndex]));
          
          // XP-Vergabe nur, wenn mehr als 3 Verben abgeschlossen wurden und noch nicht vergeben
          if (completedVerbs.size >= 3 && !xpAwarded) {
            onComplete(); // XP-Vergabe
            setXpAwarded(true); // Markiere, dass XP bereits vergeben wurden
            console.log("XP vergeben nach 3+ abgeschlossenen Verben");
          }
        }
        
        // Zuerst ein neues Verb auswählen
        const nextIdx = getNextVerb();
        
        // Aktualisiere die besuchten Indizes für die Zurück-Funktion
        setUsedIndices(prev => [...prev, nextIdx]);
        
        // Zustand aktualisieren für das nächste Verb
        setCurrentIndex(nextIdx);
        setUserAnswers(Array(6).fill(''));
        setShowFeedback(false);
        setVerbCompleted(false);
      } else {
        // Wenn wir keine Verben haben, zurück zum Menü
        onBack();
      }
    };

    const handleBack = () => {
      if (usedIndices.length > 1) {
        // Zurück zum vorigen Verb im Verlauf
        const newUsedIndices = [...usedIndices];
        newUsedIndices.pop(); // Entferne das aktuelle
        const prevIndex = newUsedIndices[newUsedIndices.length - 1];
        
        // Füge den aktuellen Index wieder vorne in die Warteschlange ein
        setVerbQueue(prev => [currentIndex, ...prev]);
        
        // Aktualisiere besuchte Indizes und aktuellen Index
        setUsedIndices(newUsedIndices);
        setCurrentIndex(prevIndex);
        setUserAnswers(Array(6).fill(''));
        setShowFeedback(false);
        setVerbCompleted(false);
      } else {
        // Zurück zum Hauptmenü, wenn wir am Anfang sind
        onBack();
      }
    };

    return (
      <div className="verb-endings-container">
        <h2 className="verb-endings-title">Verbendungen lernen</h2>
        <p className="verb-endings-subtitle">
          Verb {usedIndices.length} von {verbs.length} 
          {completedVerbs.size > 0 && ` (${completedVerbs.size} abgeschlossen)`}
        </p>

        <div className="verb-game-container">
          <div className="verb-translations">
            {selectedLanguages.map(lang => {
              const translation = currentVerb.translations?.[lang];
              if (!translation) return null;

              return (
                <div key={lang} className="translation-item">
                  <span>{languageConfig[lang].flag} {translation}</span>
                  <AudioButton 
                    text={translation}
                    language={languageConfig[lang].flag}
                  />
                </div>
              );
            })}
          </div>

          <div className="verb-conjugation-grid">
            {pronouns.map((pronoun, index) => (
              <div key={index} className="verb-conjugation-item">
                <div className="verb-stem-with-audio">
                  <span className="verb-stem">
                    {pronoun} {currentVerb.stems[stemKeys[index]]}
                  </span>
                  <AudioButton 
                    text={`${pronoun} ${currentVerb.stems[stemKeys[index]]}${currentVerb.endings[index]}`}
                    language="🇩🇪"
                  />
                </div>
                <div
                  className={`verb-ending-dropzone ${
                    showFeedback
                      ? userAnswers[index] === currentVerb.endings[index]
                        ? 'correct'
                        : 'incorrect'
                      : ''
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {userAnswers[index] && `-${userAnswers[index]}`}
                </div>
              </div>
            ))}
          </div>
          <div className="verb-endings-pool">
            {currentVerb.endings.map((ending, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', ending)}
                className="draggable-ending"
              >
                -{ending}
              </div>
            ))}
          </div>

          <div className="verb-nav-buttons">
            <button
              onClick={handleBack}
              className="verb-button verb-button-secondary"
            >
              ⬅️ Zurück
            </button>
            
            <button
              onClick={handleCheck}
              className="verb-button verb-button-primary"
            >
              🎯 Überprüfen
            </button>
            
            {showFeedback && areAllAnswersCorrect() && (
              <button
                onClick={handleNext}
                className="verb-button verb-button-primary"
              >
                {usedIndices.length < verbs.length ? '➡️ Weiter' : '🏁 Fertig'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Create Verb Form Component
  const CreateVerbForm = ({ onBack, categories, onAddCategory, onSaveVerb, selectedLanguages }) => {
    const [verbStems, setVerbStems] = useState({
      ich: '',
      du: '',
      er: '',
      wir: '',
      ihr: '',
      sie: ''
    });
    
    // Initialize translations for all available languages
    const [translations, setTranslations] = useState(
      Object.keys(languageConfig).reduce((acc, lang) => {
        acc[lang] = '';
        return acc;
      }, {})
    );
    
    const [selectedCategory, setSelectedCategory] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const pronouns = ["Ich", "Du", "Er/Sie/Es", "Wir", "Ihr", "Sie"];
    const stemKeys = ["ich", "du", "er", "wir", "ihr", "sie"];

    const handleSubmit = () => {
      if (!selectedCategory) {
        setSuccessMessage('Bitte wähle eine Kategorie aus');
        return;
      }

      if (Object.values(verbStems).some(stem => !stem.trim())) {
        setSuccessMessage('Bitte fülle alle Verbstämme aus');
        return;
      }

      const newVerb = {
        ...verbTemplate,
        stems: { ...verbStems },
        category: selectedCategory,
        translations: { ...translations }
      };

      onSaveVerb(newVerb);
      setSuccessMessage('✨ Verb erfolgreich gespeichert!');
      
      setVerbStems({
        ich: '',
        du: '',
        er: '',
        wir: '',
        ihr: '',
        sie: ''
      });
      
      // Reset translations for all languages
      setTranslations(
        Object.keys(languageConfig).reduce((acc, lang) => {
          acc[lang] = '';
          return acc;
        }, {})
      );
      
      setTimeout(() => setSuccessMessage(''), 2000);
    };

    return (
      <div className="verb-endings-container">
        <h2 className="verb-endings-title">Eigenes Verb erstellen</h2>

        <div className="verb-form">
          <div className="form-group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              <option value="">Kategorie auswählen...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.path.join(' > ')}
                </option>
              ))}
            </select>

            {showNewCategoryInput ? (
              <div className="new-category-input">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Neue Kategorie..."
                  className="form-input"
                  />
                <div className="button-group">
                  <button
                    onClick={() => {
                      if (newCategory.trim()) {
                        onAddCategory(newCategory.trim());
                        setShowNewCategoryInput(false);
                        setNewCategory('');
                      }
                    }}
                    className="verb-button verb-button-primary"
                  >
                    ✨ Hinzufügen
                  </button>
                  <button
                    onClick={() => setShowNewCategoryInput(false)}
                    className="verb-button verb-button-secondary"
                  >
                    ❌ Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewCategoryInput(true)}
                className="verb-button verb-button-secondary"
              >
                + Neue Kategorie erstellen
              </button>
            )}
          </div>

          <div className="verb-stems-grid">
            {pronouns.map((pronoun, index) => (
              <div key={index} className="verb-stem-item">
                <label>{pronoun}</label>
                <div className="stem-input-group">
                  <input
                    type="text"
                    value={verbStems[stemKeys[index]]}
                    onChange={(e) => setVerbStems(prev => ({
                      ...prev,
                      [stemKeys[index]]: e.target.value
                    }))}
                    className="form-input"
                    placeholder="Verbstamm"
                  />
                  <span className="verb-ending">-{verbTemplate.endings[index]}</span>
                  {verbStems[stemKeys[index]] && (
                    <AudioButton 
                      text={`${pronoun} ${verbStems[stemKeys[index]]}${verbTemplate.endings[index]}`}
                      language="🇩🇪"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedLanguages.map(lang => {
            const config = languageConfig[lang];
            if (!config) return null;

            return (
              <div key={lang} className="form-group">
                <label>
                  {config.flag} {config.label}
                </label>
                <div className="translation-input-group">
                  <input
                    type="text"
                    value={translations[lang]}
                    onChange={(e) => setTranslations(prev => ({
                      ...prev,
                      [lang]: e.target.value
                    }))}
                    className="form-input"
                    placeholder={`Übersetzung auf ${config.label}`}
                    dir={['arabic', 'farsi', 'pashto'].includes(lang) ? 'rtl' : 'ltr'}
                  />
                  {translations[lang] && (
                    <AudioButton 
                      text={translations[lang]}
                      language={config.flag}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {successMessage && (
            <div className={`success-message ${
              successMessage.includes('Bitte') ? 'error' : 'success'
            }`}>
              {successMessage}
            </div>
          )}

          <div className="button-group">
            <button
              onClick={handleSubmit}
              className="verb-button verb-button-primary"
            >
              💾 Speichern
            </button>
            <button
              onClick={onBack}
              className="verb-button verb-button-secondary"
            >
              ↩️ Zurück
            </button>
          </div>
        </div>
      </div>
    );
  };

  // CategoryCheckbox Component
  const CategoryCheckbox = ({ 
    category, 
    categories, 
    verbs, 
    selectedCategories, 
    setSelectedCategories, 
    setError,
    onDeleteCategory,
    depth = 0 
  }) => {
    const subcategories = categories.filter(c => c.parentId === category.id);
    const categoryVerbs = verbs.filter(verb => verb.category === category.id);
    const isSelected = selectedCategories.includes(category.id);

    return (
      <div className="category-item" style={{ marginLeft: `${depth * 1.5}rem` }}>
        <div className="category-checkbox-container">
          <label className="verb-checkbox-label">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {
                setSelectedCategories(prev => {
                  const newSelection = isSelected
                    ? prev.filter(id => id !== category.id)
                    : [...prev, category.id];
                  setError('');
                  return newSelection;
                });
              }}
            />
            <span>
              {category.name}
              {categoryVerbs.length > 0 && (
                <span className="verb-count">({categoryVerbs.length})</span>
              )}
            </span>
          </label>
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="category-delete-button"
            title="Kategorie löschen"
          >
            🗑️
          </button>
        </div>
        {subcategories.length > 0 && (
          <div className="subcategories">
            {subcategories.map(subcat => (
              <CategoryCheckbox
                key={subcat.id}
                category={subcat}
                categories={categories}
                verbs={verbs}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                setError={setError}
                onDeleteCategory={onDeleteCategory}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="verb-endings-container">
      {mode === 'select' && (
        <VerbTypeSelection 
          onStartGame={(verbs) => {
            setGameVerbs(verbs);
            setMode('game');
          }}
          onCreateVerb={() => setMode('create')}
          categories={categories}
        />
      )}
      
      {mode === 'game' && (
        <VerbEndingsGame 
          verbs={gameVerbs} 
          onBack={() => setMode('select')}
          selectedLanguages={selectedLanguages}
          onComplete={onComplete}
        />
      )}
      
      {mode === 'create' && (
        <CreateVerbForm 
          onBack={() => setMode('select')}
          categories={categories}
          onAddCategory={handleAddCategory}
          onSaveVerb={handleSaveVerb}
          selectedLanguages={selectedLanguages}
        />
      )}
    </div>
  );
}

export default VerbEndings;
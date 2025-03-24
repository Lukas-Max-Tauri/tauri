import React, { useState, useEffect } from 'react';
import styles from './DailyWordView.module.css';
import AudioButton from './AudioButton';  

// Language Configuration
const languageConfig = {
  ukrainian: { flag: '🇺🇦', label: 'Ukrainisch' },
  arabic: { flag: '🇸🇦', label: 'Arabisch' },
  turkish: { flag: '🇹🇷', label: 'Türkisch' },
  english: { flag: '🇬🇧', label: 'Englisch' },
  spanish: { flag: '🇪🇸', label: 'Spanisch' },
  russian: { flag: '🇷🇺', label: 'Russisch' },
  polish: { flag: '🇵🇱', label: 'Polnisch' },
  romanian: { flag: '🇷🇴', label: 'Rumänisch' },
  ku: { flag: '🇹🇯', label: 'Kurdisch' },
  farsi: { flag: '🇮🇷', label: 'Farsi' },
  albanian: { flag: '🇦🇱', label: 'Albanisch' },
  serbian: { flag: '🇷🇸', label: 'Serbisch' },
  italian: { flag: '🇮🇹', label: 'Italienisch' },
  pashto: { flag: '🇦🇫', label: 'Paschtu' },
  somali: { flag: '🇸🇴', label: 'Somali' },
  tigrinya: { flag: '🇪🇷', label: 'Tigrinya' }
};

// RTL languages
const rtlLanguages = ['arabic', 'farsi'];

// Quiz Category Selection Component
const QuizCategorySelection = ({ categories, onStartQuiz }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState('');

  const handleStartQuiz = () => {
    if (selectedCategories.length === 0) {
      setError('Bitte wähle mindestens eine Kategorie aus');
      return;
    }
    onStartQuiz(selectedCategories);
  };

  return (
    <div className={styles.quizSetup}>
      <h3 className={styles.quizTitle}>Quiz - Kategorien auswählen</h3>
      <div className={styles.categoryList}>
        {categories.map((category) => (
          <div key={category.id} className={styles.categoryCheckbox}>
            <label>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={(e) => {
                  setSelectedCategories(prev =>
                    e.target.checked
                      ? [...prev, category.id]
                      : prev.filter(id => id !== category.id)
                  );
                  setError('');
                }}
              />
              {category.path.join(' > ')}
            </label>
          </div>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.quizButtons}>
        <button onClick={handleStartQuiz} className={styles.startQuizButton}>
          Quiz starten {selectedCategories.length > 0 && `(${selectedCategories.length} Kategorien)`}
        </button>
        <button onClick={() => onStartQuiz([])} className={styles.cancelButton}>
          Abbrechen
        </button>
      </div>
    </div>
  );
};

// Word Quiz Component
const WordQuiz = ({ words, selectedLanguages, onComplete, onBack, onWordResult }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);

  const currentWord = words[currentIndex];

  const checkAnswer = () => {
    if (!userInput.trim()) {
      setFeedback('Bitte gib eine Antwort ein!');
      return;
    }

    const correctAnswer = currentWord.german.toLowerCase();
    const userAnswer = userInput.toLowerCase().trim();

    if (correctAnswer === userAnswer) {
      setScore(score + 1);
      setFeedback('Richtig! 🎉');
      onWordResult?.(currentWord, true);
    } else {
      setFeedback(`Falsch. Die richtige Antwort ist: ${currentWord.german}`);
      onWordResult?.(currentWord, false);
    }
    setShowAnswer(true);
  };

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setFeedback('');
      setShowAnswer(false);
    } else {
      if (score >= Math.floor(words.length * 0.7)) {
        onComplete?.();
      }
      onBack();
    }
  };

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizProgress}>
        Wort {currentIndex + 1} von {words.length} | Score: {score}
      </div>

      <div>
        {currentWord.image && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <img 
              src={currentWord.image} 
              alt="Wort Illustration"
              style={{ height: '160px', width: '160px', objectFit: 'cover', borderRadius: '0.5rem' }}
            />
          </div>
        )}

        <div className={styles.translations}>
          {selectedLanguages.map(lang => {
            const translation = currentWord[lang];
            if (!translation) return null;
            const config = languageConfig[lang];
            return (
              <div key={lang} className={styles.translation}>
                <span className={styles.flag}>{config.flag}</span>
                <span className={styles.translationText}>{translation}</span>
                <AudioButton text={translation} language={config.flag} />
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Wie heißt das auf Deutsch?"
            className={styles.quizInput}
            disabled={showAnswer}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                if (!showAnswer) checkAnswer();
                else nextWord();
              }
            }}
          />

          {showAnswer && (
            <div className={styles.germanAnswer}>
              <span className={styles.flag}>🇩🇪</span>
              {currentWord.german}
              <AudioButton text={currentWord.german} language="🇩🇪" />
            </div>
          )}

          {!showAnswer ? (
            <button
              onClick={checkAnswer}
              className={styles.standardButton}
            >
              Überprüfen
            </button>
          ) : (
            <button
              onClick={nextWord}
              className={styles.standardButton}
              style={{ backgroundColor: '#059669' }}
            >
              {currentIndex < words.length - 1 ? 'Nächstes Wort' : 'Quiz beenden'}
            </button>
          )}

          {feedback && (
            <div className={feedback.includes('Richtig') ? styles.success : styles.error}>
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// CategoryFolder Component
const CategoryFolder = ({ 
  category, 
  categories, 
  words, 
  onAddSubcategory,
  onDeleteCategory, 
  onDeleteWord,
  selectedLanguages,
  depth = 0 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Find subcategories and words
  const subcategories = categories.filter(c => c.parentId === category.id);
  const categoryWords = words.filter(word => word.category === category.id);

  const handleDeleteCategory = () => {
    const hasContents = categoryWords.length > 0 || subcategories.length > 0;
    if (hasContents) {
      setShowDeleteConfirm(true);
    } else {
      onDeleteCategory(category.id);
    }
  };

  return (
    <div className={styles.categoryFolder}>
      <div className={styles.categoryHeader}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={styles.folderButton}
        >
          <span className={styles.folderIcon}>{isOpen ? '📂' : '📁'}</span>
          {category.name}
          {categoryWords.length > 0 && (
            <span className={styles.wordCount}>
              ({categoryWords.length})
            </span>
          )}
        </button>
        <div className={styles.categoryActions}>
          <button
            onClick={() => setShowNewCategoryInput(true)}
            className={styles.actionButton}
            title="Neue Unterkategorie"
          >
            +
          </button>
          <button
            onClick={handleDeleteCategory}
            className={styles.actionButton}
            title="Kategorie löschen"
          >
            🗑️
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className={styles.deleteConfirm}>
          <p>Möchten Sie diese Kategorie wirklich löschen?</p>
          {subcategories.length > 0 && (
            <p>Diese Kategorie enthält {subcategories.length} Unterkategorien.</p>
          )}
          {categoryWords.length > 0 && (
            <p>Diese Kategorie enthält {categoryWords.length} Wörter.</p>
          )}
          <div className={styles.deleteConfirmButtons}>
            <button
              onClick={() => {
                onDeleteCategory(category.id);
                setShowDeleteConfirm(false);
              }}
              className={styles.deleteConfirmButton}
            >
              Ja, löschen
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className={styles.cancelButton}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {showNewCategoryInput && (
        <div className={styles.newCategoryInput}>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Neue Unterkategorie..."
            className={styles.input}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newCategoryName.trim()) {
                onAddSubcategory(newCategoryName.trim(), category.id);
                setNewCategoryName('');
                setShowNewCategoryInput(false);
              }
            }}
          />
          <button
            onClick={() => {
              if (newCategoryName.trim()) {
                onAddSubcategory(newCategoryName.trim(), category.id);
                setNewCategoryName('');
                setShowNewCategoryInput(false);
              }
            }}
            className={styles.submitButton}
          >
            Hinzufügen
          </button>
          <button
            onClick={() => setShowNewCategoryInput(false)}
            className={styles.cancelButton}
          >
            Abbrechen
          </button>
        </div>
      )}

      {isOpen && (
        <div className={styles.categoryContent}>
          {subcategories.map(subcat => (
            <CategoryFolder
              key={subcat.id}
              category={subcat}
              categories={categories}
              words={words}
              onAddSubcategory={onAddSubcategory}
              onDeleteCategory={onDeleteCategory}
              onDeleteWord={onDeleteWord}
              selectedLanguages={selectedLanguages}
              depth={depth + 1}
            />
          ))}

          {categoryWords.map((word) => (
            <div key={word.id} className={styles.wordCard}>
              <div className={styles.wordHeader}>
                <div className={styles.germanWord}>
                  <span className={styles.flag}>🇩🇪</span>
                  {word.german}
                  <AudioButton text={word.german} language="🇩🇪" />
                </div>
                <button 
                  className={styles.deleteButton}
                  onClick={() => {
                    if (window.confirm('Möchten Sie dieses Wort wirklich löschen?')) {
                      onDeleteWord(word.id);
                    }
                  }}
                >
                  🗑️
                </button>
              </div>

              <div className={styles.translations}>
                {selectedLanguages.map(langKey => {
                  if (!word[langKey]) return null;
                  const langConfig = languageConfig[langKey];
                  return (
                    <div key={langKey} className={styles.translation}>
                      <span className={styles.flag}>{langConfig.flag}</span>
                      <span 
                        className={styles.translationText}
                        dir={rtlLanguages.includes(langKey) ? 'rtl' : 'ltr'}
                      >
                        {word[langKey]}
                      </span>
                      <AudioButton text={word[langKey]} language={langConfig.flag} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component
const DailyWordView = ({ 
  onBack, 
  selectedLanguages, 
  words,
  categories,
  onAddWord,
  onDeleteWord,
  onAddCategory,
  onDeleteCategory,
  onWordResult
}) => {
  const [mode, setMode] = useState('main');
  const [newWord, setNewWord] = useState({
    german: '',
    category: '',
    ...Object.keys(languageConfig).reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [quizWords, setQuizWords] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Update available categories when categories prop changes
  useEffect(() => {
    setAvailableCategories(categories);
  }, [categories]);

  const handleInputChange = (field, value) => {
    setNewWord(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleStartQuiz = (selectedCategories) => {
    if (selectedCategories.length === 0) {
      setMode('main');
      return;
    }

    const filteredWords = words.filter(word => 
      selectedCategories.includes(word.category)
    );

    if (filteredWords.length === 0) {
      setError('Keine Wörter in den ausgewählten Kategorien gefunden');
      return;
    }

    setQuizWords(filteredWords.sort(() => Math.random() - 0.5));
    setMode('quiz');
  };

  const handleSubmit = () => {
    // Validate selected category exists
    const categoryExists = availableCategories.some(cat => cat.id === newWord.category);
    if (!categoryExists) {
      setError('Die ausgewählte Kategorie existiert nicht mehr. Bitte wähle eine andere Kategorie.');
      return;
    }

    if (!newWord.german.trim()) {
      setError('Das deutsche Wort muss ausgefüllt werden!');
      return;
    }

    if (!newWord.category) {
      setError('Bitte wähle eine Kategorie aus!');
      return;
    }

    const hasTranslation = selectedLanguages.some(lang => newWord[lang]?.trim());
    if (!hasTranslation) {
      setError('Mindestens eine Übersetzung muss angegeben werden!');
      return;
    }

    onAddWord(newWord);
    setSuccessMessage('Wort erfolgreich gespeichert!');
    setTimeout(() => setSuccessMessage(''), 3000);

    setNewWord({
      german: '',
      category: newWord.category,
      ...Object.keys(languageConfig).reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})
    });
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        <span>←</span> Zurück
      </button>
  
      {/* Action Buttons nur im Hauptmenü anzeigen */}
      {mode === 'main' && (
        <div className={styles.actionButtons}>
          <button 
            className={`${styles.actionButton} ${styles.addButton}`}
            onClick={() => setMode('add')}
          >
            <span>📝</span> Neues Wort hinzufügen
          </button>
          <button 
            className={`${styles.actionButton} ${styles.quizButton}`}
            onClick={() => setMode('quizSetup')}
          >
            <span>🎯</span> Quiz starten
          </button>
        </div>
      )}
      {mode === 'add' ? (
        <div className={styles.formContainer}>
          <div className={styles.formGrid}>
            <div className={styles.categorySelection}>
              <select
                value={newWord.category}
                onChange={(e) => {
                  if (availableCategories.find(cat => cat.id === e.target.value)) {
                    handleInputChange('category', e.target.value);
                  } else {
                    handleInputChange('category', '');
                  }
                }}
                className={styles.select}
              >
                <option value="">Kategorie auswählen...</option>
                {availableCategories
                  .sort((a, b) => a.path.join(' > ').localeCompare(b.path.join(' > ')))
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.path.join(' > ')}
                    </option>
                ))}
              </select>

              {/* Neue Kategorie Erstellung */}
              <div className={styles.newCategorySection}>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Neue Kategorie..."
                  className={styles.input}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNewCategory();
                    }
                  }}
                />
                <button
                  onClick={handleAddNewCategory}
                  className={styles.addCategoryButton}
                >
                  Kategorie erstellen
                </button>
              </div>
            </div>

            <input
              type="text"
              value={newWord.german}
              onChange={(e) => handleInputChange('german', e.target.value)}
              placeholder="Deutsches Wort *"
              className={styles.input}
            />

            <div className={styles.translationGrid}>
              {selectedLanguages.map(lang => {
                const config = languageConfig[lang];
                return (
                  <div key={lang} className={styles.translationInput}>
                    <label className={styles.translationLabel}>
                      <span className={styles.flag}>{config.flag}</span>
                      {config.label}
                    </label>
                    <input
                      type="text"
                      value={newWord[lang]}
                      onChange={(e) => handleInputChange(lang, e.target.value)}
                      placeholder={`${config.label} Übersetzung`}
                      className={styles.input}
                      dir={rtlLanguages.includes(lang) ? 'rtl' : 'ltr'}
                    />
                  </div>
                );
              })}
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {successMessage && <div className={styles.success}>{successMessage}</div>}

            <div className={styles.formButtons}>
              <button onClick={handleSubmit} className={styles.submitButton}>
                Wort speichern
              </button>
              <button onClick={() => setMode('main')} className={styles.cancelButton}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      ) : mode === 'quizSetup' ? (
        <QuizCategorySelection 
          categories={availableCategories}
          onStartQuiz={handleStartQuiz}
        />
      ) : mode === 'quiz' ? (
        <WordQuiz 
          words={quizWords}
          selectedLanguages={selectedLanguages}
          onComplete={() => {
            setMode('main');
            setQuizWords([]);
          }}
          onBack={() => {
            setMode('main');
            setQuizWords([]);
          }}
          onWordResult={onWordResult}
        />
      ) : (
        <div className={styles.categoriesList}>
          {availableCategories
            .filter(cat => !cat.parentId)
            .map(category => (
              <CategoryFolder
                key={category.id}
                category={category}
                categories={availableCategories}
                words={words}
                onAddSubcategory={onAddCategory}
                onDeleteCategory={onDeleteCategory}
                onDeleteWord={onDeleteWord}
                selectedLanguages={selectedLanguages}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default DailyWordView;

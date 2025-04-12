import { useState } from 'react';
import AudioButton from './AudioButton';

// Bild zu Base64 konvertieren
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

// Language configuration
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

// CategoryFolder Komponente
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
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Finde alle Unterkategorien
  const subcategories = categories.filter(c => c.parentId === category.id);
  // Finde alle Wörter in dieser Kategorie
  const categoryWords = words.filter(word => word.category === category.id);

  const handleAddSubcategory = () => {
    if (newCategoryName.trim()) {
      onAddSubcategory(newCategoryName.trim(), category.id);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    }
  };

  const handleDeleteCategory = () => {
    if (categoryWords.length > 0 || subcategories.length > 0) {
      setShowDeleteConfirm(true);
    } else {
      onDeleteCategory(category.id);
    }
  };

  return (
    <div className="ml-4">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700 hover:text-gray-900 flex-grow text-left flex items-center"
        >
          <span className="mr-2">
            {isOpen ? '📂' : '📁'}
          </span>
          {category.name}
          {categoryWords.length > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              ({categoryWords.length} {categoryWords.length === 1 ? 'Wort' : 'Wörter'})
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewCategoryInput(true)}
            className="text-sm text-blue-500 hover:text-blue-700"
            title="Neue Unterkategorie"
          >
            +
          </button>
          <button
            onClick={handleDeleteCategory}
            className="text-sm text-red-500 hover:text-red-700"
            title="Kategorie löschen"
          >
            🗑️
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="ml-6 p-4 bg-red-50 rounded-lg mb-2">
          <p className="text-red-600 mb-2">
            Diese Kategorie {subcategories.length > 0 ? 'und alle Unterkategorien ' : ''}
            wirklich löschen? 
            {categoryWords.length > 0 && ` ${categoryWords.length} Wörter werden gelöscht.`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onDeleteCategory(category.id);
                setShowDeleteConfirm(false);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Ja, löschen
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {showNewCategoryInput && (
        <div className="flex items-center gap-2 ml-6 mb-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Neue Unterkategorie..."
            className="p-1 border rounded text-sm flex-grow"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAddSubcategory();
            }}
          />
          <button
            onClick={handleAddSubcategory}
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Hinzufügen
          </button>
          <button
            onClick={() => setShowNewCategoryInput(false)}
            className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Abbrechen
          </button>
        </div>
      )}

      {isOpen && (
        <div className="ml-6">
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
            <div key={word.id} className="bg-white p-4 rounded-lg shadow-sm mb-2">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-4">
                    {word.image && (
                      <img 
                        src={word.image} 
                        alt={word.german}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">🇩🇪 {word.german}</span>
                        <AudioButton text={word.german} language="🇩🇪" />
                      </div>
                      <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-2">
                        {selectedLanguages.map(lang => {
                          if (!word[lang]) return null;
                          const config = languageConfig[lang];
                          return (
                            <div key={lang} className="flex items-center gap-2">
                              <span>{config.flag} {word[lang]}</span>
                              <AudioButton text={word[lang]} language={config.flag} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteWord(word.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Wort löschen"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Hauptkomponente
function DailyWord({ 
  onBack, 
  words, 
  categories, 
  selectedLanguages,
  onAddWord, 
  onDeleteWord,
  onAddCategory,
  onDeleteCategory,
  onWordResult
}) {
  const [mode, setMode] = useState('main');
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newWord, setNewWord] = useState({
    german: '',
    category: '',
    image: null,
    ...Object.keys(languageConfig).reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Quiz States
  const [quizWords, setQuizWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [score, setScore] = useState(0);

  const handleInputChange = (field, value) => {
    setNewWord(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleAddCategoryLocal = () => {
    if (newCategory.trim() && !categories.map(c => c.name).includes(newCategory.trim())) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleSubmit = () => {
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
      image: null,
      ...Object.keys(languageConfig).reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})
    });
  };

  // Quiz Funktionen
  const startQuiz = () => {
    setSelectedCategories([]);
    setMode('categorySelect');
  };

  const handleStartQuizWithCategories = () => {
    let wordsToQuiz = [];
    if (selectedCategories.length === 0) {
      wordsToQuiz = [...words];
    } else {
      wordsToQuiz = words.filter(word => 
        selectedCategories.includes(word.category)
      );
    }
    
    if (wordsToQuiz.length === 0) {
      setError('Keine Wörter in den ausgewählten Kategorien!');
      return;
    }
  
    console.log('Starte Quiz mit Wörtern:', wordsToQuiz);
  
    setQuizWords(wordsToQuiz.sort(() => Math.random() - 0.5));
    setCurrentWordIndex(0);
    setScore(0);
    setUserInput('');
    setQuizFeedback('');  // Stelle sicher, dass das Feedback zurückgesetzt wird
    setShowAnswer(false);
    setMode('quiz');
  };

  const checkQuizAnswer = () => {
    if (!userInput.trim()) {
      console.log('Leere Eingabe');
      setQuizFeedback('Bitte gib eine Antwort ein!');
      return;
    }
  
    const correctAnswer = quizWords[currentWordIndex].german.toLowerCase();
    const userAnswer = userInput.toLowerCase().trim();
    const currentWord = quizWords[currentWordIndex];
  
    console.log('Prüfe Antwort:', {
      correctAnswer,
      userAnswer,
      isCorrect: correctAnswer === userAnswer
    });
  
    if (correctAnswer === userAnswer) {
      console.log('Richtige Antwort');
      setScore(score + 1);
      setQuizFeedback('Richtig! 🎉');
      onWordResult(currentWord, true);
    } else {
      console.log('Falsche Antwort');
      setQuizFeedback(`Falsch. Die richtige Antwort ist: ${currentWord.german}`);
      onWordResult(currentWord, false);
    }
    setShowAnswer(true);
  };

  const nextQuizWord = () => {
    console.log('Nächstes Wort:', currentWordIndex + 1, 'von', quizWords.length);
    
    if (currentWordIndex < quizWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setUserInput('');
      setQuizFeedback('');  // Feedback zurücksetzen
      setShowAnswer(false);
    } else {
      setMode('main');
      setQuizFeedback(`Quiz beendet! Dein Score: ${score}/${quizWords.length}`);
    }
  };

  // Quiz-Modus
  if (mode === 'quiz') {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-600">
          Wort {currentWordIndex + 1} von {quizWords.length} | Punkte: {score}
        </div>
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-medium">
              Kategorie: {categories.find(c => c.id === quizWords[currentWordIndex].category)?.path.join(' > ')}
            </div>
          </div>
          <div className="space-y-4">
            {quizWords[currentWordIndex].image && (
              <div className="flex justify-center">
                <img 
                src={quizWords[currentWordIndex].image} 
                alt="Wortbild"
                className="h-40 w-40 object-cover rounded-lg"
              />
            </div>
          )}
          <div className="space-y-2">
            {selectedLanguages.map(lang => {
              const translation = quizWords[currentWordIndex][lang];
              if (!translation) return null;
              const config = languageConfig[lang];
              return (
                <p key={lang} className="text-lg flex items-center gap-2">
                  <span>{config.flag}</span>
                  <span>{translation}</span>
                  <AudioButton text={translation} language={config.flag} />
                </p>
              );
            })}
          </div>
        </div>

        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Wie heißt das auf Deutsch?"
          className="w-full p-3 border rounded-lg text-center text-lg"
          disabled={showAnswer}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !showAnswer) checkQuizAnswer();
            else if (e.key === 'Enter' && showAnswer) nextQuizWord();
          }}
        />

        {!showAnswer ? (
          <button
            onClick={checkQuizAnswer}
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Überprüfen
          </button>
        ) : (
          <button
            onClick={nextQuizWord}
            className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            {currentWordIndex < quizWords.length - 1 ? 'Nächstes Wort' : 'Quiz beenden'}
          </button>
        )}

{quizFeedback && (
  <div 
    className={`p-4 rounded-lg ${
      quizFeedback.startsWith('Richtig')
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
    }`}
    style={{ opacity: quizFeedback ? 1 : 0 }}  // Zusätzliche Sichtbarkeitsprüfung
  >
    {quizFeedback}
          </div>
        )}
      </div>
      <button
        onClick={() => setMode('main')}
        className="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        Quiz beenden
      </button>
    </div>
  );
}

// Kategorie-Auswahl für Quiz
if (mode === 'categorySelect') {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Kategorien für das Quiz auswählen</h3>
      <div className="space-y-2">
        <p className="text-gray-600 text-sm mb-4">
          Keine Auswahl = Alle Kategorien werden abgefragt
        </p>
        {categories.map((category) => (
          <label key={category.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={() => {
                setSelectedCategories(prev => 
                  prev.includes(category.id)
                    ? prev.filter(c => c !== category.id)
                    : [...prev, category.id]
                );
              }}
              className="rounded"
            />
            <span>{category.path.join(' > ')}</span>
          </label>
        ))}
      </div>
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleStartQuizWithCategories}
          className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Quiz starten
        </button>
        <button
          onClick={() => setMode('main')}
          className="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Zurück
        </button>
      </div>
    </div>
  );
}

// Hauptansicht
return (
  <div className="space-y-8">
    {/* Aktions-Buttons */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        onClick={() => setMode('add')}
        className={`p-4 text-white rounded-lg transition-colors ${
          mode === 'add' 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        Neues Wort hinzufügen
      </button>
      <button
        onClick={startQuiz}
        className={`p-4 text-white rounded-lg transition-colors ${
          mode === 'quiz' || mode === 'categorySelect'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        Vokabelquiz starten
      </button>
    </div>

    {/* Formular zum Hinzufügen */}
    {mode === 'add' && (
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <select
            value={newWord.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="flex-grow p-2 border rounded-md"
          >
            <option value="">Kategorie auswählen...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.path.join(' > ')}
              </option>
            ))}
          </select>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Neue Hauptkategorie..."
              className="p-2 border rounded-md"
            />
            <button
              onClick={handleAddCategoryLocal}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              +
            </button>
          </div>
        </div>

        <input
          type="text"
          value={newWord.german}
          onChange={(e) => handleInputChange('german', e.target.value)}
          placeholder="Deutsches Wort *"
          className="w-full p-2 border rounded-md"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedLanguages.map(lang => {
            const config = languageConfig[lang];
            return (
              <input
                key={lang}
                type="text"
                value={newWord[lang]}
                onChange={(e) => handleInputChange(lang, e.target.value)}
                placeholder={`${config.label} ${config.flag}`}
                className="w-full p-2 border rounded-md"
                dir={lang === 'arabic' || lang === 'farsi' ? 'rtl' : 'ltr'}
              />
            );
          })}
        </div>

        {/* Bild-Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Bild hinzufügen (optional)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  try {
                    const base64 = await convertToBase64(e.target.files[0]);
                    handleInputChange('image', base64);
                  } catch (error) {
                    setError('Fehler beim Hochladen des Bildes');
                  }
                }
              }}
              className="text-sm text-gray-500 
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
            />
            {newWord.image && (
              <div className="relative">
                <img 
                  src={newWord.image} 
                  alt="Vorschau" 
                  className="h-20 w-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleInputChange('image', null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="text-green-500 text-sm">
            {successMessage}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleSubmit}
            className="flex-1 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Wort speichern
          </button>
          <button
            onClick={() => setMode('main')}
            className="flex-1 p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Zurück
          </button>
        </div>
      </div>
    )}

    {/* Liste der Kategorien und Wörter */}
    <div className="space-y-6">
      <h3 className="text-xl font-medium">Kategorien & Wörter</h3>
      {categories
        .filter(cat => !cat.parentId)
        .map(category => (
          <CategoryFolder
            key={category.id}
            category={category}
            categories={categories}
            words={words}
            onAddSubcategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
            onDeleteWord={onDeleteWord}
            selectedLanguages={selectedLanguages}
          />
        ))
      }
    </div>
  </div>
);
}

export default DailyWord;
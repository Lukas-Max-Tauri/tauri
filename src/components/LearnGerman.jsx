import { useState, useEffect } from 'react';
import VocabCategorySelection from './VocabCategorySelection';
import { vocabularyData } from '../data/vocabulary';
import { kinderVokabeln } from '../data/kinderVokabeln';
import { neueVokabeln } from '../data/neueVokabeln';
import { weitereVokabeln } from '../data/weitereVokabeln';
import { zusaetzlicheVokabeln } from '../data/zusaetzlicheVokabeln';
import styles from './LearnGerman.module.css';
import AudioButton from './AudioButton';

// Mapping for all supported languages
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

export function LearnGerman({ onWordResult, selectedLanguages, onComplete, onBack }) {
  const [mode, setMode] = useState('categories');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffledWords, setShuffledWords] = useState([]);
  // Track if user has already gotten a correct answer this session
  const [hasCorrectAnswer, setHasCorrectAnswer] = useState(false);

  // Kombinieren aller Vokabeldatenquellen
  const getAllVocabData = (category) => {
    const allData = {
      ...vocabularyData,
      ...kinderVokabeln,
      ...neueVokabeln,
      ...weitereVokabeln,
      ...zusaetzlicheVokabeln
    };
    
    return allData[category] || [];
  };

  const shuffleWords = (category) => {
    const categoryWords = getAllVocabData(category);
    
    if (!categoryWords || categoryWords.length === 0) {
      console.error('No vocabulary data found for category:', category);
      return [];
    }
    
    return [...categoryWords].sort(() => Math.random() - 0.5);
  };

  const handleCategorySelect = (categoryId) => {
    setCurrentCategory(categoryId);
    setMode('select');
  };

  const resetQuizStates = () => {
    setUserInput('');
    setFeedback('');
    setShowAnswer(false);
    setScore(0);
    setCurrentIndex(0);
    // We don't reset hasCorrectAnswer here, as it should persist for the entire session
  };

  const handleBack = () => {
    switch(mode) {
      case 'categories':
        onBack?.();
        break;
      case 'select':
        setMode('categories');
        setCurrentCategory(null);
        resetQuizStates();
        break;
      case 'learning':
      case 'quiz':
        setMode('select');
        resetQuizStates();
        break;
      default:
        setMode('categories');
        resetQuizStates();
    }
  };

  const checkAnswer = () => {
    if (!userInput.trim()) {
      setFeedback('Bitte gib eine Antwort ein!');
      return;
    }

    const correctAnswer = shuffledWords[currentIndex].german.toLowerCase();
    const userAnswer = userInput.toLowerCase().trim();
    const wordWithSource = {
      ...shuffledWords[currentIndex],
      source: 'learn'
    };

    if (correctAnswer === userAnswer) {
      setScore(score + 1);
      setFeedback('Richtig! 🎉');
      
      // Pass isFirstCorrect flag to parent component
      const isFirstCorrect = !hasCorrectAnswer;
      if (isFirstCorrect) {
        setHasCorrectAnswer(true);
      }
      
      onWordResult?.(wordWithSource, true, isFirstCorrect);
    } else {
      setFeedback(`Falsch. Die richtige Antwort ist: ${shuffledWords[currentIndex].german}`);
      onWordResult?.(wordWithSource, false, false);
    }
    setShowAnswer(true);
  };

  const nextWord = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setFeedback('');
      setShowAnswer(false);
    } else {
      if (score >= Math.floor(shuffledWords.length * 0.7)) {
        onComplete?.();
      }
      setMode('categories');
      resetQuizStates();
    }
  };

  switch(mode) {
    case 'categories':
      return (
        <div className={styles.container}>
          <button onClick={handleBack} className={styles.backButton}>
            <span>←</span> Zurück
          </button>
          <VocabCategorySelection onSelectCategory={handleCategorySelect} />
        </div>
      );

    case 'select':
      return (
        <div className={styles.container}>
          <button onClick={handleBack} className={styles.backButton}>
            <span>←</span> Zurück zur Kategorieauswahl
          </button>
          
          <div className={styles.modeSelection}>
            <h2 className={styles.modeTitle}>
              Wähle aus, ob du die Vokabeln durchgehen oder ein Quiz machen möchtest
            </h2>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => {
                  const shuffled = shuffleWords(currentCategory);
                  setShuffledWords(shuffled);
                  setCurrentIndex(0);
                  resetQuizStates();
                  setMode('learning');
                }}
                className={styles.learnButton}
              >
                Vokabeln durchgehen
              </button>
              <button
                onClick={() => {
                  const shuffled = shuffleWords(currentCategory);
                  setShuffledWords(shuffled);
                  resetQuizStates();
                  setMode('quiz');
                }}
                className={styles.quizButton}
              >
                Quiz starten
              </button>
            </div>
          </div>
        </div>
      );

    case 'learning':
      return (
        <div className={styles.container}>
          <button onClick={handleBack} className={styles.backButton}>
            <span>←</span> Zurück zur Auswahlseite
          </button>

          <div className={styles.wordCounter}>
            Wort {currentIndex + 1} von {shuffledWords.length}
          </div>
          
          <div className={styles.germanWordContainer}>
            <div className={styles.germanWord}>
              <span className={styles.flag}>🇩🇪</span>
              {shuffledWords[currentIndex].german}
              <AudioButton text={shuffledWords[currentIndex].german} language="🇩🇪" />
            </div>
          </div>

          <div className={styles.translationsContainer}>
            <div className={styles.translationTitle}>Übersetzungen</div>
            <div className={styles.wordList}>
              {selectedLanguages.map(lang => {
                if (!languageConfig[lang]) return null;
                const translation = shuffledWords[currentIndex][lang];
                if (!translation) return null;

                return (
                  <div key={lang} className={styles.wordItem}>
                    <span className={styles.word}>
                      <span className={styles.flag}>{languageConfig[lang].flag}</span>
                      {translation}
                    </span>
                    <AudioButton text={translation} language={languageConfig[lang].flag} />
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={nextWord} className={styles.nextButton}>
            {currentIndex < shuffledWords.length - 1 ? 'Nächstes Wort' : 'Zurück zur Übersicht'}
          </button>
        </div>
      );

    case 'quiz':
      return (
        <div className={styles.container}>
          <button onClick={handleBack} className={styles.backButton}>
            <span>←</span> Zurück zur Auswahlseite
          </button>

          <div className={styles.wordCounter}>
            Wort {currentIndex + 1} von {shuffledWords.length} | Punkte: {score}
          </div>

          {showAnswer && (
            <div className={styles.germanWordContainer}>
              <div className={styles.germanWord}>
                <span className={styles.flag}>🇩🇪</span>
                {shuffledWords[currentIndex].german}
                <AudioButton text={shuffledWords[currentIndex].german} language="🇩🇪" />
              </div>
            </div>
          )}

          <div className={styles.translationsContainer}>
            <div className={styles.translationTitle}>Übersetze ins Deutsche</div>
            <div className={styles.wordList}>
              {selectedLanguages.map(lang => {
                if (!languageConfig[lang]) return null;
                const translation = shuffledWords[currentIndex][lang];
                if (!translation) return null;

                return (
                  <div key={lang} className={styles.wordItem}>
                    <span className={styles.word}>
                      <span className={styles.flag}>{languageConfig[lang].flag}</span>
                      {translation}
                    </span>
                    <AudioButton text={translation} language={languageConfig[lang].flag} />
                  </div>
                );
              })}
            </div>

            <div className={styles.inputContainer}>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Wie heißt das auf Deutsch?"
                className={styles.answerInput}
                disabled={showAnswer}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !showAnswer) checkAnswer();
                  else if (e.key === 'Enter' && showAnswer) nextWord();
                }}
              />
              
              {!showAnswer ? (
                <button onClick={checkAnswer} className={styles.nextButton}>
                  Überprüfen
                </button>
              ) : (
                <button onClick={nextWord} className={styles.nextButton}>
                  {currentIndex < shuffledWords.length - 1 ? 'Nächstes Wort' : 'Quiz beenden'}
                </button>
              )}
            </div>

            {feedback && (
              <div className={`${styles.feedback} ${
                feedback.startsWith('Richtig') ? styles.feedbackCorrect : styles.feedbackWrong
              }`}>
                {feedback}
              </div>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default LearnGerman;
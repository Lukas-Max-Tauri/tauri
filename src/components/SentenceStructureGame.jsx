import React, { useState, useEffect, useRef } from 'react';
import { sentences } from '../data/sentences';
import styles from './SentenceStructureGame.module.css';
import { Volume2, VolumeX } from 'lucide-react';
import { SERVER_URL, isTauri } from '../utils/api';

// Language configuration
const LANGUAGE_CONFIG = {
  english: { flag: '🇬🇧', name: 'Englisch' },
  spanish: { flag: '🇪🇸', name: 'Spanisch' },
  turkish: { flag: '🇹🇷', name: 'Türkisch' },
  arabic: { flag: '🇸🇦', name: 'Arabisch' },
  ukrainian: { flag: '🇺🇦', name: 'Ukrainisch' },
  russian: { flag: '🇷🇺', name: 'Russisch' },
  polish: { flag: '🇵🇱', name: 'Polnisch' },
  romanian: { flag: '🇷🇴', name: 'Rumänisch' },
  italian: { flag: '🇮🇹', name: 'Italienisch' },
  ku: { flag: '🇹🇯', name: 'Kurdisch' },
  farsi: { flag: '🇮🇷', name: 'Farsi' },
  albanian: { flag: '🇦🇱', name: 'Albanisch' },
  serbian: { flag: '🇷🇸', name: 'Serbisch' },
  pashto: { flag: '🇦🇫', name: 'Paschtu' },
  somali: { flag: '🇸🇴', name: 'Somali' },
  tigrinya: { flag: '🇪🇷', name: 'Tigrinya' }
};

// Audio Button Component
const AudioButton = ({ text, language }) => {
  const audioRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateAndPlayAudio = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);

      // Get the correct language code based on the language mapping
      const languageCode = {
        english: 'en-GB',
        spanish: 'es-ES',
        turkish: 'tr-TR',
        arabic: 'ar-XA',
        ukrainian: 'uk-UA',
        russian: 'ru-RU',
        polish: 'pl-PL',
        romanian: 'ro-RO',
        italian: 'it-IT',
        ku: 'tr-TR',
        farsi: 'ar-XA',
        albanian: 'it-IT',
        serbian: 'ru-RU',
        pashto: 'ar-XA',
        somali: 'ar-XA',
        tigrinya: 'ar-XA'
      }[language] || 'de-DE';

      
      const response = await fetch(`${SERVER_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: languageCode })
      });

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      const data = await response.json();
      
      if (audioRef.current) {
        audioRef.current.src = data.audioUrl;
        await audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className={styles['audio-button']}>
      <audio 
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      />
      <button
        onClick={generateAndPlayAudio}
        disabled={isLoading}
        className={`${styles['tts-button']} ${
          isLoading ? styles['loading'] :
          hasError ? styles['error'] :
          isPlaying ? styles['playing'] : ''
        }`}
        title={
          isLoading 
            ? 'Generiere Audio...' 
            : hasError 
            ? 'Fehler bei der Audiogenerierung' 
            : 'Aussprache anhören'
        }
      >
        {hasError ? (
          <VolumeX size={16} className={styles['icon']} />
        ) : (
          <Volume2 size={16} className={styles['icon']} />
        )}
      </button>
    </div>
  );
};

const DraggableWord = ({ word, index, onDragStart, onDrop }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, index)}
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
      onDrop(draggedIndex, index);
    }}
    className={styles['draggable-word']}
  >
    {word}
  </div>
);

const SentenceStructureGame = ({ level, onBack, selectedLanguages, onComplete }) => {
  const [showTranslations, setShowTranslations] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [currentWords, setCurrentWords] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [currentSentences, setCurrentSentences] = useState([]);

  useEffect(() => {
    const levelSentences = sentences[level];
    if (levelSentences) {
      const shuffled = [...levelSentences].sort(() => Math.random() - 0.5);
      setCurrentSentences(shuffled);
      
      if (shuffled.length > 0) {
        setCurrentWords(shuffleArray([...shuffled[0].german]));
      }
    }
  }, [level]);

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const checkAnswer = () => {
    const currentSentence = currentSentences[currentSentenceIndex];
    const userSentence = currentWords.join(' ');
    const isCorrect = userSentence === currentSentence.finalSentence;

    if (isCorrect) {
      setFeedback('Richtig! Super gemacht! 🎉');
      if (currentSentenceIndex === currentSentences.length - 1) {
        onComplete();
      }
    } else {
      setFeedback('Das stimmt noch nicht ganz. Versuche es nochmal!');
    }
  };

  const nextSentence = () => {
    if (currentSentenceIndex < currentSentences.length - 1) {
      setCurrentSentenceIndex(prevIndex => prevIndex + 1);
      setCurrentWords(shuffleArray([...currentSentences[currentSentenceIndex + 1].german]));
      setFeedback('');
      setShowHint(false);
    } else {
      onBack();
    }
  };

  const swapWords = (index1, index2) => {
    const newWords = [...currentWords];
    [newWords[index1], newWords[index2]] = [newWords[index2], newWords[index1]];
    setCurrentWords(newWords);
  };

  if (!currentSentences || currentSentences.length === 0) {
    return <div>Keine Sätze verfügbar.</div>;
  }

  const currentSentence = currentSentences[currentSentenceIndex];

  return (
    <div className={styles['game-container']}>
      <div className={styles['progress-text']}>
        Satz {currentSentenceIndex + 1} von {currentSentences.length}
      </div>

      <div className={styles['drag-drop-area']}>
        <div className={styles['word-container']}>
          {currentWords.map((word, index) => (
            <DraggableWord
              key={index}
              word={word}
              index={index}
              onDragStart={(e, i) => e.dataTransfer.setData('text/plain', i.toString())}
              onDrop={(draggedIndex, droppedIndex) => swapWords(draggedIndex, droppedIndex)}
            />
          ))}
        </div>
      </div>

      {showTranslations && (
        <div className={styles['translation-container']}>
          {Object.entries(LANGUAGE_CONFIG).map(([langKey, langInfo]) => {
            if (selectedLanguages.includes(langKey) && currentSentence[langKey]) {
              return (
                <div key={langKey} className={styles['translation-item']}>
                  <div className={styles['flag-text']}>
                    <span>{langInfo.flag}</span>
                    {currentSentence[langKey]}
                    <AudioButton text={currentSentence[langKey]} language={langKey} />
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      <div className={styles['buttons-grid']}>
        <div className={styles['button-row']}>
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className={`${styles['game-button']} ${styles['button-secondary']}`}
          >
            {showTranslations ? 'Übersetzungen ausblenden' : 'Übersetzungen anzeigen'}
          </button>

          <button
            onClick={checkAnswer}
            className={`${styles['game-button']} ${styles['button-primary']}`}
          >
            Überprüfen
          </button>

          <button
            onClick={() => setShowHint(!showHint)}
            className={`${styles['game-button']} ${styles['button-warning']}`}
          >
            {showHint ? 'Hinweis ausblenden' : 'Hinweis anzeigen'}
          </button>
        </div>

        <div className={styles['button-row']}>
          <button
            onClick={onBack}
            className={`${styles['game-button']} ${styles['button-secondary']}`}
          >
            ← Zurück
          </button>

          {feedback.includes('Richtig') && (
            <button
              onClick={nextSentence}
              className={`${styles['game-button']} ${styles['button-success']}`}
            >
              {currentSentenceIndex < currentSentences.length - 1 
                ? 'Weiter →' 
                : 'Zurück zum Menü'
              }
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`${styles['feedback']} ${
          feedback.includes('Richtig') 
            ? styles['feedback-success'] 
            : styles['feedback-error']}`}
        >
          {feedback}
        </div>
      )}

      {showHint && (
        <div className={styles['hint']}>
          <strong>Hinweis:</strong> {currentSentence.hint}
        </div>
      )}
    </div>
  );
};

export default SentenceStructureGame;
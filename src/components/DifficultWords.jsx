import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import AudioButton from './AudioButton';

// Animationen
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(17, 24, 39, 0.7);
  border-radius: 1rem;
  border: 2px solid rgba(59, 130, 246, 0.3);
  color: white;
`;

const FilterSection = styled.div`
  background: rgba(17, 24, 39, 0.6);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FilterGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FilterTitle = styled.h3`
  font-size: 1.25rem;
  color: #fff;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  color: #e5e7eb;
  cursor: pointer;
  user-select: none;
  font-size: 0.95rem;
`;

const CheckboxInput = styled.input`
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.75rem;
  accent-color: #6366f1;
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 4px;

  &:checked {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const StartQuizButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
  margin: 1.5rem 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
  }
`;

const WordCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    border-color: rgba(59, 130, 246, 0.3);
  }
`;

const WordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const GermanWord = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 1.25rem;
  opacity: 0.7;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const TranslationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const Translation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(4px);
    border-color: rgba(59, 130, 246, 0.3);
  }
`;

const QuizSection = styled.div`
  animation: ${fadeIn} 0.3s ease-out;
`;

const QuizProgress = styled.div`
  text-align: center;
  color: #93c5fd;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 0.75rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;



const QuizInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  text-align: center;
`;

const QuizInput = styled.input`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.75rem;
  color: #fff;
  font-size: 1.1rem;
  text-align: center;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const QuizButton = styled.button`
  width: 100%; /* Änderung von 500px auf 100% */
  max-width: 500px; /* Maximale Breite hinzugefügt */
  padding: 1rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => 
    props.$type === 'check' 
      ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
      : 'linear-gradient(135deg, #10b981, #059669)'
  };
  color: white;
  margin: 0 auto; /* Zentrieren durch auto margins */
  display: block; /* Änderung zu block für bessere Zentrierung */
`;

const Feedback = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
  border-radius: 0.75rem;
  text-align: center;
  animation: ${fadeIn} 0.3s ease-out;
  background: ${props =>
    props.$isCorrect
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(239, 68, 68, 0.1)'
  };
  color: ${props =>
    props.$isCorrect
      ? '#34d399'
      : '#f87171'
  };
  border: 1px solid ${props =>
    props.$isCorrect
      ? 'rgba(52, 211, 153, 0.3)'
      : 'rgba(248, 113, 113, 0.3)'
  };
`;

const Error = styled.div`
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
  padding: 1rem;
  border-radius: 0.75rem;
  margin: 1rem 0;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

const WordMeta = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  font-size: 0.875rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CategoryPath = styled.div`
  font-size: 0.9rem;
  color: #9ca3af;
  margin-left: 0.5rem;
`;

// Haupt-Komponente
const DifficultWords = ({ 
  difficultWords, 
  selectedLanguages, 
  onWordResult, 
  onDeleteWord, 
  wordCategories,
  dailyWords
}) => {
  // State-Definitionen bleiben gleich
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedSources, setSelectedSources] = useState(['learn', 'daily']);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [quizWords, setQuizWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  // Language Config bleibt gleich
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

  // Filter-Logik bleibt gleich
  const filteredDifficultWords = Object.entries(difficultWords)
    .filter(([key, item]) => {
      if (key === 'tempWrongCount') return false;
      if (!item || !item.word) return false;
      if (!selectedSources.includes(item.source)) return false;
      if (item.source === 'daily' && selectedCategories.length > 0) {
        return selectedCategories.includes(item.word.category);
      }
      return true;
    });

  // Event Handler bleiben gleich
  const handleDeleteWord = (wordKey) => {
    if (window.confirm('Möchtest du dieses Wort wirklich aus der Liste der schwierigen Wörter entfernen?')) {
      onDeleteWord(wordKey);
    }
  };

  const startQuiz = () => {
    if (selectedSources.length === 0) {
      setError('Bitte mindestens eine Quelle auswählen');
      return;
    }

    const quizWordsList = filteredDifficultWords
      .map(([_, item]) => item.word)
      .sort(() => Math.random() - 0.5);

    if (quizWordsList.length === 0) {
      setError('Keine schwierigen Wörter in den ausgewählten Quellen/Kategorien gefunden');
      return;
    }

    setQuizWords(quizWordsList);
    setCurrentIndex(0);
    setScore(0);
    setUserInput('');
    setFeedback('');
    setShowAnswer(false);
    setQuizStarted(true);
    setError('');
  };

  const checkAnswer = () => {
    if (!userInput.trim()) {
      setFeedback('Bitte gib eine Antwort ein!');
      return;
    }

    const currentWord = quizWords[currentIndex];
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
    if (currentIndex < quizWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setFeedback('');
      setShowAnswer(false);
    } else {
      setQuizStarted(false);
      setFeedback(`Quiz beendet! Dein Score: ${score}/${quizWords.length}`);
    }
  };

  // Quiz View
  if (quizStarted) {
    const currentWord = quizWords[currentIndex];
    
    return (
      <Container>
        <QuizSection>
          <QuizProgress>
            Wort {currentIndex + 1} von {quizWords.length} | Punkte: {score}
          </QuizProgress>

          <TranslationsGrid>
            {selectedLanguages.map(lang => {
              const translation = currentWord[lang];
              if (!translation) return null;

              const langConfig = languageConfig[lang];
              return (
                <Translation key={lang}>
                  <span>{langConfig.flag}</span>
                  <span>{translation}</span>
                  <AudioButton text={translation} language={langConfig.flag} />
                </Translation>
              );
            })}
          </TranslationsGrid>

          <QuizInputContainer>
            <QuizInput
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Wie heißt das auf Deutsch?"
              disabled={showAnswer}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (!showAnswer) checkAnswer();
                  else nextWord();
                }
              }}
            />

            {!showAnswer ? (
              <QuizButton onClick={checkAnswer} $type="check">
                Überprüfen
              </QuizButton>
            ) : (
              <>
                <GermanWord>
                  <span>🇩🇪</span>
                  {currentWord.german}
                  <AudioButton text={currentWord.german} language="🇩🇪" />
                </GermanWord>
                <QuizButton onClick={nextWord} $type="next">
                  {currentIndex < quizWords.length - 1 ? 'Nächstes Wort' : 'Quiz beenden'}
                </QuizButton>
              </>
            )}

            {feedback && (
              <Feedback $isCorrect={feedback.includes('Richtig')}>
                {feedback}
              </Feedback>
            )}
          </QuizInputContainer>
        </QuizSection>
      </Container>
    );
  }

  // Main View
  return (
    <Container>
      <FilterSection>
        <FilterGroup>
          <FilterTitle>Quellen auswählen:</FilterTitle>
          <CheckboxGroup>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selectedSources.includes('learn')}
                onChange={() => {
                  setSelectedSources(prev => 
                    prev.includes('learn')
                      ? prev.filter(s => s !== 'learn')
                      : [...prev, 'learn']
                  );
                  setError('');
                }}
              />
              <span>Vokabeln lernen</span>
            </CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selectedSources.includes('daily')}
                onChange={() => {
                  setSelectedSources(prev => 
                    prev.includes('daily')
                      ? prev.filter(s => s !== 'daily')
                      : [...prev, 'daily']
                  );
                  if (selectedSources.includes('daily')) {
                    setSelectedCategories([]);
                  }
                  setError('');
                }}
              />
              <span>Wort des Tages</span>
            </CheckboxLabel>
          </CheckboxGroup>
        </FilterGroup>

        {selectedSources.includes('daily') && wordCategories && wordCategories.length > 0 && (
          <FilterGroup>
            <FilterTitle>Kategorien:</FilterTitle>
            {wordCategories.map(category => (
              <CheckboxGroup key={category.id}>
                <CheckboxLabel>
                  <CheckboxInput
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => {
                      setSelectedCategories(prev =>
                        prev.includes(category.id)
                          ? prev.filter(c => c !== category.id)
                          : [...prev, category.id]
                      );
                    }}
                  />
                  <span>{category.path.join(' > ')}</span>
                </CheckboxLabel>
              </CheckboxGroup>
            ))}
          </FilterGroup>
        )}

        {error && <Error>{error}</Error>}

        <StartQuizButton onClick={startQuiz}>
          Quiz starten ({filteredDifficultWords.length} Wörter)
        </StartQuizButton>
      </FilterSection>

      {filteredDifficultWords.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Keine schwierigen Wörter in den ausgewählten Quellen/Kategorien vorhanden.
        </div>
      ) : (
        <div>
          {filteredDifficultWords.map(([key, item]) => {
            const dailyWord = item.source === 'daily' 
              ? dailyWords.find(w => w.german === item.word.german)
              : null;

            return (
              <WordCard key={key}>
                <WordHeader>
                  <GermanWord>
                    <span>🇩🇪</span>
                    {item.word.german}
                    <AudioButton text={item.word.german} language="🇩🇪" />
                  </GermanWord>
                  <DeleteButton onClick={() => handleDeleteWord(key)}>
                    🗑️
                  </DeleteButton>
                </WordHeader>

                <TranslationsGrid>
                  {selectedLanguages.map(lang => {
                    const translation = item.word[lang];
                    if (!translation) return null;

                    const langConfig = languageConfig[lang];
                    return (
                      <Translation key={lang}>
                        <span>{langConfig.flag}</span>
                        <span>{translation}</span>
                        <AudioButton text={translation} language={langConfig.flag} />
                      </Translation>
                    );
                  })}
                </TranslationsGrid>

                <WordMeta>
                  <span>
                    <span>📚</span>
                    {item.source === 'daily' ? 'Wort des Tages' : 'Vokabeln lernen'}
                  </span>
                  {dailyWord && dailyWord.category && (
                    <span>
                      <span>📂</span>
                      {wordCategories.find(c => c.id === dailyWord.category)?.path.join(' > ') || 'Unbekannt'}
                    </span>
                  )}
                  <span>
                    <span>❌</span>
                    Falsch: {item.wrongCount}x
                  </span>
                  <span>
                    <span>✅</span>
                    Richtig: {item.correctCount}/3
                  </span>
                </WordMeta>
              </WordCard>
            );
          })}
        </div>
      )}
    </Container>
  );
};

export default DifficultWords;
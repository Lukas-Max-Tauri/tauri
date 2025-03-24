import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import AudioButton from './AudioButton';

// Animations
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

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #93c5fd;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  text-align: center;
  margin-bottom: 2rem;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled.button`
  padding: 1rem;
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => props.$primary && `
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    
    &:hover {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
  `}

  ${props => props.$secondary && `
    background: linear-gradient(135deg, #10b981, #059669);
    
    &:hover {
      background: linear-gradient(135deg, #059669, #047857);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
  `}
`;

const QuizButton = styled(ActionButton)`
  background: linear-gradient(135deg, #4f46e5, #3730a3);
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #3730a3, #312e81);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }
`;

const FolderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.2);
  }
`;

const FolderButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;

  span.count {
    font-size: 0.875rem;
    color: #93c5fd;
    background: rgba(59, 130, 246, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
  }
`;

const FolderActions = styled.div`
  display: flex;
  gap: 0.5rem;

  button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }
  }
`;

const SentenceCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeIn} 0.3s ease-out;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }
`;

const GermanSentence = styled.div`
  font-size: 1.25rem;
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span.flag {
    font-size: 1.5rem;
  }
`;

const TranslationGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Translation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(4px);
  }

  span.flag {
    font-size: 1.25rem;
  }
`;

const Hint = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 0.5rem;
  color: #fbbf24;
  font-size: 0.875rem;
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

const Form = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 5rem;
  overflow-y: auto;
  overflow-x: hidden; // Horizontales Scrollen verhindern
  max-height: 85vh;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(59, 130, 246, 0.5);
    }
  }
`;

const ButtonContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 4rem);
  max-width: 768px;
  background: rgba(17, 24, 39, 0.95);
  padding: 1rem;
  display: flex;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 0 1rem 1rem;
  z-index: 10;
  backdrop-filter: blur(8px);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: #93c5fd;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const TextArea = styled(Input).attrs({ as: 'textarea' })`
  min-height: 100px;
  resize: vertical;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.15);
  }

  option {
    background: #1f2937;
    color: white;
  }
`;

const Error = styled.div`
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 0.875rem;
`;

const Success = styled.div`
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 0.875rem;
`;

const QuizContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const QuizProgress = styled.div`
  text-align: center;
  color: #93c5fd;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 0.75rem;
`;

const DragDropArea = styled.div`
  background: rgba(17, 24, 39, 0.5);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1rem 0;
`;

const WordContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  padding: 1rem;
`;

const DraggableWord = styled.div`
  background: #4f46e5;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: move;
  user-select: none;
  transition: all 0.2s ease;
  border: 1px solid #6366f1;

  &:hover {
    transform: scale(1.05);
    background: #4338ca;
  }
`;

const CategoryFolder = ({ category, categories, sentences, onAddSubcategory, onDeleteCategory, onDeleteSentence, selectedLanguages, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const subcategories = categories.filter(c => c.parentId === category.id);
  const categorySentences = sentences.filter(sentence => sentence.category === category.id);

  const handleAddSubcategory = () => {
    if (newCategoryName.trim()) {
      onAddSubcategory(newCategoryName.trim(), category.id);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    }
  };

  const handleDeleteConfirm = () => {
    onDeleteCategory(category.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div style={{ marginLeft: `${depth * 1.5}rem` }}>
      <FolderHeader>
        <FolderButton onClick={() => setIsOpen(!isOpen)}>
          <span>{isOpen ? '📂' : '📁'}</span>
          {category.name}
          {categorySentences.length > 0 && (
            <span className="count">{categorySentences.length}</span>
          )}
        </FolderButton>
        <FolderActions>
          <button onClick={() => setShowNewCategoryInput(true)} title="Neue Unterkategorie">➕</button>
          <button onClick={() => setShowDeleteConfirm(true)} title="Kategorie löschen">🗑️</button>
        </FolderActions>
      </FolderHeader>

      {showDeleteConfirm && (
        <div style={{ margin: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
          <p>Möchten Sie diese Kategorie wirklich löschen?</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <ActionButton $primary onClick={handleDeleteConfirm}>Ja, löschen</ActionButton>
            <ActionButton $secondary onClick={() => setShowDeleteConfirm(false)}>Abbrechen</ActionButton>
         </div>
       </div>
     )}

     {showNewCategoryInput && (
       <div style={{ margin: '1rem', display: 'flex', gap: '0.5rem' }}>
         <Input
           type="text"
           value={newCategoryName}
           onChange={(e) => setNewCategoryName(e.target.value)}
           placeholder="Neue Unterkategorie..."
           onKeyPress={(e) => {
             if (e.key === 'Enter') {
               handleAddSubcategory();
             }
           }}
         />
         <ActionButton $primary onClick={handleAddSubcategory}>➕</ActionButton>
         <ActionButton $secondary onClick={() => setShowNewCategoryInput(false)}>✖️</ActionButton>
       </div>
     )}

     {isOpen && (
       <div style={{ marginLeft: '1.5rem' }}>
         {subcategories.map(subcat => (
           <CategoryFolder
             key={subcat.id}
             category={subcat}
             categories={categories}
             sentences={sentences}
             onAddSubcategory={onAddSubcategory}
             onDeleteCategory={onDeleteCategory}
             onDeleteSentence={onDeleteSentence}
             selectedLanguages={selectedLanguages}
             depth={depth + 1}
           />
         ))}

         {categorySentences.map(sentence => (
           <SentenceCard key={sentence.id}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <GermanSentence>
                 <span className="flag">🇩🇪</span>
                 {sentence.german}
                 <AudioButton text={sentence.german} language="🇩🇪" />
               </GermanSentence>
               <DeleteButton onClick={() => onDeleteSentence(sentence.id)}>
                 🗑️
               </DeleteButton>
             </div>

             <TranslationGroup>
               {selectedLanguages.map(lang => {
                 const langConfig = {
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
                 }[lang];

                 if (!langConfig || !sentence[lang]) return null;

                 return (
                   <Translation key={lang}>
                     <span className="flag">{langConfig.flag}</span>
                     {sentence[lang]}
                     <AudioButton text={sentence[lang]} language={langConfig.flag} />
                   </Translation>
                 );
               })}
             </TranslationGroup>

             {sentence.hint && (
               <Hint>
                 <strong>Hinweis:</strong> {sentence.hint}
               </Hint>
             )}
           </SentenceCard>
         ))}
       </div>
     )}
   </div>
 );
};

// Main Component
function DailySentence({
 sentences,
 categories,
 onAddSentence,
 onDeleteSentence,
 onAddCategory,
 onDeleteCategory,
 selectedLanguages,
 onComplete
}) {
  const [mode, setMode] = useState('main');
 const [newCategory, setNewCategory] = useState('');
 const [quizSentences, setQuizSentences] = useState([]);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [showAnswer, setShowAnswer] = useState(false);
 const [feedback, setFeedback] = useState('');
 const [showHint, setShowHint] = useState(false);
 const [showTranslations, setShowTranslations] = useState(false);
 const [currentWords, setCurrentWords] = useState([]);
 const [successMessage, setSuccessMessage] = useState('');
 const [newSentence, setNewSentence] = useState({
   german: '',
   ukrainian: '',
   arabic: '',
   turkish: '',
   english: '',
   spanish: '',
   russian: '',
   polish: '',
   romanian: '',
   ku: '',
   farsi: '',
   albanian: '',
   serbian: '',
   italian: '',
   pashto: '',
   somali: '',
   tigrinya: '',
   category: '',
   hint: ''
 });
 const [error, setError] = useState('');

 // Language configuration for form labels and flags 
 const languageConfig = {
   ukrainian: { label: 'Ukrainisch', flag: '🇺🇦' },
   arabic: { label: 'Arabisch', flag: '🇸🇦' },
   turkish: { label: 'Türkisch', flag: '🇹🇷' },
   english: { label: 'Englisch', flag: '🇬🇧' }, 
   spanish: { label: 'Spanisch', flag: '🇪🇸' },
   russian: { label: 'Russisch', flag: '🇷🇺' },
   polish: { label: 'Polnisch', flag: '🇵🇱' },
   romanian: { label: 'Rumänisch', flag: '🇷🇴' },
   ku: { label: 'Kurdisch', flag: '🇹🇯' },
   farsi: { label: 'Farsi', flag: '🇮🇷' },
   albanian: { label: 'Albanisch', flag: '🇦🇱' },
   serbian: { label: 'Serbisch', flag: '🇷🇸' },
   italian: { label: 'Italienisch', flag: '🇮🇹' },
   pashto: { label: 'Paschtu', flag: '🇦🇫' },
   somali: { label: 'Somali', flag: '🇸🇴' },
   tigrinya: { label: 'Tigrinya', flag: '🇪🇷' }
 };

 const handleInputChange = (field, value) => {
   setNewSentence(prev => ({
     ...prev,
     [field]: value
   }));
   setError('');
 };

 const handleSubmit = () => {
   if (!newSentence.german.trim()) {
     setError('Der deutsche Satz muss ausgefüllt werden!');
     return;
   }

   if (!newSentence.category) {
     setError('Bitte wähle eine Kategorie aus!');
     return;
   }

   const hasTranslation = selectedLanguages.some(lang => newSentence[lang]?.trim());
   if (!hasTranslation) {
     setError('Mindestens eine Übersetzung muss angegeben werden!');
     return;
   }

   onAddSentence(newSentence);
   setSuccessMessage('Satz erfolgreich gespeichert!');
   setTimeout(() => setSuccessMessage(''), 3000);

   setNewSentence(prev => ({
     german: '',
     ukrainian: '',
     arabic: '',
     turkish: '',
     english: '',
     spanish: '',
     russian: '',
     polish: '',
     romanian: '',
     ku: '',
     farsi: '',
     albanian: '',
     serbian: '',
     italian: '',
     pashto: '',
     somali: '',
     tigrinya: '',
     category: prev.category,
     hint: ''
   }));
 };

// Verbesserte Fisher-Yates Shuffle-Funktion
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Diese Funktion garantiert, dass die gemischte Reihenfolge 
// sich von der Originalreihenfolge unterscheidet
const guaranteedShuffle = (array) => {
  // Wenn die Liste nur 1 oder 2 Elemente hat, kann man nicht garantieren,
  // dass die gemischte Reihenfolge anders als das Original ist
  if (array.length <= 2) return shuffleArray(array);
  
  const original = [...array];
  let shuffled = shuffleArray(array);
  
  // Prüfen, ob die Reihenfolge gleich geblieben ist
  const isEqual = shuffled.every((item, index) => item === original[index]);
  
  // Wenn gleich, nochmal mischen (maximal 5 Versuche)
  let attempts = 0;
  while (isEqual && attempts < 5) {
    shuffled = shuffleArray(array);
    attempts++;
  }
  
  return shuffled;
};

 const resetQuizState = () => {
   setCurrentIndex(0);
   setQuizSentences([]);
   setCurrentWords([]);
   setShowAnswer(false);
   setFeedback('');
   setShowHint(false);
   setShowTranslations(false);
 };

 const renderContent = () => {
   switch(mode) {
     case 'add':
       return (
         <Form>
           <FormGroup>
             <Label>Kategorie</Label>
             <div style={{ marginBottom: '1rem' }}>
               <Select
                 value={newSentence.category}
                 onChange={(e) => handleInputChange('category', e.target.value)}
               >
                 <option value="">Kategorie auswählen...</option>
                 {categories.map((cat) => (
                   <option key={cat.id} value={cat.id}>
                     {cat.path.join(' > ')}
                   </option>
                 ))}
               </Select>
             </div>
             <div style={{ display: 'flex', gap: '1rem' }}>
               <Input
                 type="text"
                 value={newCategory}
                 onChange={(e) => setNewCategory(e.target.value)}
                 placeholder="Neue Kategorie..."
               />
               <ActionButton
                 $primary
                 onClick={() => {
                   if (newCategory.trim()) {
                     onAddCategory(newCategory.trim());
                     setNewCategory('');
                   }
                 }}
                 style={{ minWidth: '44px', width: '44px', padding: '0' }}
               >
                 ➕
               </ActionButton>
             </div>
           </FormGroup>

           <FormGroup>
             <Label>Deutscher Satz</Label>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <TextArea
                 value={newSentence.german}
                 onChange={(e) => handleInputChange('german', e.target.value)}
                 placeholder="Deutscher Satz *"
               />
               {newSentence.german && 
                 <AudioButton text={newSentence.german} language="🇩🇪" />
               }
             </div>
           </FormGroup>

           {selectedLanguages.map(lang => (
             <FormGroup key={lang}>
               {languageConfig[lang] && (
                 <>
                   <Label>{languageConfig[lang].flag} {languageConfig[lang].label}</Label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <TextArea
                       value={newSentence[lang]}
                       onChange={(e) => handleInputChange(lang, e.target.value)}
                       placeholder={`${languageConfig[lang].label}e Übersetzung`}
                       dir={lang === 'arabic' || lang === 'farsi' ? 'rtl' : 'ltr'}
                     />
                     {newSentence[lang] && 
                       <AudioButton text={newSentence[lang]} language={languageConfig[lang].flag} />
                     }
                   </div>
                 </>
               )}
             </FormGroup>
           ))}

           <FormGroup>
             <Label>Hinweis (optional)</Label>
             <TextArea
               value={newSentence.hint}
               onChange={(e) => handleInputChange('hint', e.target.value)}
               placeholder="Hinweis zur Satzstruktur"
             />
           </FormGroup>

           {error && <Error>{error}</Error>}
           {successMessage && <Success>{successMessage}</Success>}

           <ButtonContainer>
  <ActionButton $primary onClick={handleSubmit}>
    Satz speichern
  </ActionButton>
  <ActionButton $secondary onClick={() => setMode('main')}>
    Zurück
  </ActionButton>
</ButtonContainer>
         </Form>
       );

     case 'categorySelect':
       return (
         <Form>
           <Title>Quiz - Kategorien auswählen</Title>
           <div style={{ marginBottom: '2rem' }}>
             {categories.map((category) => (
               <div key={category.id} style={{ marginBottom: '1rem' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <input
                     type="checkbox"
                     onChange={(e) => {
                       if (e.target.checked) {
                         const newSentences = sentences.filter(s => s.category === category.id);
                         setQuizSentences(prev => [...prev, ...newSentences]);
                       } else {
                         setQuizSentences(prev =>
                           prev.filter(s => s.category !== category.id)
                         );
                       }
                     }}
                     style={{ width: '1.2rem', height: '1.2rem' }}
                   />
                   {category.path.join(' > ')}
                 </label>
               </div>
             ))}
           </div>

           {error && <Error>{error}</Error>}

           <div style={{ display: 'flex', gap: '1rem' }}>
             <ActionButton
               $primary
               onClick={() => {
                 if (quizSentences.length === 0) {
                   setError('Bitte wähle mindestens eine Kategorie aus');
                   return;
                 }
                 // Mische die ausgewählten Sätze
                 const shuffledSentences = [...quizSentences].sort(() => Math.random() - 0.5);
                 setQuizSentences(shuffledSentences);
                 // Setze das erste Wort
                 setCurrentWords(shuffledSentences[0].german.split(' ').sort(() => Math.random() - 0.5));
                 setCurrentIndex(0);
                 setMode('quiz');
               }}
             >
               Quiz starten ({quizSentences.length} Sätze)
             </ActionButton>
             <ActionButton $secondary onClick={() => {
               setMode('main');
               setQuizSentences([]);
               setError('');
             }}>
               Zurück
             </ActionButton>
           </div>
         </Form>
       );

     case 'quiz':
       const currentSentence = quizSentences[currentIndex];
       return (
         <QuizContainer>
           <QuizProgress>
             Satz {currentIndex + 1} von {quizSentences.length}
           </QuizProgress>

           {currentSentence && (
             <>
               {showTranslations && (
                 <TranslationGroup>
                   {selectedLanguages.map(lang => {
                     const langConfig = languageConfig[lang];
                     if (!langConfig || !currentSentence[lang]) return null;

                     return (
                       <Translation key={lang}>
                         <span className="flag">{langConfig.flag}</span>
                         {currentSentence[lang]}
                         <AudioButton text={currentSentence[lang]} language={langConfig.flag} />
                       </Translation>
                     );
                   })}
                 </TranslationGroup>
               )}

               <DragDropArea>
                 <WordContainer>
                   {currentWords.map((word, index) => (
                     <DraggableWord
                       key={index}
                       draggable
                       onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                       onDragOver={(e) => e.preventDefault()}
                       onDrop={(e) => {
                         e.preventDefault();
                         const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                         const newWords = [...currentWords];
                         [newWords[draggedIndex], newWords[index]] = [newWords[index], newWords[draggedIndex]];
                         setCurrentWords(newWords);
                         setShowAnswer(false);
                         setFeedback('');
                       }}
                     >
                       {word}
                     </DraggableWord>
                   ))}
                 </WordContainer>
               </DragDropArea>

               <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'center' }}>
                 <QuizButton onClick={() => setShowTranslations(!showTranslations)}>
                   {showTranslations ? 'Übersetzungen ausblenden' : 'Übersetzungen anzeigen'}
                 </QuizButton>

                 <QuizButton onClick={() => setShowHint(!showHint)}>
                   {showHint ? 'Hinweis ausblenden' : 'Hinweis anzeigen'}
                 </QuizButton>
               </div>

               {showHint && currentSentence.hint && (
                 <Hint>
                   <strong>Hinweis:</strong> {currentSentence.hint}
                 </Hint>
               )}

               <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                 {!showAnswer ? (
                   <ActionButton
                     $primary
                     onClick={() => {
                       const isCorrect = currentWords.join(' ') === currentSentence.german;
                       setShowAnswer(true);
                       setFeedback(
                         isCorrect
                           ? 'Richtig! Super gemacht! 🎉'
                           : `Noch nicht ganz richtig. Die richtige Antwort ist: ${currentSentence.german}`
                       );
                     }}
                   >
                     Überprüfen
                   </ActionButton>
                 ) : (
                   <ActionButton
                     $secondary
                     onClick={() => {
                       if (currentIndex < quizSentences.length - 1) {
                         setCurrentIndex(currentIndex + 1);
                         setCurrentWords(shuffleArray(quizSentences[currentIndex + 1].german.split(' ')));
                         setShowAnswer(false);
                         setFeedback('');
                         setShowHint(false);
                         setShowTranslations(false);
                       } else {
                         setMode('main');
                         resetQuizState();
                       }
                     }}
                   >
                     {currentIndex < quizSentences.length - 1 ? 'Nächster Satz' : 'Quiz beenden'}
                   </ActionButton>
                 )}
               </div>

               {feedback && (
                 <Error style={{ 
                   textAlign: 'center',
                   background: feedback.includes('Richtig') 
                     ? 'rgba(16, 185, 129, 0.1)' 
                     : 'rgba(239, 68, 68, 0.1)',
                   color: feedback.includes('Richtig') 
                     ? '#10b981' 
                     : '#ef4444'
                 }}>
                   {feedback}
                 </Error>
               )}
             </>
           )}
         </QuizContainer>
       );

     default:
       return (
         <>
           <ActionButtons>
             <ActionButton $primary onClick={() => setMode('add')}>
               Neuen Satz hinzufügen
             </ActionButton>
             <ActionButton $secondary onClick={() => setMode('categorySelect')}>
               Quiz starten
             </ActionButton>
           </ActionButtons>

           <div>
             {categories
               .filter(cat => !cat.parentId)
               .map(category => (
                 <CategoryFolder
                   key={category.id}
                   category={category}
                   categories={categories}
                   sentences={sentences}
                   onAddSubcategory={onAddCategory}
                   onDeleteCategory={onDeleteCategory}
                   onDeleteSentence={onDeleteSentence}
                   selectedLanguages={selectedLanguages}
                 />
               ))}
           </div>
         </>
       );
   }
 };

 return (
   <Container>
     <Title>Satz des Tages</Title>
     {renderContent()}
   </Container>
 );
}

export default DailySentence;
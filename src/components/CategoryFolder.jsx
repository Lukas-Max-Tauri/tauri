// CategoryFolder.jsx
import React, { useState } from 'react';
import AudioButton from './AudioButton';
import styles from './DailyWordView.module.css';

const CategoryFolder = ({ 
  category, 
  categories, 
  words, 
  onAddSubcategory,
  onDeleteCategory, 
  onDeleteWord,
  showWords = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Unterkategorien und Wörter finden
  const subcategories = categories.filter(c => c.parentId === category.id);
  const categoryWords = words.filter(word => word.category === category.id);

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
            onClick={() => {
              if (window.confirm('Möchten Sie diese Kategorie und alle zugehörigen Wörter wirklich löschen?')) {
                onDeleteCategory(category.id);
              }
            }}
            className={styles.actionButton}
            title="Kategorie löschen"
          >
            🗑️
          </button>
        </div>
      </div>

      {showNewCategoryInput && (
        <div className={styles.newCategoryInput}>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Neue Unterkategorie..."
            className={styles.input}
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
              showWords={showWords}
            />
          ))}
          {showWords && categoryWords.map((word) => (
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
                {Object.entries(languageConfig).map(([langKey, langData]) => {
                  if (word[langKey]) {
                    return (
                      <div key={langKey} className={styles.translation}>
                        <span className={styles.flag}>{langData.flag}</span>
                        <span className={styles.translationText} dir={rtlLanguages.includes(langKey) ? 'rtl' : 'ltr'}>
                          {word[langKey]}
                        </span>
                        <AudioButton text={word[langKey]} language={langData.flag} />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFolder;
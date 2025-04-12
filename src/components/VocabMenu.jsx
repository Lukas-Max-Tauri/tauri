// src/components/VocabMenu.jsx
import React from 'react';
import styles from './VocabMenu.module.css';

const VocabMenu = ({ onSelectOption }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <span className={styles.icon}>📚</span>
        Vokabel-Training
      </h2>
      
      <div className={styles.buttonGroup}>
        <button
          onClick={() => onSelectOption('learn')}
          className={styles.menuButton}
        >
          <div className={styles.buttonContent}>
            <span className={styles.buttonIcon}>📖</span>
            <div className={styles.textContent}>
              <h3 className={styles.buttonTitle}>Vokabeln lernen</h3>
              <p className={styles.buttonDescription}>Voreingestellte Vokabeln</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelectOption('daily')}
          className={styles.menuButton}
        >
          <div className={styles.buttonContent}>
            <span className={styles.buttonIcon}>⭐</span>
            <div className={styles.textContent}>
              <h3 className={styles.buttonTitle}>Wort des Tages</h3>
              <p className={styles.buttonDescription}>Erstelle eigene Wörter</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelectOption('difficult')}
          className={styles.menuButton}
        >
          <div className={styles.buttonContent}>
            <span className={styles.buttonIcon}>🎯</span>
            <div className={styles.textContent}>
              <h3 className={styles.buttonTitle}>Schwierige Wörter</h3>
              <p className={styles.buttonDescription}>Hier erscheinen alle Wörter, die du im Quiz falsch beantwortest</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default VocabMenu;
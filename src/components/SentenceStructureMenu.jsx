import React from 'react';
import styles from './SentenceStructureMenu.module.css';

const SentenceStructureMenu = ({ onSelectLevel }) => {
  return (
    <div className={styles.menu}>
      <p className={styles.title}>
        Wähle eine Schwierigkeitsstufe aus:
      </p>
      
      <div className={styles.buttonGrid}>
        <button
          onClick={() => onSelectLevel('easy')}
          className={`${styles.levelButton} ${styles.buttonEasy}`}
        >
          <div className={styles.buttonContent}>
            <div className={styles.buttonText}>
              <span className={styles.heading}>Einfache Sätze</span>
              <span className={styles.description}>
                Grundlegende Satzstrukturen mit Subjekt und Prädikat
              </span>
            </div>
            <span className={styles.arrow}>→</span>
          </div>
        </button>

        <button
          onClick={() => onSelectLevel('medium')}
          className={`${styles.levelButton} ${styles.buttonMedium}`}
        >
          <div className={styles.buttonContent}>
            <div className={styles.buttonText}>
              <span className={styles.heading}>Mittlere Sätze</span>
              <span className={styles.description}>
                Erweiterte Sätze mit Zeitangaben und Objekten
              </span>
            </div>
            <span className={styles.arrow}>→</span>
          </div>
        </button>

        <button
          onClick={() => onSelectLevel('hard')}
          className={`${styles.levelButton} ${styles.buttonHard}`}
        >
          <div className={styles.buttonContent}>
            <div className={styles.buttonText}>
              <span className={styles.heading}>Schwere Sätze</span>
              <span className={styles.description}>
                Komplexe Sätze mit Nebensätzen
              </span>
            </div>
            <span className={styles.arrow}>→</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SentenceStructureMenu;
// VocabCategorySelection.jsx
import React from 'react';
import styles from './VocabCategorySelection.module.css';

const VocabCategorySelection = ({ onSelectCategory }) => {
  const categories = [
    // Grundlagen
    {
      id: 'greetings',
      title: 'Grüße & Begrüßungen',
      icon: '👋',
      description: 'Hallo, Danke, Bitte, Auf Wiedersehen...'
    },
    {
      id: 'zahlen1-12',
      title: 'Zahlen 1-12',
      icon: '🔢',
      description: 'Die ersten grundlegenden Zahlen'
    },
    {
      id: 'zahlen13-25',
      title: 'Zahlen 13-25',
      icon: '🔢',
      description: 'Weitere Zahlen zum Lernen'
    },
    {
      id: 'zahlen-bis-100',
      title: 'Zahlen bis 100',
      icon: '💯',
      description: 'Zählen bis hundert'
    },
    {
      id: 'zahlen-gross',
      title: 'Große Zahlen',
      icon: '🧮',
      description: 'Große Zahlen und Mengen'
    },
    {
      id: 'farben',
      title: 'Farben',
      icon: '🎨',
      description: 'Alle Farben und Farbbezeichnungen'
    },
    {
      id: 'formen',
      title: 'Formen',
      icon: '⭐',
      description: 'Kreise, Quadrate und andere Formen'
    },
    {
      id: 'fragewoerter',
      title: 'Fragewörter',
      icon: '❓',
      description: 'Wer, Was, Wann, Wo, Warum...'
    },
    {
      id: 'pronomen',
      title: 'Pronomen',
      icon: '👤',
      description: 'Ich, Du, Er, Sie, Es, Wir, Ihr...'
    },
    
    // Menschen & soziale Umgebung
    {
      id: 'familie',
      title: 'Familie',
      icon: '👨‍👩‍👧‍👦',
      description: 'Familienmitglieder und Beziehungen'
    },
    {
      id: 'berufe',
      title: 'Berufe',
      icon: '👩‍⚕️',
      description: 'Verschiedene Berufe und Tätigkeiten'
    },
    {
      id: 'schule',
      title: 'Schule',
      icon: '🏫',
      description: 'Vokabeln rund um die Schule'
    },
    {
      id: 'kindergarten',
      title: 'Kindergarten',
      icon: '🧸',
      description: 'Begriffe aus dem Kindergarten'
    },
    {
      id: 'kommunikation',
      title: 'Kommunikation',
      icon: '💬',
      description: 'Sprechen, Schreiben, Telefonieren...'
    },
    
    // Alltag & Freizeit
    {
      id: 'essen-kinder',
      title: 'Essen für Kinder',
      icon: '🍎',
      description: 'Kinderfreundliche Essensbegriffe'
    },
    {
      id: 'essen-trinken',
      title: 'Essen & Trinken',
      icon: '🍽️',
      description: 'Lebensmittel und Getränke'
    },
    {
      id: 'obst-gemuese',
      title: 'Obst & Gemüse',
      icon: '🥦',
      description: 'Früchte und Gemüsesorten'
    },
    {
      id: 'kleidung',
      title: 'Kleidung',
      icon: '👕',
      description: 'Kleidungsstücke und Accessoires'
    },
    {
      id: 'einkaufen',
      title: 'Einkaufen',
      icon: '🛒',
      description: 'Vokabeln zum Thema Einkaufen'
    },
    {
      id: 'kinderzimmer',
      title: 'Kinderzimmer',
      icon: '🛏️',
      description: 'Gegenstände im Kinderzimmer'
    },
    {
      id: 'spielzeug',
      title: 'Spielzeug',
      icon: '🧩',
      description: 'Verschiedene Spielzeuge'
    },
    {
      id: 'gegenstaende',
      title: 'Gegenstände',
      icon: '📱',
      description: 'Alltägliche Gegenstände'
    },
    {
      id: 'uhrzeit',
      title: 'Uhrzeit',
      icon: '🕒',
      description: 'Die Uhr lesen und Zeiten'
    },
    
    // Natur & Umwelt
    {
      id: 'tiere1',
      title: 'Tiere 1',
      icon: '🐶',
      description: 'Haustiere und bekannte Tiere'
    },
    {
      id: 'tiere2',
      title: 'Tiere 2',
      icon: '🦁',
      description: 'Weitere Tiere und Wildtiere'
    },
    {
      id: 'wetter',
      title: 'Wetter',
      icon: '☀️',
      description: 'Wetterbedingungen und Jahreszeiten'
    },
    {
      id: 'landschaft',
      title: 'Landschaft',
      icon: '🏞️',
      description: 'Natürliche Umgebungen und Merkmale'
    },
    
    // Aktivitäten & Eigenschaften
    {
      id: 'sport',
      title: 'Sport',
      icon: '⚽',
      description: 'Sportarten und sportliche Aktivitäten'
    },
    {
      id: 'hobbies1',
      title: 'Hobbys 1',
      icon: '🎨',
      description: 'Freizeitaktivitäten und Interessen'
    },
    {
      id: 'hobbies2',
      title: 'Hobbys 2',
      icon: '🎮',
      description: 'Weitere Freizeitaktivitäten'
    },
    {
      id: 'reisen',
      title: 'Reisen',
      icon: '✈️',
      description: 'Verkehrsmittel und Reisebegriffe'
    },
    {
      id: 'koerperteile',
      title: 'Körperteile',
      icon: '👂',
      description: 'Teile des menschlichen Körpers'
    },
    {
      id: 'gefuehle',
      title: 'Gefühle',
      icon: '😊',
      description: 'Emotionen und Gefühlszustände'
    },
    
    // Wortarten
    {
      id: 'verben1',
      title: 'Verben 1',
      icon: '🏃',
      description: 'Grundlegende Tätigkeitswörter'
    },
    {
      id: 'verben2',
      title: 'Verben 2',
      icon: '📝',
      description: 'Weitere Tätigkeitswörter'
    },
    {
      id: 'verben3',
      title: 'Verben 3',
      icon: '🔍',
      description: 'Fortgeschrittene Verben'
    },
    {
      id: 'adjektive1',
      title: 'Adjektive 1',
      icon: '🌈',
      description: 'Grundlegende Eigenschaftswörter'
    },
    {
      id: 'adjektive2',
      title: 'Adjektive 2',
      icon: '✨',
      description: 'Weitere Eigenschaftswörter'
    },
    {
      id: 'adjektive3',
      title: 'Adjektive 3',
      icon: '💫',
      description: 'Fortgeschrittene Eigenschaftswörter'
    }
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <span className={styles.icon}>🚀</span>
        Wähle eine Kategorie zum Lernen
      </h2>
      
      <div className={styles.grid}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={styles.categoryButton}
          >
            <div className={styles.buttonContent}>
              <span className={styles.categoryIcon}>{category.icon}</span>
              <div className={styles.textContent}>
                <h3 className={styles.categoryTitle}>{category.title}</h3>
                <p className={styles.categoryDescription}>{category.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VocabCategorySelection;
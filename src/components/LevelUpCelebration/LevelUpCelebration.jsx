// src/components/LevelUpCelebration/LevelUpCelebration.jsx

import React, { useState, useEffect } from 'react';
import './LevelUpCelebration.css';

const UNLOCKABLE_ITEMS = {
    1: { name: "Trainings-Basis", icon: "👨", features: ["Erste Sprachhilfe"] },
    2: { name: "Astronauten-Headset", icon: "👨‍🚀", features: ["Verbesserte Aussprache"] },
    3: { name: "Vokabel-Rucksack", icon: "🎒", features: ["Mobiles Lernen"] },
    4: { name: "Erdsprachen-Modul", icon: "🌍", features: ["Grundsprachen verstehen"] },
    5: { name: "Raketen-Booster", icon: "🚀", features: ["2x schnelleres Lernen"] },
    6: { name: "Sternenstaub-Speicher", icon: "✨", features: ["Dauerhaftes Merken"] },
    7: { name: "Translations-Gleiter", icon: "🛸", features: ["Schwebende Übersetzung"] },
    8: { name: "Galaxis-Basis", icon: "🏠", features: ["Kosmisches Lernen"] },
    9: { name: "Wissens-Festung", icon: "🏰", features: ["Unzerstörbares Wissen"] },
    10: { name: "Sternen-Kompass", icon: "🌠", features: ["Navigationshilfe der Sprache"] },
    11: { name: "Turbo-Antrieb", icon: "🚀", features: ["3x Lerngeschwindigkeit"] },
    12: { name: "Blitz-Verstärker", icon: "⚡", features: ["Gedankenblitz-Aktivierung"] },
    13: { name: "Metropolen-Link", icon: "🌆", features: ["Urbanes Sprachgefühl"] },
    14: { name: "Nova-Kristall", icon: "💫", features: ["Explosives Lernen"] },
    15: { name: "Energie-Konverter", icon: "⚡", features: ["Kraft-zu-Wissen Wandler"] },
    16: { name: "Missions-Zentrale", icon: "🚀", features: ["Geführtes Lernen"] },
    17: { name: "Regenbogen-Bridge", icon: "🌈", features: ["Sprach-Brücken bauen"] },
    18: { name: "Sternen-Fokus", icon: "⭐", features: ["Konzentriertes Lernen"] },
    19: { name: "Ehren-Medaille", icon: "🎖️", features: ["Motivations-Boost"] },
    20: { name: "Königs-Modul", icon: "👑", features: ["Herrschaftliches Sprechen"] },
    21: { name: "Explorer-Rakete", icon: "🚀", features: ["Neue Sprach-Horizonte"] },
    22: { name: "Kristall-Verstärker", icon: "💎", features: ["Klare Aussprache"] },
    23: { name: "Stadt-Simulator", icon: "🏙️", features: ["Urbane Dialekte"] },
    24: { name: "Power-Generator", icon: "⚡", features: ["Energie-zu-Wörter"] },
    25: { name: "Sprint-Rakete", icon: "🚀", features: ["Schnell-Lern-Modus"] },
    26: { name: "Herrscher-Ring", icon: "👑", features: ["Autoritative Sprache"] },
    27: { name: "Verdienst-Orden", icon: "🎖️", features: ["Erfolgs-Verstärkung"] },
    28: { name: "Leucht-Stern", icon: "⭐", features: ["Erleuchtetes Lernen"] },
    29: { name: "Kometen-Schweif", icon: "🌠", features: ["Nachhaltiger Eindruck"] },
    30: { name: "Macht-Krone", icon: "👑", features: ["Absolute Autorität"] },
    31: { name: "Stern-Nebel", icon: "💫", features: ["Mystische Weisheit"] },
    32: { name: "Stadt-Energie", icon: "⚡", features: ["Urbane Power"] },
    33: { name: "Licht-Stern", icon: "🌟", features: ["Erleuchtung"] },
    34: { name: "Spektral-Brücke", icon: "🌈", features: ["Farben der Sprache"] },
    35: { name: "Hell-Stern", icon: "⭐", features: ["Strahlende Präsenz"] },
    36: { name: "Sternen-Route", icon: "🌠", features: ["Weg der Sterne"] },
    37: { name: "Nebel-Wanderer", icon: "🌌", features: ["Intuitive Navigation"] },
    38: { name: "Funkel-Modul", icon: "✨", features: ["Glänzende Leistung"] },
    39: { name: "Meteor-Kraft", icon: "☄️", features: ["Einschlagende Wirkung"] },
    40: { name: "Kaiser-Krone", icon: "👑", features: ["Imperiale Macht"] },
    41: { name: "Theater-Maske", icon: "🎭", features: ["Ausdrucks-Kunst"] },
    42: { name: "Kunst-Palette", icon: "🎨", features: ["Kreative Sprache"] },
    43: { name: "Weisheits-Buch", icon: "📚", features: ["Tiefes Wissen"] },
    44: { name: "Zirkus-Zelt", icon: "🎪", features: ["Vielfältige Ausdrücke"] },
    45: { name: "Glitzer-Staub", icon: "✨", features: ["Magische Worte"] },
    46: { name: "Blitz-Genius", icon: "⚡", features: ["Geniale Einfälle"] },
    47: { name: "Polar-Stern", icon: "🌟", features: ["Orientierung"] },
    48: { name: "Farb-Spektrum", icon: "🌈", features: ["Nuancen-Verständnis"] },
    49: { name: "Leucht-Feuer", icon: "⭐", features: ["Wegweisend"] },
    50: { name: "Kunst-Krone", icon: "👑", features: ["Kreative Herrschaft"] },
    51: { name: "Diplomaten-Hand", icon: "🤝", features: ["Verhandlungs-Geschick"] },
    52: { name: "Glanz-Effekt", icon: "✨", features: ["Strahlende Präsenz"] },
    53: { name: "Komet-Schweif", icon: "☄️", features: ["Bleibender Eindruck"] },
    54: { name: "Schrift-Rolle", icon: "📜", features: ["Alte Weisheit"] },
    55: { name: "Führungs-Stern", icon: "⭐", features: ["Wegweisend"] },
    56: { name: "Hell-Leuchte", icon: "🌟", features: ["Klare Sicht"] },
    57: { name: "Welt-Kenner", icon: "🌍", features: ["Globales Wissen"] },
    58: { name: "Sonnen-Kraft", icon: "☀️", features: ["Strahlende Energie"] },
    59: { name: "Nebel-Licht", icon: "💫", features: ["Durchdringende Erkenntnis"] },
    60: { name: "Macht-Symbol", icon: "👑", features: ["Absolute Kontrolle"] },
    61: { name: "Kristall-Kugel", icon: "🔮", features: ["Zukunfts-Vision"] },
    62: { name: "Licht-Brücke", icon: "🌈", features: ["Verbindungen knüpfen"] },
    63: { name: "Leucht-Stern", icon: "⭐", features: ["Führungs-Qualität"] },
    64: { name: "Funkel-Staub", icon: "✨", features: ["Magische Aura"] },
    65: { name: "Milchstraßen-Tor", icon: "🌌", features: ["Grenzenlos"] },
    66: { name: "Meteor-Schwarm", icon: "☄️", features: ["Überwältigend"] },
    67: { name: "Energie-Explosion", icon: "💥", features: ["Durchschlagend"] },
    68: { name: "Kronen-Juwel", icon: "👑", features: ["Königliche Würde"] },
    69: { name: "Stern-Licht", icon: "🌟", features: ["Erleuchtend"] },
    70: { name: "Macht-Krone", icon: "👑", features: ["Höchste Autorität"] },
    71: { name: "Zeit-Uhr", icon: "⌛", features: ["Zeit-Kontrolle"] },
    72: { name: "Energie-Blitz", icon: "⚡", features: ["Power-Boost"] },
    73: { name: "Glitzer-Nebel", icon: "✨", features: ["Mystische Kraft"] },
    74: { name: "Leucht-Signal", icon: "🌟", features: ["Wegweisend"] },
    75: { name: "Welt-Karte", icon: "🗺️", features: ["Globale Navigation"] },
    76: { name: "Wissens-Buch", icon: "📚", features: ["Unendliches Wissen"] },
    77: { name: "Schrift-Rolle", icon: "📜", features: ["Alte Weisheit"] },
    78: { name: "Notiz-Block", icon: "📋", features: ["Perfekte Erinnerung"] },
    79: { name: "Lilien-Siegel", icon: "⚜️", features: ["Edles Sprechen"] },
    80: { name: "Zeit-Krone", icon: "👑", features: ["Zeit-Herrschaft"] },
    81: { name: "Galaxie-Blitz", icon: "⚡", features: ["Kosmische Kraft"] },
    82: { name: "Stern-Staub", icon: "✨", features: ["Magische Essenz"] },
    83: { name: "Polar-Stern", icon: "🌟", features: ["Ewiges Licht"] },
    84: { name: "Sand-Uhr", icon: "⌛", features: ["Zeit-Manipulation"] },
    85: { name: "Unendlich-Loop", icon: "∞", features: ["Endlose Macht"] },
    86: { name: "Weisheits-Folio", icon: "📚", features: ["Absolutes Wissen"] },
    87: { name: "Welt-Auge", icon: "🌍", features: ["Globaler Blick"] },
    88: { name: "Zauber-Kugel", icon: "🔮", features: ["Magische Macht"] },
    89: { name: "Macht-Symbol", icon: "👑", features: ["Höchste Gewalt"] },
    90: { name: "Universal-Krone", icon: "👑", features: ["Absolute Herrschaft"] },
    91: { name: "Kaiser-Lilie", icon: "⚜️", features: ["Imperiale Macht"] },
    92: { name: "Kosmos-Staub", icon: "✨", features: ["Universelle Essenz"] },
    93: { name: "Energie-Blitz", icon: "⚡", features: ["Göttliche Kraft"] },
    94: { name: "Ewiger-Stern", icon: "🌟", features: ["Unsterbliche Macht"] },
    95: { name: "Schicksals-Kugel", icon: "🔮", features: ["Destiny Control"] },
    96: { name: "Unendlich-Symbol", icon: "∞", features: ["Grenzenlose Macht"] },
    97: { name: "Licht-Stern", icon: "⭐", features: ["Ewiges Leuchten"] },
    98: { name: "Galaxie-Portal", icon: "🌌", features: ["Universums-Zugang"] },
    99: { name: "Herrscher-Krone", icon: "👑", features: ["Supreme Control"] },
    100: { name: "Universal-Meister", icon: "👑⚜️", features: ["Absolute Perfektion"] }
  };

const LevelUpCelebration = ({ level, isOpen, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      triggerConfetti();
    }
  }, [isOpen]);

  const triggerConfetti = () => {
    const colors = ['#FFD700', '#4169E1', '#FF69B4', '#98FB98'];
    
    for (let i = 0; i < 100; i++) {
      createConfettiParticle(colors[Math.floor(Math.random() * colors.length)]);
    }
  };

  const createConfettiParticle = (color) => {
    const particle = document.createElement('div');
    particle.className = 'confetti';
    particle.style.backgroundColor = color;
    particle.style.left = Math.random() * 100 + 'vw';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      document.body.removeChild(particle);
    }, 2500);
  };

  if (!isOpen) return null;

  const unlockedItem = UNLOCKABLE_ITEMS[level] || {
    name: "Geheimnisvoll",
    icon: "✨",
    description: "Ein mysteriöses Objekt wartet darauf, entdeckt zu werden.",
    features: ["???"]
  };

  return (
    <div className="level-up-overlay">
      <div className="level-up-modal">
        <div className="level-up-header">
          <span className="level-icon bounce">{unlockedItem.icon}</span>
          <h2>Level {level} erreicht!</h2>
          <span className="level-icon bounce">{unlockedItem.icon}</span>
        </div>

        <div className="unlock-section">
          <h3>Neuer Gegenstand freigeschaltet:</h3>
          <p className="item-name">{unlockedItem.name}</p>
          <p className="item-description">{unlockedItem.description}</p>
        </div>

        <div className="features-section">
          <h4>Besondere Eigenschaften:</h4>
          <ul>
            {unlockedItem.features.map((feature, index) => (
              <li key={index}>
                <span className="feature-star">★</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <button className="continue-button" onClick={onClose}>
          Weiter erkunden
        </button>
      </div>
    </div>
  );
};

export default LevelUpCelebration;


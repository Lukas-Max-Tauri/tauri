import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Überprüfe, ob wir in einer Tauri-Umgebung sind
// Dynamische Server-URL mit Tauri-Erkennung
const isTauri = window.navigator.userAgent.includes('Tauri') || 
               window.location.protocol === 'tauri:' || 
               window.location.protocol === 'app:';

// Verwende immer die Cloud-URL in Tauri
const SERVER_URL = isTauri 
  ? 'https://us-central1-daz-connect.cloudfunctions.net/backend'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5002');

console.log('Using SERVER_URL:', SERVER_URL, 'isTauri:', isTauri);

// Sprachzuordnung mit Fallback-Optionen
const LANGUAGE_CODES = {
  // Hauptsprachen
  '🇩🇪': 'de-DE', // Deutsch
  '🇹🇷': 'tr-TR', // Türkisch
  '🇸🇦': 'ar-XA', // Arabisch
  '🇺🇦': 'uk-UA', // Ukrainisch
  '🇬🇧': 'en-GB', // Englisch
  '🇪🇸': 'es-ES', // Spanisch
  '🇷🇺': 'ru-RU', // Russisch
  '🇵🇱': 'pl-PL', // Polnisch
  '🇷🇴': 'ro-RO', // Rumänisch
  '🇮🇹': 'it-IT', // Italienisch
  
  // Sprachen mit Fallback
  '🇹🇯': 'tr-TR', // Kurdisch -> Türkisch
  '🇮🇷': 'ar-XA', // Farsi -> Arabisch
  '🇦🇱': 'it-IT', // Albanisch -> Italienisch
  '🇷🇸': 'ru-RU', // Serbisch -> Russisch
  '🇦🇫': 'ar-XA', // Paschtu -> Arabisch
  '🇸🇴': 'ar-XA', // Somali -> Arabisch
  '🇪🇷': 'ar-XA'  // Tigrinya -> Arabisch
};

// Übersetze die Google TTS-Sprachen zu Web Speech API kompatiblen Sprachen für den Fallback
const webSpeechLangMap = {
  'de-DE': 'de-DE',
  'tr-TR': 'tr-TR',
  'ar-XA': 'ar-SA', // Fallback für Arabisch
  'uk-UA': 'uk-UA',
  'en-GB': 'en-GB',
  'es-ES': 'es-ES',
  'ru-RU': 'ru-RU',
  'pl-PL': 'pl-PL',
  'ro-RO': 'ro-RO',
  'it-IT': 'it-IT'
};

const AudioButton = ({ text, language }) => {
  const audioRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Überprüfe beim Start, ob Web Speech API verfügbar ist
  useEffect(() => {
    const isSpeechSynthesisAvailable = 'speechSynthesis' in window;
    console.log('Web Speech API available:', isSpeechSynthesisAvailable);
  }, []);

  // Stoppe Audio beim Unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Verwende Web Speech API als Fallback
  const playWithBrowserTTS = async (text, languageCode) => {
    if (!('speechSynthesis' in window)) {
      console.error('Browser TTS not supported');
      return false;
    }

    try {
      // Wenn bereits sprechend, stoppe es
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Konvertiere Google TTS-Sprache zu Web Speech API Format
      const webSpeechLang = webSpeechLangMap[languageCode] || languageCode;
      utterance.lang = webSpeechLang;
      
      // Wähle eine passende Stimme, wenn möglich
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => 
        voice.lang.startsWith(webSpeechLang.split('-')[0]) &&
        !voice.localService
      );
      
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      
      // Events
      return new Promise((resolve, reject) => {
        utterance.onend = () => {
          setIsPlaying(false);
          setIsLoading(false);
          resolve(true);
        };
        
        utterance.onerror = (event) => {
          console.error('Browser TTS error:', event);
          setIsPlaying(false);
          setIsLoading(false);
          setHasError(true);
          reject(event);
        };
        
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      });
    } catch (error) {
      console.error('Browser TTS error:', error);
      return false;
    }
  };

  const generateAndPlayAudio = async () => {
    // Wenn bereits spielend, pausieren
    if (isPlaying) {
      if (useFallback && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    
    const languageCode = LANGUAGE_CODES[language] || 'de-DE';
    let success = false;

    // Versuche zuerst Google TTS über den Server
    if (!useFallback) {
      try {
        console.log('Trying Google TTS...');
        const response = await fetch(`${SERVER_URL}/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language: languageCode }),
          // Für Tauri setzen wir ein Timeout, um schneller zum Fallback zu kommen
          ...(isTauri ? { signal: AbortSignal.timeout(10000) } : {})
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('TTS Error:', errorData);
          throw new Error(errorData.error || 'TTS request failed');
        }

        const data = await response.json();
        
        if (audioRef.current) {
          // Verwende die Base64-kodierte Audio-URL
          audioRef.current.src = data.audioUrl;
          await audioRef.current.load();
          await audioRef.current.play();
          setIsPlaying(true);
          success = true;
        }
      } catch (error) {
        console.error('Google TTS Error:', error);
        success = false;
      }
    }

    // Wenn Google TTS fehlschlägt oder der Fallback aktiviert ist, versuche Browser TTS
    if (!success) {
      try {
        console.log('Trying browser TTS fallback...');
        success = await playWithBrowserTTS(text, languageCode);
        
        if (success) {
          setHasError(false);
          // Merken, dass Fallback funktioniert hat für zukünftige Aufrufe
          setUseFallback(true);
        } else {
          setHasError(true);
        }
      } catch (fallbackError) {
        console.error('Browser TTS fallback failed:', fallbackError);
        setHasError(true);
        success = false;
      }
    }

    if (!success) {
      setHasError(true);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="audio-button-container">
      <audio 
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Audio error:', e);
          setHasError(true);
          setIsPlaying(false);
        }}
      />
      <button
        onClick={generateAndPlayAudio}
        disabled={isLoading}
        className={`audio-button ${hasError ? 'error' : ''} ${isPlaying ? 'playing' : ''}`}
        title={
          isLoading 
            ? 'Generiere Audio...' 
            : hasError 
            ? 'Fehler bei der Audiogenerierung' 
            : isPlaying
            ? 'Audio stoppen'
            : 'Aussprache anhören'
        }
      >
        {hasError ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
};

export default AudioButton;
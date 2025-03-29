// Aktualisierte index.js für Firebase Functions mit v2-API
import { onRequest } from 'firebase-functions/v2/https';
import * as functions from 'firebase-functions';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lade Umgebungsvariablen
dotenv.config({ path: path.join(__dirname, '.env') });

// Definiere Connection Mode
const connectionMode = process.env.CONNECTION_MODE || 'firebase'; // 'firebase' or 'local'

// Debug-Ausgaben für wichtige Umgebungsvariablen
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CONNECTION_MODE:', connectionMode);

const app = express();

// CORS-Konfiguration mit erweiterten Origins
// CORS-Konfiguration mit erweiterten Origins
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
  'http://localhost:5173',
  'http://localhost:1420',
  'tauri://localhost',
  'app://localhost',
  'null',
  'https://daz-connect.web.app',
  'https://daz-connect.firebaseapp.com',
  'https://us-central1-daz-connect.cloudfunctions.net',
  'https://backend-6bu6t6ce2a-uc.a.run.app'
];

// Erstellen einer konfigurierten CORS-Middleware
const corsMiddleware = cors({
  origin: function(origin, callback) {
    console.log('Request origin:', origin); // Debug-Ausgabe
    
    // Wenn keine Origin oder eine erlaubte Origin, erlauben
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Unerlaubte Origin: ${origin}`);
      
      // Im Entwicklungsmodus trotzdem erlauben
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
        console.log('Development mode: Allowing request from unauthorized origin');
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  maxAge: 86400 // 24 Stunden
});

// CORS-Middleware auf alle Routen anwenden
app.use(corsMiddleware);

// Spezieller Handler für Preflight-Anfragen
app.options('*', corsMiddleware);

// Middleware
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// MongoDB-Verbindung mit Fehlerbehandlung und Connection Mode
const connectDB = async () => {
  try {
    if (connectionMode === 'local') {
      // Lokale MongoDB-Verbindung
      console.log('Attempting to connect to local MongoDB...');
      const localMongoURI = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/deutschLernApp';
      await mongoose.connect(localMongoURI);
      console.log('Successfully connected to local MongoDB');
    } else {
      // Firebase/Cloud MongoDB-Verbindung
      const mongoURI = process.env.MONGODB_URI;
      if (!mongoURI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }
      console.log('Attempting to connect to cloud MongoDB...');
      await mongoose.connect(mongoURI);
      console.log('Successfully connected to cloud MongoDB');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // In Firebase Functions sollten wir den Prozess nicht beenden, sondern nur loggen
    console.error('Connection to MongoDB failed, but continuing...');
  }
};

// Verbindung herstellen
connectDB();

// Google Cloud Text-to-Speech Client initialisieren
let client;
try {
  // Versuche zuerst, die Anmeldeinformationen aus der Umgebungsvariable zu laden
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    client = new TextToSpeechClient({ credentials });
    console.log('Text-to-Speech-Client mit JSON-Umgebungsvariable initialisiert');
  } 
  // Alternativ aus Firebase Functions Config laden
  else if (functions.config().google?.credentials) {
    const credentials = JSON.parse(functions.config().google.credentials);
    client = new TextToSpeechClient({ credentials });
    console.log('Text-to-Speech-Client mit Functions-Config initialisiert');
  }
  // Fallback: Standard-Credentials verwenden
  else {
    client = new TextToSpeechClient();
    console.log('Text-to-Speech-Client mit Standard-Credentials initialisiert');
  }
} catch (error) {
  console.error('Fehler bei der Initialisierung des Text-to-Speech-Clients:', error);
}

// Erweiterte Sprachzuordnung
const voiceMapping = {
  // Hauptsprachen
  'de-DE': { name: 'de-DE-Standard-A', ssml: 'de-DE' },
  'tr-TR': { name: 'tr-TR-Standard-A', ssml: 'tr-TR' },
  'ar-XA': { name: 'ar-XA-Standard-A', ssml: 'ar-XA' },
  'uk-UA': { name: 'uk-UA-Standard-A', ssml: 'uk-UA' },
  'en-GB': { name: 'en-GB-Standard-A', ssml: 'en-GB' },
  'es-ES': { name: 'es-ES-Standard-A', ssml: 'es-ES' },
  'ru-RU': { name: 'ru-RU-Standard-A', ssml: 'ru-RU' },
  'pl-PL': { name: 'pl-PL-Standard-A', ssml: 'pl-PL' },
  'ro-RO': { name: 'ro-RO-Standard-A', ssml: 'ro-RO' },
  'it-IT': { name: 'it-IT-Standard-A', ssml: 'it-IT' },

  // Spezielle Sprachzuordnungen
  'fa-IR': { name: 'ar-XA-Standard-A', ssml: 'ar-XA' },
  'sq-AL': { name: 'it-IT-Standard-A', ssml: 'it-IT' },
  'sr-RS': { name: 'ru-RU-Standard-A', ssml: 'ru-RU' },
  'ps-AF': { name: 'ar-XA-Standard-A', ssml: 'ar-XA' },
  'so-SO': { name: 'ar-XA-Standard-A', ssml: 'ar-XA' },
  'ti-ER': { name: 'ar-XA-Standard-A', ssml: 'ar-XA' },
  'ku-TR': { name: 'tr-TR-Standard-A', ssml: 'tr-TR' }
};

async function generateAudio(text, language) {
  // Im lokalen Modus einen Mock-Audio-Response zurückgeben wenn kein Client verfügbar
  if (!client) {
    if (connectionMode === 'local') {
      console.log('Using mock TTS response in local mode');
      // Ein leeres Base64-Audio zurückgeben (1 Sekunde Stille)
      return Buffer.from('SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV////////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCkAAAAAAAAAEgAGrGvgAAAAAAAAAAAAAAAAAAAP/7UMQAAAesTXWUEQAB3R2nvLMSBGJcEXkhCEIQhCCMQ5DkZx8fH+Zl/GOMcYxjHHHH/5jGMYxjGMYxjGMYxjGMYxjH//McYxjGMYxjGMYxjGMYxjGMAABh+He4uLi4uA0NDQ0NDAwMDAwMDAwMDAwMDQ0NDQ0NDQwMDAwMDAwMDAvBUCyQRl4RByEIQhCuS4hyCE8xchznIQj4iIiIiIiJESImRIiIiIiIiIiIiIiIiIiJESIkRERERETGERERERE=', 'base64');
    } else {
      throw new Error('Text-to-Speech client is not initialized');
    }
  }

  console.log('Generating audio for:', text, 'in language:', language);

  const voiceConfig = voiceMapping[language] || voiceMapping['de-DE'];

  const ssmlText = `
<speak>
<lang xml:lang="${voiceConfig.ssml}">
${text}
</lang>
</speak>`;

  const request = {
    input: { ssml: ssmlText },
    voice: { 
      languageCode: language,
      name: voiceConfig.name
    },
    audioConfig: { 
      audioEncoding: 'MP3',
      effectsProfileId: ['small-bluetooth-speaker-class-device']
    }
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent;
  } catch (error) {
    console.error('Error in generateAudio:', error);
    throw error;
  }
}

// API Routes mit Connection Mode Berücksichtigung
app.use('/api/auth', authRoutes);

// Text-to-Speech Route mit verbesserter Fehlerbehandlung und Connection Mode
app.post('/tts', async (req, res) => {
  const { text, language } = req.body;
  if (!text || !language) {
    return res.status(400).json({
      error: 'Text und Sprache erforderlich!',
      received: { text, language }
    });
  }

  try {
    // Im lokalen Modus ohne Google-Dienste können wir eine Mock-Response verwenden
    if (connectionMode === 'local' && !client) {
      console.log('Using mock TTS in local mode');
      // Ein leeres Audio als Base64 zurückgeben (1 Sekunde Stille)
      const mockAudioBase64 = 'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV////////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCkAAAAAAAAAEgAGrGvgAAAAAAAAAAAAAAAAAAAP/7UMQAAAesTXWUEQAB3R2nvLMSBGJcEXkhCEIQhCCMQ5DkZx8fH+Zl/GOMcYxjHHHH/5jGMYxjGMYxjGMYxjGMYxjH//McYxjGMYxjGMYxjGMYxjGMAABh+He4uLi4uA0NDQ0NDAwMDAwMDAwMDAwMDQ0NDQ0NDQwMDAwMDAwMDAvBUCyQRl4RByEIQhCuS4hyCE8xchznIQj4iIiIiIiJESImRIiIiIiIiIiIiIiIiIiJESIkRERERETGERERERE=';
      return res.json({
        audioUrl: `data:audio/mp3;base64,${mockAudioBase64}`,
        mode: 'local-mock'
      });
    }

    const audioContent = await generateAudio(text, language);
    const audioBase64 = audioContent.toString('base64');
    res.json({
      audioUrl: `data:audio/mp3;base64,${audioBase64}`,
      mode: connectionMode
    });
  } catch (error) {
    console.error('Text-to-Speech error:', error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
      mode: connectionMode
    });
  }
});

// Healthcheck-Endpunkt für Cloud Run
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Globaler Error Handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({ 
    error: 'Server error', 
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    mode: connectionMode
  });
});

// Firebase Function exportieren (v2 API)
export const backend = onRequest({
  memory: '256MiB',
  region: 'us-central1',
  timeoutSeconds: 60,
}, app);

// Auch v1 API für Kompatibilität exportieren
export const backendV1 = functions.https.onRequest(app);
import express from 'express';
import fs from 'fs';
import path from 'path';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lade Umgebungsvariablen
dotenv.config({ path: path.join(__dirname, '.env') });

// Definiere Connection Mode
const connectionMode = process.env.CONNECTION_MODE || 'firebase'; // 'firebase' or 'local'

// Debug-Ausgaben für wichtige Umgebungsvariablen
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);
console.log('CONNECTION_MODE:', connectionMode);

const app = express();
const port = process.env.PORT || 5001;

// CORS-Konfiguration mit erweiterten Origins
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
  // Bestehende URLs beibehalten
  'https://deutsch-lern-app-2025-9e0e77af714c.herokuapp.com',
  'https://deutsch-lern-app-2025-45a61e63e76d.herokuapp.com',
  'https://deutsch-lern-app-2025.herokuapp.com',
  'http://localhost:5173',
  'http://localhost:1420',
  'tauri://localhost',
  'tauri-apps://localhost',
  'https://us-central1-daz-connect.cloudfunctions.net',
  'tauri://127.0.0.1',
  'http://localhost',
  'http://127.0.0.1',
  // Firebase URLs hinzufügen
  'https://daz-connect.web.app',
  'https://daz-connect.firebaseapp.com',
  'app://localhost', 
  'tauri://localhost',
  'tauri-apps://localhost',
  'tauri://127.0.0.1',
  // Diese zusätzlich hinzufügen
  'app://dazconnect.app',
  'tauri://dazconnect.app',
  // Auch für deinen spezifischen Identifier
  'app://de.dazconnect.app',
  'tauri://de.dazconnect.app',
  
  // Leerer Origin für Tauri-Apps im Produktionsmodus
  'null'
];

// Cookie-Konfiguration basierend auf der Umgebung
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' && connectionMode === 'firebase',
  sameSite: process.env.NODE_ENV === 'production' && connectionMode === 'firebase' ? 'none' : 'lax',
  domain: process.env.NODE_ENV === 'production' && connectionMode === 'firebase'
    ? process.env.PRODUCTION_COOKIE_DOMAIN 
    : process.env.COOKIE_DOMAIN,
  maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000 // Tage in Millisekunden
};

// Verbesserte CORS-Konfiguration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  console.log('Request origin:', origin); // Debug-Ausgabe
  console.log('Allowed origins:', allowedOrigins); // Debug-Ausgabe für erlaubte Origins

  // Prüfen, ob die Origin erlaubt ist oder wenn kein Origin-Header vorhanden ist
  // (könnte bei direkten Tauri-Aufrufen der Fall sein)
  if (origin === undefined || origin === 'null' || allowedOrigins.includes(origin)) {
    // Wenn keine Origin oder eine erlaubte Origin, setze den Header entsprechend
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // Für Anfragen ohne Origin-Header (z.B. von nativen Tauri-Apps)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    // Standard CORS-Header setzen
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 Stunden
  } else {
    // Wenn nicht erlaubt, zur Fehlersuche loggen
    console.warn(`Unerlaubte Origin: ${origin}`);
    
    // Im Development-Modus trotzdem erlauben für einfachere Entwicklung
    if (process.env.NODE_ENV !== 'production') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      console.log('Development mode: Allowing request from unauthorized origin');
    }
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

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
    process.exit(1); // Beende den Prozess bei Verbindungsfehler
  }
};

connectDB();

// Google Cloud Konfiguration basierend auf Connection Mode
let credentials;
let client;

if (connectionMode === 'firebase') {
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      // Versuche zuerst die Umgebungsvariable zu nutzen
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    } else if (process.env.NODE_ENV !== 'production') {
      // Fallback auf lokale Datei im Development-Modus
      try {
        credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'google-credentials.json'), 'utf8'));
      } catch (error) {
        console.warn('Neither environment variable nor local credentials file found');
        credentials = null;
      }
    } else {
      throw new Error('Google credentials not found');
    }
  } catch (error) {
    console.warn('Warning: Google Cloud credentials not loaded:', error.message);
    credentials = null;
  }

  // Erstelle den TextToSpeechClient nur wenn Credentials verfügbar sind
  if (credentials) {
    client = new TextToSpeechClient({
      credentials,
      projectId: credentials.project_id
    });
  }
} else {
  console.log('Local mode: Text-to-Speech service will use mock responses');
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

// Statische Dateien basierend auf Umgebung und Connection Mode
if (process.env.NODE_ENV === 'production' || connectionMode === 'firebase') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else if (connectionMode === 'local') {
  // In local mode, different static file handling or only API
  console.log('Local mode: Serving API only. Frontend should be run separately.');
  
  // API-Status-Endpunkt für lokalen Modus
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'running',
      mode: connectionMode,
      environment: process.env.NODE_ENV,
      mongoDbConnected: mongoose.connection.readyState === 1,
      ttsAvailable: !!client
    });
  });
}

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

// Server starten und Status ausgeben
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Connection Mode:', connectionMode);
  console.log('MongoDB connection status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
  
  if (connectionMode === 'local') {
    console.log('Local mode: API available at http://localhost:' + port);
    console.log('Local mode: Some cloud services are mocked or disabled');
  } else {
    console.log('Firebase mode: Connected to cloud services');
  }
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
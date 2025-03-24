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
// Google Cloud Konfiguration basierend auf Connection Mode
let credentials;
let client;

if (connectionMode === 'firebase') {
  console.log('Versuche Firebase Admin zu initialisieren...');
  
  try {
    // 1. Versuche zuerst die Umgebungsvariable zu nutzen
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      console.log('GOOGLE_APPLICATION_CREDENTIALS_JSON vorhanden: true');
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      console.log('Credentials aus Umgebungsvariable geladen');
    } 
    // 2. Versuche die GOOGLE_APPLICATION_CREDENTIALS Umgebungsvariable für Dateipfad
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('GOOGLE_APPLICATION_CREDENTIALS vorhanden: true');
      credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
      console.log('Credentials aus GOOGLE_APPLICATION_CREDENTIALS Pfad geladen');
    }
    // 3. Versuche verschiedene mögliche Pfade für die Credentials-Datei
    else {
      console.log('GOOGLE_APPLICATION_CREDENTIALS_JSON vorhanden: false');
      
      // Mögliche Pfade für die Credentials-Datei
      const possiblePaths = [
        // Lokale Entwicklung
        path.join(__dirname, 'google-credentials.json'),
        // Im selben Verzeichnis wie die Server-Datei
        path.join(process.cwd(), 'google-credentials.json'),
        // Ein Verzeichnis höher
        path.join(process.cwd(), '..', 'google-credentials.json'),
        // Im assets-Verzeichnis (für Tauri)
        path.join(process.cwd(), 'assets', 'google-credentials.json'),
        // Ein Verzeichnis höher im assets-Verzeichnis (für Tauri)
        path.join(process.cwd(), '..', 'assets', 'google-credentials.json'),
        // Für Tauri produzierte App im resources/assets-Verzeichnis
        path.join(process.env.TAURI_RESOURCES || '', 'assets', 'google-credentials.json'),
        process.resourcesPath ? path.join(process.resourcesPath, 'assets', 'google-credentials.json') : null,
        // src-tauri/assets
        path.join(process.cwd(), 'src-tauri', 'assets', 'google-credentials.json')
      ].filter(Boolean); // Null-Werte entfernen
      
      let credentialsLoaded = false;
      
      for (const credPath of possiblePaths) {
        try {
          if (fs.existsSync(credPath)) {
            console.log('Gefundener Credentials-Pfad:', credPath);
            credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));
            process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath; // Setze den Pfad für andere Libs
            credentialsLoaded = true;
            console.log('Service Account geladen: true');
            break;
          }
        } catch (err) {
          console.log(`Konnte Credentials nicht aus ${credPath} laden:`, err.message);
        }
      }
      
      console.log('Service Account geladen:', credentialsLoaded);
      
      if (!credentialsLoaded) {
        // 4. Fallback: Direkte Einbettung der Credentials als letzten Ausweg
        // Dies sollte nur verwendet werden, wenn alle anderen Methoden fehlschlagen
        console.log('Fallback: Versuche eingebettete Credentials zu verwenden');
        try {
          credentials = {
            "type": "service_account",
            "project_id": "daz-app-449917",
            "private_key_id": "b83bd899d933c4b55cc944513a4b061bdcaa4638",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCyMT5z5kq5dJAL\ndZtkyaNt2PMVStF5AfyyjWN2yvf+thITAtp3FbKss1QFZVBQya4cDplQ6H9DFXcj\nWQlj8VxSNc+CP3jH8wdpIxpXh1uK2e8N1VmsMyxx9XD7LCF1r9YQ4cYxsoRkfcAh\nW2QX9Lsc1pNKyMWuQw7NLOzp/lnMBn4mlF88cwBxYOe9WstkK7l6H6AGMIrDyu7f\neb7SLJSJMShI+I3Q5R3K2JHhG67IdwiXWNP3GS9x/blsb054uXrajj4AdCIa2wHl\nOUjotzN9Lav4fLkM1sDWfJHjagx3SX/cPJxe75afd+W/B+ZfxHylp38b3xMmIHP7\njm8EdMOVAgMBAAECggEADLsYcWrdYVka1nrBTqbaUoWKvnVxOFJERdR0q/7Nz4ie\nC3YrehEWiiCoytblcVQraI1BdmaZ+wa8U43vrhCHLkdyayWSQUTTfXc40VKWH3o5\nClW5GaSxUvX8a7GINXKJ2nxq7s+Ihm52jNuM7+o3+RQ6g0ALYYsgcle4mHIn47vf\nfiYLV2UgPzdmzOPNBLqr2VBTbfPG6eI35p6MY/mJ46JCzK4kv94s6B1BZAkfZMZ3\nL07HkJVF0D80sTlv0HydOXUwW6Ei6bdT+VZG3e5VHp8mpXnPQXzH2Dd9DozQZGIV\n398wI79rc19fx9idYGZHgoa0bnxdznqgv0eyRvjzGQKBgQDaY7Ygh4wpyKIG0YXR\n+VKL+DzoVWwa/JS6eT2prr4oCVc3P1Wzdt6E3IseHLfXEM3kDHQ3ta+jmXd/HJEM\nsdRm9ok8Ajeb9Wjjoy/SxiGO9SUlUuBERuK7O/eyDXTAd8vIGZyvorm9Zvz9/xR7\nXiWn+Q9umygTSnwmsdpWbxthCQKBgQDQ4VVhoiLuiIHAYzjUJ68Wdn116lsPCVHa\nve97o2aq36kJ7nPLr0D9DS9QBXq20pT70ohFoZR/sXxSQ2U0kEPisX3Hws4zu4Ao\nvxdg7/Vqhi/Zg1GmD0+R6Y9s3eEgB2SNrUVXjyQ/Ajmkjm9hYgDQAplaBBhfXoXL\nd9oXew1NLQKBgQCaePUWRUprM7MHx6Q0RXqR7uCGJgX1gLtiuudW4nc2soSyW2Yv\nLuFucOEmR4Hx6bz4laaO0UCPI7pWespOhGqM+c1QWPEkq42pln/5QpPyHoxLvjdL\nlChD78Lgeowep53Ix/UAdsWSpwpETu0Z5hoUmiLERZMvMfxnEl4xzR08oQKBgQCU\nOKHmwy/4hgNUqtQDsBlNXk2O4/szw1BDYW5UFNJgxI9mDcA7tCPwrW96YDkBDJNN\n0sqCZrNCnYZztYFWeFzDu2Fe5DyAdzftMhR75CsJKSlBNy80ID89cjglb5k1qilP\nY7oF9PwqfgC7ZZthxjJ/aKi7OJa27hMRG/41lUsODQKBgAC2dHZf2xf0Wt4IAhGN\n+xi4sKW/Hp/zbmby+zlfyAZKc1xCKrFr/XCSFrySJb4oWtRWfXtZffft5wkzCxoA\nkPlxgIPlVOcF8ZuLl+zre3QVcboUCb1ZvJwZzkfbtWo2X5zDawXBvwf1L9Q9W3bj\nKe8QWZWVByvDiOzSqkIp3Lus\n-----END PRIVATE KEY-----\n",
            "client_email": "daz-app-schl-ssel@daz-app-449917.iam.gserviceaccount.com",
            "client_id": "108459019004721663412",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/daz-app-schl-ssel%40daz-app-449917.iam.gserviceaccount.com",
            "universe_domain": "googleapis.com"
          };
          console.log('Firebase Admin SDK erfolgreich initialisiert (Alternative Methode)');
        } catch (err) {
          console.log('Konnte auch eingebettete Credentials nicht verwenden:', err.message);
          credentials = null;
        }
      }
    }

    // Erstelle den TextToSpeechClient nur wenn Credentials verfügbar sind
    if (credentials) {
      client = new TextToSpeechClient({
        credentials,
        projectId: credentials.project_id
      });
    } else {
      throw new Error('Keine Credentials gefunden');
    }
  } catch (error) {
    console.error('Firebase Admin kann nicht initialisiert werden:', error.message);
    credentials = null;
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
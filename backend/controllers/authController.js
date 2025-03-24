// controllers/authController.js
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/user.js';
import admin from 'firebase-admin'; // Firebase Admin SDK hinzufügen

// JWT Token erstellen
const createToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Token in Cookie speichern
const sendTokenResponse = (user, statusCode, res) => {
  const token = createToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.herokuapp.com' : undefined
  };

  // Debug Logs
  console.log('Setting cookie with options:', cookieOptions);
  console.log('Token being set:', token);
  console.log('Current environment:', process.env.NODE_ENV);

  // Cookie setzen
  res.cookie('jwt', token, cookieOptions);

  // Passwort aus der Ausgabe entfernen
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Registrierung
export const register = async (req, res, next) => {
  try {
    console.log('Registration attempt:', req.body);
    const { username, email, password } = req.body;

    // Prüfen ob Benutzer bereits existiert
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({
        status: 'error',
        message: 'Ein Benutzer mit dieser E-Mail oder diesem Benutzernamen existiert bereits'
      });
    }

    // Standard-Sprachen setzen
    const defaultLanguages = ['ukrainian', 'arabic', 'turkish'];

    // Neuen Benutzer erstellen
    const user = await User.create({
      username,
      email,
      password,
      selectedLanguages: defaultLanguages,
      progress: {
        missions: {
          vokabeln: 0,
          satzbau: 0,
          verben: 0
        },
        totalScore: 0,
        level: 'Weltraum-Kadett',
        energy: 100
      }
    });

    console.log('User created successfully:', username);

    // Token senden
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    console.log('Login attempt:', req.body.email);
    const { email, password } = req.body;

    // Prüfen ob E-Mail und Passwort angegeben wurden
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Bitte geben Sie E-Mail und Passwort ein'
      });
    }

    // Benutzer finden und Passwort explizit auswählen
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      console.log('Invalid credentials for:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Ungültige E-Mail oder Passwort'
      });
    }

    // Letzten Login aktualisieren
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    console.log('Login successful:', email);

    // Token senden
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// Logout
export const logout = (req, res) => {
  console.log('Logout attempt');
  
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.herokuapp.com' : undefined
  };

  console.log('Clearing cookie with options:', cookieOptions);

  res.cookie('jwt', 'logged_out', cookieOptions);
  res.status(200).json({ status: 'success' });
};

// Auth Middleware
export const protect = async (req, res, next) => {
  try {
    let token;
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);

    // Token aus Header oder Cookie extrahieren
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token from Authorization header:', token);
    } else if (req.cookies.jwt && req.cookies.jwt !== 'logged_out') {
      token = req.cookies.jwt;
      console.log('Token from cookies:', token);
    }

    if (!token) {
      console.log('No token found');
      return res.status(401).json({
        status: 'error',
        message: 'Sie sind nicht eingeloggt. Bitte melden Sie sich an.'
      });
    }

    // Versuche zuerst den Firebase-Token zu verifizieren
    try {
      // Wenn der Token mit "ey" beginnt, könnte es ein Firebase JWT sein
      if (token.startsWith('ey')) {
        const decodedFirebase = await admin.auth().verifyIdToken(token);
        console.log('Decoded Firebase token:', decodedFirebase);

        // Prüfen ob der Benutzer in deiner Datenbank existiert
        let user = await User.findOne({ email: decodedFirebase.email });
        
        // Wenn nicht, erstelle einen neuen Benutzer
        if (!user) {
          console.log('Creating new user from Firebase auth:', decodedFirebase.email);
          const defaultLanguages = ['ukrainian', 'arabic', 'turkish'];
          
          user = await User.create({
            username: decodedFirebase.email.split('@')[0], // Einfache Benutzername-Generierung
            email: decodedFirebase.email,
            firebaseUid: decodedFirebase.uid,
            selectedLanguages: defaultLanguages,
            progress: {
              missions: {
                vokabeln: 0,
                satzbau: 0,
                verben: 0
              },
              totalScore: 0,
              level: 'Weltraum-Kadett',
              energy: 100
            }
          });
        }

        console.log('User authenticated via Firebase:', user.username);
        req.user = user;
        return next();
      }
    } catch (firebaseError) {
      console.log('Firebase token verification failed:', firebaseError.message);
      // Wir ignorieren diesen Fehler und versuchen die reguläre JWT-Verifizierung
    }

    // Standardmäßige JWT-Verifizierung
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      console.log('Decoded JWT token:', decoded);

      // Prüfen ob Benutzer noch existiert
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({
          status: 'error',
          message: 'Der Benutzer existiert nicht mehr'
        });
      }

      console.log('User authenticated via JWT:', user.username);
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Ungültiger Token. Bitte melden Sie sich erneut an.'
        });
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Ihr Token ist abgelaufen. Bitte melden Sie sich erneut an.'
        });
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.'
    });
  }
};

// Aktuellen Benutzer abrufen
export const getCurrentUser = async (req, res) => {
  console.log('Getting current user');
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

// Passwort aktualisieren
export const updatePassword = async (req, res, next) => {
  try {
    console.log('Password update attempt');
    const { currentPassword, newPassword } = req.body;

    // Benutzer mit Passwort holen
    const user = await User.findById(req.user.id).select('+password');

    // Aktuelles Passwort prüfen
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Ihr aktuelles Passwort ist nicht korrekt'
      });
    }

    // Neues Passwort setzen
    user.password = newPassword;
    await user.save();

    console.log('Password updated successfully');

    // Neuen Token senden
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Password update error:', error);
    next(error);
  }
};

// Neue Funktion für Firebase Auth Integration
export const handleFirebaseAuth = async (req, res, next) => {
  try {
    console.log('Firebase auth attempt:', req.body);
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Kein Firebase-Token vorhanden'
      });
    }

    // Firebase Token verifizieren
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Firebase token verified:', decodedToken);

    // Prüfen ob Benutzer in der Datenbank existiert
    let user = await User.findOne({ email: decodedToken.email });

    // Wenn nicht, neuen Benutzer erstellen
    if (!user) {
      console.log('Creating new user from Firebase auth:', decodedToken.email);
      const defaultLanguages = ['ukrainian', 'arabic', 'turkish'];
      
      user = await User.create({
        username: decodedToken.email.split('@')[0], // Einfache Benutzername-Generierung
        email: decodedToken.email,
        firebaseUid: decodedToken.uid,
        selectedLanguages: defaultLanguages,
        progress: {
          missions: {
            vokabeln: 0,
            satzbau: 0,
            verben: 0
          },
          totalScore: 0,
          level: 'Weltraum-Kadett',
          energy: 100
        }
      });
    }

    console.log('User authenticated via Firebase:', user.email);

    // MongoDB Token erstellen und senden
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Firebase-Authentifizierung fehlgeschlagen'
    });
  }
};
// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Benutzername ist erforderlich'],
    unique: true,
    trim: true,
    minlength: [3, 'Benutzername muss mindestens 3 Zeichen lang sein']
  },
  email: {
    type: String,
    required: [true, 'E-Mail ist erforderlich'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Bitte geben Sie eine gültige E-Mail-Adresse ein']
  },
  password: {
    type: String,
    // Ändern zu optional für Firebase-Nutzer
    required: function() {
      return !this.firebaseUid; // Nur erforderlich, wenn kein Firebase-Benutzer
    },
    minlength: [8, 'Passwort muss mindestens 8 Zeichen lang sein'],
    select: false // Passwort wird standardmäßig nicht mit abgerufen
  },
  // Neues Feld für Firebase UID
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true // Erlaubt null/undefined Werte und indexiert nur vorhandene Werte
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  progress: {
    level: {
      type: String,
      enum: ['Weltraum-Kadett', 'Sternen-Pilot', 'Galaxis-Kommandant'],
      default: 'Weltraum-Kadett'
    },
    totalScore: {
      type: Number,
      default: 0
    },
    missions: {
      vokabeln: {
        type: Number,
        default: 0
      },
      satzbau: {
        type: Number,
        default: 0
      },
      verben: {
        type: Number,
        default: 0
      }
    },
    energy: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  },
  selectedLanguages: [{
    type: String,
    enum: [
      'ukrainian', 'arabic', 'turkish', 'english', 'spanish',
      'russian', 'polish', 'romanian', 'ku', 'farsi',
      'albanian', 'serbian', 'italian', 'pashto', 'somali', 'tigrinya'
    ]
  }],
  difficultWords: {
    type: Map,
    of: {
      word: Object,
      wrongCount: Number,
      correctCount: Number,
      source: String
    }
  }
}, {
  timestamps: true
});

// Passwort vor dem Speichern hashen
userSchema.pre('save', async function(next) {
  // Überprüfen, ob Password geändert wurde und ob es überhaupt existiert
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Methode zum Vergleichen von Passwörtern
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Wenn kein Passwort gesetzt ist (Firebase-Benutzer), dann immer false zurückgeben
  if (!this.password) return false;
  
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Virtuelle Eigenschaft für den Gesamtfortschritt
userSchema.virtual('totalProgress').get(function() {
  const { vokabeln, satzbau, verben } = this.progress.missions;
  return ((vokabeln + satzbau + verben) / 30) * 100; // 30 = 10 pro Mission
});

const User = mongoose.model('User', userSchema);

export default User;
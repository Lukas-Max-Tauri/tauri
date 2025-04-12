// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithCustomToken // NEU: Für Custom Token Auth
} from 'firebase/auth';

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

// Firebase-Konfiguration importieren
import { db, auth } from '../firebaseConfig';
import { SERVER_URL, isTauri } from '../utils/api';
console.log('AuthContext using SERVER_URL:', SERVER_URL, 'isTauri:', isTauri);


const AuthContext = createContext({});



// Gemeinsame Fetch-Konfiguration - mit nativer Fetch API
const fetchWithCredentials = async (url, options = {}) => {
  try {
    console.log('Fetch request to:', url, 'with options:', JSON.stringify(options));
    
    // Token aus localStorage holen
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
        // Token im Authorization Header mitschicken, wenn vorhanden
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    // Wenn der Response ein JSON ist, parsen wir es
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg;
      try {
        if (isJson) {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.message || 'Ein Fehler ist aufgetreten';
        } else {
          errorMsg = errorText || 'Ein Fehler ist aufgetreten';
        }
      } catch {
        errorMsg = 'Ein Fehler ist aufgetreten';
      }
      throw new Error(errorMsg);
    }

    return isJson ? await response.json() : null;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Firebase Auth-Status überwachen
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        fetchFirebaseUserData(currentUser.uid);
      } else {
        checkAuthStatus(); // Fallback auf den bestehenden Auth-Mechanismus
      }
    });

    return () => unsubscribe();
  }, []);

  // Firebase-Benutzerdaten aus Firestore abrufen
  const fetchFirebaseUserData = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser({
          _id: userId,
          ...userData
        });
        setIsAuthenticated(true);
      } else {
        // Erstelle Standarddaten, wenn keine existieren
        await createFirebaseUserData(userId);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Firebase-Benutzerdaten:', error);
    } finally {
      setLoading(false);
    }
  };

// Standarddaten für neuen Firebase-Benutzer erstellen
const createFirebaseUserData = async (userId) => {
  try {
    const userEmail = firebaseUser?.email || "lukasbeutler@gmx.de"; // Direkt hier definieren
    
    const userData = {
      username: userEmail.split('@')[0],
      email: userEmail,
      selectedLanguages: ['ukrainian', 'arabic', 'turkish'],
      progress: {
        missions: {
          erstellt: 0,
          gelernt: 0,
          verben: 0
        },
        totalScore: 0,
        level: 'Weltraum-Kadett',
        energy: 100
      },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, userData);

    setUser({
      _id: userId,
      ...userData
    });
    setIsAuthenticated(true);
  } catch (error) {
    console.error('Fehler beim Erstellen von Firebase-Benutzerdaten:', error);
  }
};

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, user is not authenticated');
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await fetchWithCredentials(`${SERVER_URL}/api/auth/me`);
      console.log('Auth status response:', data);
      
      if (data?.data?.user) {
        setUser(data.data.user);
        setIsAuthenticated(true);
        
        // NEU: Versuche einen Firebase-Token zu bekommen, wenn wir bereits authentifiziert sind
        try {
          await getFirebaseTokenAndSignIn();
        } catch (fbError) {
          console.warn('Firebase auth after checking status failed:', fbError);
          // Weitermachen, auch wenn Firebase-Auth fehlschlägt
        }
      } else {
        // Wenn kein User in der Antwort ist, setzen wir alles zurück
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // NEU: Separate Funktion für Firebase Custom Token
  const getFirebaseTokenAndSignIn = async () => {
    try {
      console.log('Getting Firebase custom token...');
      const firebaseTokenData = await fetchWithCredentials(`${SERVER_URL}/api/auth/getFirebaseToken`);
      
      console.log('Received token data:', firebaseTokenData);
      
      if (firebaseTokenData?.status === 'success' && firebaseTokenData?.firebaseToken) {
        console.log('Signing in with Firebase custom token...');
        
        try {
          const userCredential = await signInWithCustomToken(auth, firebaseTokenData.firebaseToken);
          console.log('Firebase auth successful with custom token:', userCredential.user);
          return userCredential.user;
        } catch (signInError) {
          console.error('Firebase signInWithCustomToken error details:', signInError.code, signInError.message);
          throw signInError;
        }
      } else {
        console.error('Invalid token response:', firebaseTokenData);
        throw new Error('Kein Firebase-Token in der Antwort');
      }
    } catch (error) {
      console.error('Firebase custom token auth failed:', error);
      throw error;
    }
  };

  // Hybrid-Login: Versuche erst Firebase, dann Fallback auf bestehenden Login
  const login = async (email, password) => {
    try {
      console.log('Attempting login with Firebase...');
      setError(null);
      
      // Versuche Firebase-Login
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Firebase-Token in localStorage speichern
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
        
        // Benutzer-Dokument aktualisieren
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          lastLogin: new Date().toISOString()
        });
        
        return { success: true, user };
      } catch (firebaseError) {
        console.warn('Firebase login failed, trying legacy login:', firebaseError);
        
        // Fallback auf bestehenden Login
        const data = await fetchWithCredentials(`${SERVER_URL}/api/auth/login`, {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        
        console.log('Legacy login successful:', data);
        
        if (data?.token) {
          localStorage.setItem('token', data.token);
          
          // NEU: Versuche Firebase-Token zu bekommen und anmelden
          try {
            await getFirebaseTokenAndSignIn();
            console.log('Erfolgreiche Firebase-Anmeldung nach Legacy-Login');
          } catch (fbTokenError) {
            console.warn('Firebase auth after legacy login failed:', fbTokenError);
            // Weitermachen mit Legacy-Login, auch wenn Firebase fehlschlägt
          }
        }
        
        if (data?.data?.user) {
          setUser(data.data.user);
          setIsAuthenticated(true);
        }
        
        return data;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Hybrid-Registrierung: Erstelle Benutzer in Firebase und im bestehenden System
  const register = async (username, email, password) => {
    try {
      console.log('Attempting registration with Firebase:', { username, email, password: '****' });
      setError(null);
      
      // Versuche Firebase-Registrierung
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Firebase-Token in localStorage speichern
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
        
        // Benutzer-Dokument erstellen
        const userRef = doc(db, 'users', user.uid);
        const userData = {
          username,
          email,
          selectedLanguages: ['ukrainian', 'arabic', 'turkish'],
          progress: {
            missions: {
              erstellt: 0,
              gelernt: 0,
              verben: 0
            },
            totalScore: 0,
            level: 'Weltraum-Kadett',
            energy: 100
          },
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        await setDoc(userRef, userData);
        
        setUser({
          _id: user.uid,
          ...userData
        });
        setIsAuthenticated(true);
        
        return { success: true, user: { _id: user.uid, ...userData } };
      } catch (firebaseError) {
        console.warn('Firebase registration failed, trying legacy registration:', firebaseError);
        
        // Fallback auf bestehende Registrierung
        const data = await fetchWithCredentials(`${SERVER_URL}/api/auth/register`, {
          method: 'POST',
          body: JSON.stringify({ username, email, password })
        });
        
        console.log('Legacy registration successful:', data);
        
        if (data?.token) {
          localStorage.setItem('token', data.token);
          
          // NEU: Versuche Firebase-Token zu bekommen und anmelden
          try {
            await getFirebaseTokenAndSignIn();
            console.log('Erfolgreiche Firebase-Anmeldung nach Legacy-Registrierung');
          } catch (fbTokenError) {
            console.warn('Firebase auth after legacy registration failed:', fbTokenError);
            // Weitermachen mit Legacy-Registrierung, auch wenn Firebase fehlschlägt
          }
        }
        
        if (data?.data?.user) {
          setUser(data.data.user);
          setIsAuthenticated(true);
        }
        
        return data;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.message);
      throw error;
    }
  };

  // Hybrid-Logout: Firebase und bestehenden Logout durchführen
  const logout = async () => {
    try {
      console.log('Attempting logout...');
      setError(null);
      
      // Firebase-Logout
      if (firebaseUser) {
        await signOut(auth);
      }
      
      // Bestehender Logout
      try {
        await fetchWithCredentials(`${SERVER_URL}/api/auth/logout`, {
          method: 'GET'
        });
        console.log('Legacy logout successful');
      } catch (error) {
        console.warn('Legacy logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    } finally {
      // Immer den lokalen Status zurücksetzen
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Fortschritt in Firebase und im bestehenden System aktualisieren
  const updateProgress = async (progress) => {
    try {
      console.log('Updating progress...', progress);
      setError(null);
      
      // Fortschritt in Firebase aktualisieren
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userRef, { progress });
      }
      
      // Bestehenden Fortschritt aktualisieren
      const data = await fetchWithCredentials(`${SERVER_URL}/api/auth/me`, {
        method: 'PATCH',
        body: JSON.stringify({ progress })
      });
      
      console.log('Progress update successful:', data);
      
      if (data?.data?.user) {
        setUser(data.data.user);
      }
      
      return data;
    } catch (error) {
      console.error('Progress update failed:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    checkAuthStatus,
    updateProgress,
    firebaseUser  // NEU: Exportiere auch den Firebase-Benutzer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
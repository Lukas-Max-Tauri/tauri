// src/utils/api.js
// Verbesserte Tauri-Erkennung
export const isTauri = !!window.__TAURI__ || 
                      window.navigator.userAgent.includes('Tauri') || 
                      window.location.protocol === 'tauri:' || 
                      window.location.protocol === 'app:';

// Verwende immer die neue Cloud-URL in Tauri-Umgebung
export const SERVER_URL = isTauri 
  ? 'https://backend-6bu6t6ce2a-uc.a.run.app'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5002');

console.log('API Configuration - Using SERVER_URL:', SERVER_URL, 'isTauri:', isTauri);
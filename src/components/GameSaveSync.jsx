// src/components/GameSaveSync.jsx
import React, { useState, useRef } from 'react';
import { useGameSave } from '../contexts/GameSaveContext';
import { useAuth } from '../contexts/AuthContext';

const GameSaveSync = () => {
  const { 
    syncStatus, 
    isOnline, 
    lastSync, 
    forceSync, 
    exportGameData, 
    importGameData, 
    resetGameData,
    pendingSyncCount
  } = useGameSave();
  
  const { isAuthenticated, user } = useAuth();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'Nie';
    
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSync = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const result = await forceSync();
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Synchronisation fehlgeschlagen: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const result = await exportGameData();
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Export fehlgeschlagen: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const jsonData = e.target.result;
          const result = await importGameData(jsonData);
          
          setMessage({
            type: result.success ? 'success' : 'error',
            text: result.message
          });
        } catch (error) {
          setMessage({
            type: 'error',
            text: `Import fehlgeschlagen: ${error.message}`
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setMessage({
          type: 'error',
          text: 'Fehler beim Lesen der Datei'
        });
        setIsLoading(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Import fehlgeschlagen: ${error.message}`
      });
      setIsLoading(false);
    }
    
    // Zurücksetzen des Datei-Inputs, damit dieselbe Datei erneut ausgewählt werden kann
    event.target.value = '';
  };

  const handleReset = async () => {
    if (window.confirm("Bist du sicher, dass du ALLE Spielstände zurücksetzen möchtest? Dies kann nicht rückgängig gemacht werden!")) {
      setIsLoading(true);
      setMessage(null);
      
      try {
        const result = await resetGameData();
        setMessage({
          type: result.success ? 'success' : 'error',
          text: result.message
        });
      } catch (error) {
        setMessage({
          type: 'error',
          text: `Zurücksetzen fehlgeschlagen: ${error.message}`
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#fff', textAlign: 'center' }}>
        Spielstände &amp; Synchronisation
      </h2>
      
      <div style={{ 
        backgroundColor: 'rgba(59, 130, 246, 0.1)', 
        borderRadius: '8px', 
        padding: '15px', 
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#93c5fd' }}>Status:</span>
          <span style={{ color: 'white', fontWeight: 'bold' }}>
            {isOnline ? '🌐 Online' : '📵 Offline'}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#93c5fd' }}>Synchronisation:</span>
          <span style={{ color: 'white', fontWeight: 'bold' }}>
            {syncStatus === 'synced' ? '✅ Synchronisiert' : 
             syncStatus === 'syncing' ? '🔄 Synchronisiere...' : 
             syncStatus === 'error' ? '❌ Fehler' : 
             '⏳ Warte'}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#93c5fd' }}>Letzte Synchronisation:</span>
          <span style={{ color: 'white', fontWeight: 'bold' }}>
            {formatDate(lastSync)}
          </span>
        </div>
        
        {pendingSyncCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#93c5fd' }}>Ausstehende Änderungen:</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>
              {pendingSyncCount}
            </span>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#93c5fd' }}>Benutzer:</span>
          <span style={{ color: 'white', fontWeight: 'bold' }}>
            {isAuthenticated ? user?.username || user?.email : 'Nicht angemeldet'}
          </span>
        </div>
      </div>
      
      {message && (
        <div style={{ 
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '20px',
          color: message.type === 'success' ? '#34d399' : '#f87171'
        }}>
          {message.text}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={handleSync}
          disabled={isLoading || !isOnline || !isAuthenticated}
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: isLoading || !isOnline || !isAuthenticated ? 'not-allowed' : 'pointer',
            opacity: isLoading || !isOnline || !isAuthenticated ? 0.5 : 1
          }}
        >
          {isLoading ? '🔄 Laden...' : '🔄 Jetzt synchronisieren'}
        </button>
        
        <button 
          onClick={handleExport}
          disabled={isLoading}
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          {isLoading ? '⏳ Laden...' : '💾 Spielstände exportieren'}
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button 
          onClick={handleImportClick}
          disabled={isLoading}
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          {isLoading ? '⏳ Laden...' : '📤 Spielstände importieren'}
        </button>
        
        <button 
          onClick={handleReset}
          disabled={isLoading}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          {isLoading ? '⏳ Laden...' : '🗑️ Alle Spielstände zurücksetzen'}
        </button>
      </div>
      
      {/* Verstecktes Datei-Input-Element */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />
      <div style={{ marginTop: '30px', color: '#93c5fd', fontSize: '14px', textAlign: 'center' }}>
        <p>Hinweis: Mit dem Export-Button kannst du eine Sicherungskopie deiner Spielstände erstellen. Diese kannst du später über den Import-Button wiederherstellen.</p>
        <p>Die Synchronisation erfolgt automatisch, wenn du online bist. Mit "Jetzt synchronisieren" kannst du dies manuell starten.</p>
      </div>
    </div>
  );
};

export default GameSaveSync;
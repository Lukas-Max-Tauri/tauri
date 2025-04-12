import React, { useState, useEffect } from 'react';
import { verifyLicense, updateLicenseActivation } from '../services/licenseService';
import './LicenseActivation.css';

const LicenseActivation = ({ onLicenseActivated }) => {
  const [licenseCode, setLicenseCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStoredLicense, setHasStoredLicense] = useState(false);
  
  // Prüfen, ob bereits eine gespeicherte Lizenz vorhanden ist
  useEffect(() => {
    try {
      const savedLicense = localStorage.getItem('dazConnectLicense');
      
      if (savedLicense) {
        const licenseInfo = JSON.parse(savedLicense);
        const expiryDate = new Date(licenseInfo.expiryDate);
        const currentDate = new Date();
        
        if (currentDate <= expiryDate) {
          // Lizenz ist noch gültig
          setHasStoredLicense(true);
          setValidationResult({
            valid: true,
            productName: licenseInfo.productName,
            expiryDate: expiryDate,
            remainingDays: Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24)),
            licenseType: licenseInfo.licenseType,
            activationsCount: licenseInfo.activationsCount || 1,
            maxActivations: licenseInfo.maxActivations || 3
          });
          
          // Callback aufrufen, um der Hauptanwendung mitzuteilen, dass die Lizenz gültig ist
          if (onLicenseActivated) {
            onLicenseActivated(licenseInfo);
          }
        }
      }
    } catch (error) {
      console.error('Fehler beim Überprüfen der gespeicherten Lizenz:', error);
    }
  }, [onLicenseActivated]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!licenseCode.trim()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Lizenzcode überprüfen
      const result = await verifyLicense(licenseCode);
      setValidationResult(result);
      
      // Wenn die Lizenz gültig ist, Aktivierungsinfo aktualisieren
      if (result.valid) {
        // Geräte-Informationen sammeln
        const deviceInfo = {
          platform: navigator.platform || window.navigator.platform,
          userAgent: navigator.userAgent || window.navigator.userAgent,
          date: new Date().toISOString(),
          appVersion: window.appVersion || 'Desktop App'
        };
        
        // Lizenz aktivieren
        await updateLicenseActivation(result.licenseId, deviceInfo);
        
        // Lizenzinformationen lokal speichern (für Offline-Nutzung)
        const licenseInfo = {
          code: result.code,
          productName: result.productName,
          expiryDate: result.expiryDate,
          activatedAt: new Date().toISOString(),
          licenseType: result.licenseType,
          activationsCount: result.activationsCount || 1,
          maxActivations: result.maxActivations || 3
        };
        
        localStorage.setItem('dazConnectLicense', JSON.stringify(licenseInfo));
        setHasStoredLicense(true);
        
        // Callback aufrufen, wenn Lizenz aktiviert wurde
        if (onLicenseActivated) {
          onLicenseActivated(licenseInfo);
        }
      }
    } catch (error) {
      console.error('Fehler bei der Lizenzaktivierung:', error);
      setValidationResult({
        valid: false,
        message: 'Bei der Aktivierung ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCodeChange = (e) => {
    // Automatisch formatieren: XXXXX-XXXXX-XXXXX-XXXXX
    // Entferne alle Zeichen, die keine Buchstaben oder Zahlen sind
    let code = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Füge Bindestriche an den richtigen Positionen hinzu
    if (code.length > 5) code = code.slice(0, 5) + '-' + code.slice(5);
    if (code.length > 11) code = code.slice(0, 11) + '-' + code.slice(11);
    if (code.length > 17) code = code.slice(0, 17) + '-' + code.slice(17);
    if (code.length > 23) code = code.slice(0, 23);
    
    setLicenseCode(code);
    
    // Wenn ein Ergebnis angezeigt wird und der Benutzer den Code ändert, setze das Ergebnis zurück
    if (validationResult) {
      setValidationResult(null);
    }
  };
  
  return (
    <div className="license-activation-container">
      <div className="license-card">
        <div className="license-header">
          <img src="/logo.png" alt="DaZ Connect Logo" className="logo" />
          <h1>DaZ Connect</h1>
          <p className="subtitle">Lizenzaktivierung</p>
        </div>
        
        {!hasStoredLicense && (
          <div className="license-form">
            <p className="instruction">Bitte geben Sie Ihren Lizenzschlüssel ein, um die Software zu aktivieren:</p>
            
            <form onSubmit={handleSubmit}>
              <div className="license-input-wrapper">
                <input
                  type="text"
                  value={licenseCode}
                  onChange={handleCodeChange}
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                  disabled={isLoading}
                  maxLength={23} // 4 Segmente à 5 Zeichen plus 3 Bindestriche
                  className="license-input"
                />
                
                <button 
                  type="submit" 
                  disabled={isLoading || licenseCode.length < 23} 
                  className="activate-button"
                >
                  {isLoading ? (
                    <>
                      <span className="button-loader"></span>
                      <span className="button-text">Prüfe...</span>
                    </>
                  ) : (
                    <span className="button-text">Aktivieren</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {validationResult && (
          <div className="result-container">
            <div className={`message ${validationResult.valid ? 'success-message' : 'error-message'}`}>
              <div className={`message-icon ${validationResult.valid ? 'success-icon' : 'error-icon'}`}>
                {validationResult.valid ? '✓' : '✗'}
              </div>
              <div className="message-content">
                {validationResult.valid ? (
                  <div className="license-details">
                    <h3>Lizenz aktiviert!</h3>
                    <p id="productName">Ihre Lizenz für <strong>{validationResult.productName}</strong> ist gültig.</p>
                    <p id="expiryDate">Gültig bis: <strong>{new Date(validationResult.expiryDate).toLocaleDateString('de-DE')}</strong></p>
                    <p id="remainingDays">Verbleibende Tage: <strong>{validationResult.remainingDays}</strong></p>
                    <p id="licenseType">Lizenztyp: <strong>{validationResult.licenseType === 'year' ? 'Jahreslizenz' : 'Trial-Lizenz'}</strong></p>
                    <p id="activations">Aktivierungen: <strong>{validationResult.activationsCount || 1}</strong> von <strong>{validationResult.maxActivations || 3}</strong></p>
                    
                    {hasStoredLicense && (
                      <button 
                        className="continue-button"
                        onClick={() => onLicenseActivated && onLicenseActivated()}
                      >
                        Zur Anwendung
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="error-details">
                    <h3>Lizenzüberprüfung fehlgeschlagen</h3>
                    <p>{validationResult.message}</p>
                    {validationResult.expired && (
                      <div className="expired-note">
                        <p>Möchten Sie Ihre Lizenz verlängern? <a href="https://dazconnect.de/preise" target="_blank" rel="noopener noreferrer">Hier klicken</a>.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="footer">
          <p>Bei Fragen oder Problemen kontaktieren Sie unseren Support unter <a href="mailto:info@dazconnect.de">info@dazconnect.de</a></p>
        </div>
      </div>
    </div>
  );
};

export default LicenseActivation;
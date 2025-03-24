import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";

// Globaler Fehlerhandler für unerwartete Fehler
window.addEventListener('error', (event) => {
  console.error('Globaler Fehler:', event.error);
  alert(`App-Fehler: ${event.message}`); // Einfache Alert-Box für sofortige Sichtbarkeit
});

// Einfache Error Boundary Komponente - NACH OBEN VERSCHOBEN
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Komponenten-Fehler:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
          <h2>Etwas ist schief gelaufen</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            App neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Versuche eine sichtbare Fehlermeldung zu rendern, wenn etwas schief geht
try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Rendering-Fehler:', error);
  document.body.innerHTML = `
    <div style="color: red; padding: 20px; text-align: center;">
      <h1>Fehler beim Starten der App</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `;
}
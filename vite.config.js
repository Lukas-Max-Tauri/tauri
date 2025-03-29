import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Diese Zeile ist entscheidend!
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5002')
  },
  
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  build: {
    // Stelle sicher, dass der Ausgabepfad stimmt
    outDir: 'dist',
    // Leere das Verzeichnis vor dem Build
    emptyOutDir: true,
    // Sorge für ein sauberes Build-Ergebnis
    sourcemap: true,
    rollupOptions: {
      // Hier die externe Abhängigkeit für Tauri APIs hinzufügen
      external: [
        '@tauri-apps/api/tauri',
        '@tauri-apps/api/fs',
        '@tauri-apps/api/window',
        '@tauri-apps/api/dialog'
      ],
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    exclude: ['@tauri-apps/api']
  }
});
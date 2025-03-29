use tauri_plugin_http;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_log::Builder::default().build())
    .setup(|app| {
      #[cfg(debug_assertions)]
      {
        // DevTools im Debug-Modus öffnen
        // Verwende get_webview_window statt get_window (Tauri 2.x API Änderung)
        if let Some(window) = app.get_webview_window("main") {
          window.open_devtools();
          println!("DevTools wurden geöffnet");
        } else {
          println!("Hauptfenster konnte nicht gefunden werden");
        }
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
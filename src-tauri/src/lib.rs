use tauri::{menu::*, Manager};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn create_korean_menu(app: &tauri::AppHandle) -> tauri::Result<Menu<tauri::Wry>> {
    let menu = MenuBuilder::new(app)
        .item(
            &SubmenuBuilder::new(app, "dailywork")
                .item(&MenuItemBuilder::new("dailywork에 관하여").id("about").build(app)?)
                .separator()
                .item(&MenuItemBuilder::new("dailywork 종료").id("quit").accelerator("CmdOrCtrl+Q").build(app)?)
                .build()?
        )
        .item(
            &SubmenuBuilder::new(app, "파일")
                .item(&MenuItemBuilder::new("윈도우 닫기").id("close").accelerator("CmdOrCtrl+W").build(app)?)
                .build()?
        )
        .build()?;

    Ok(menu)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let menu = create_korean_menu(app.handle())?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            match event.id().as_ref() {
                "quit" => {
                    app.exit(0);
                }
                "about" => {
                    // About 다이얼로그 표시
                }
                "hide" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.hide();
                    }
                }
                "minimize" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.minimize();
                    }
                }
                "close" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.close();
                    }
                }
                "fullscreen" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.set_fullscreen(!window.is_fullscreen().unwrap_or(false));
                    }
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

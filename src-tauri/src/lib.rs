use tauri::{menu::*, Manager, Emitter};

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
                .item(&MenuItemBuilder::new("열기").id("open").accelerator("CmdOrCtrl+O").build(app)?)
                .item(&MenuItemBuilder::new("저장").id("save").accelerator("CmdOrCtrl+S").build(app)?)
                .separator()
                .item(&MenuItemBuilder::new("윈도우 닫기").id("close").accelerator("CmdOrCtrl+W").build(app)?)
                .build()?
        )
        .item(
            &SubmenuBuilder::new(app, "편집")
                .item(&MenuItemBuilder::new("실행 취소").id("undo").accelerator("CmdOrCtrl+Z").build(app)?)
                .item(&MenuItemBuilder::new("다시 실행").id("redo").accelerator("CmdOrCtrl+Shift+Z").build(app)?)
                .separator()
                .item(&MenuItemBuilder::new("잘라내기").id("cut").accelerator("CmdOrCtrl+X").build(app)?)
                .item(&MenuItemBuilder::new("복사").id("copy").accelerator("CmdOrCtrl+C").build(app)?)
                .item(&MenuItemBuilder::new("붙여넣기").id("paste").accelerator("CmdOrCtrl+V").build(app)?)
                .item(&MenuItemBuilder::new("모두 선택").id("select_all").accelerator("CmdOrCtrl+A").build(app)?)
                .build()?
        )
        .build()?;

    Ok(menu)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            // Windows에서는 메뉴 바를 숨기고, macOS에서만 메뉴 바를 표시
            #[cfg(target_os = "macos")]
            {
                let menu = create_korean_menu(app.handle())?;
                app.set_menu(menu)?;
            }
            Ok(())
        })
        .on_menu_event(|app, event| {
            match event.id().as_ref() {
                "quit" => {
                    app.exit(0);
                }
                "about" => {
                    #[cfg(target_os = "macos")]
                    {
                        use cocoa::appkit::NSApp;
                        use cocoa::base::nil;
                        use objc::{msg_send, sel, sel_impl};
                        
                        unsafe {
                            let app: cocoa::base::id = NSApp();
                            let _: () = msg_send![app, orderFrontStandardAboutPanel: nil];
                        }
                    }
                    
                    #[cfg(not(target_os = "macos"))]
                    {
                        use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
                        let _ = app.dialog()
                            .message("dailywork v0.1.1\n\n© 2025 Jihun Kim. All rights reserved.")
                            .kind(MessageDialogKind::Info)
                            .buttons(MessageDialogButtons::Ok)
                            .title("dailywork에 관하여")
                            .show(move |_| {});
                    }
                }
                "open" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-open", ());
                    }
                }
                "save" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-save", ());
                    }
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
                "undo" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-undo", ());
                    }
                }
                "redo" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-redo", ());
                    }
                }
                "cut" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-cut", ());
                    }
                }
                "copy" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-copy", ());
                    }
                }
                "paste" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-paste", ());
                    }
                }
                "select_all" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-select-all", ());
                    }
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

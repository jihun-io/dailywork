import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { listen } from "@tauri-apps/api/event";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";

// 편집 메뉴 이벤트 리스너 설정
const setupMenuEventListeners = async () => {
  await listen("menu-undo", () => {
    document.execCommand("undo");
  });

  await listen("menu-redo", () => {
    document.execCommand("redo");
  });

  await listen("menu-cut", async () => {
    try {
      const activeElement = document.activeElement as
        | HTMLInputElement
        | HTMLTextAreaElement;

      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        const start = activeElement.selectionStart || 0;
        const end = activeElement.selectionEnd || 0;

        if (start !== end) {
          const selectedText = activeElement.value.substring(start, end);

          // 클립보드에 복사 (Tauri API 사용)
          await writeText(selectedText);

          // 선택된 텍스트 삭제 (execCommand 사용으로 undo 히스토리에 기록됨)
          document.execCommand("delete");
        }
      } else {
        document.execCommand("cut");
      }
    } catch (err) {
      console.error("잘라내기 실패:", err);
      document.execCommand("cut");
    }
  });

  await listen("menu-copy", async () => {
    try {
      const activeElement = document.activeElement as
        | HTMLInputElement
        | HTMLTextAreaElement;

      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        const start = activeElement.selectionStart || 0;
        const end = activeElement.selectionEnd || 0;

        if (start !== end) {
          const selectedText = activeElement.value.substring(start, end);
          await writeText(selectedText);
        }
      } else {
        document.execCommand("copy");
      }
    } catch (err) {
      console.error("복사 실패:", err);
      document.execCommand("copy");
    }
  });

  await listen("menu-paste", async () => {
    try {
      const activeElement = document.activeElement as
        | HTMLInputElement
        | HTMLTextAreaElement;

      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        const text = await readText();

        if (!text) {
          return;
        }

        // 텍스트 삽입 (execCommand 사용으로 undo 히스토리에 기록됨)
        document.execCommand("insertText", false, text);
      } else {
        document.execCommand("paste");
      }
    } catch (err) {
      console.error("붙여넣기 실패:", err);
      document.execCommand("paste");
    }
  });

  await listen("menu-select-all", () => {
    const activeElement = document.activeElement as
      | HTMLInputElement
      | HTMLTextAreaElement;

    if (
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA")
    ) {
      activeElement.select();
    } else {
      document.execCommand("selectAll");
    }
  });

  // 파일 메뉴 이벤트 리스너
  await listen("menu-open", () => {
    // 열기 버튼 클릭 이벤트 트리거
    const openButton = document.querySelector(
      '[data-test-id="open-button"]',
    ) as HTMLButtonElement;
    if (openButton && !openButton.disabled) {
      openButton.click();
    }
  });

  await listen("menu-save", () => {
    // 저장 버튼 클릭 이벤트 트리거
    const saveButton = document.querySelector(
      '[data-test-id="save-button"]',
    ) as HTMLButtonElement;
    if (saveButton && !saveButton.disabled) {
      saveButton.click();

      setTimeout(() => {
        const saveExcelButton = document.querySelector(
          '[data-test-id="export-excel-menuitem"]',
        ) as HTMLButtonElement;
        if (saveExcelButton && !saveExcelButton.disabled) {
          saveExcelButton.click();
        }
      }, 0);
    }
  });

  // 창 닫기 확인 이벤트 리스너 (React 컴포넌트에서 처리)
  await listen("confirm-close", () => {
    // React 컴포넌트에서 다이얼로그를 표시하도록 이벤트만 전달
    // 실제 처리는 DailyWorkForm.tsx에서 수행
  });
};

// Windows에서만 키보드 단축키 리스너 추가
if (navigator.userAgent.includes("Windows")) {
  document.addEventListener("keydown", (event) => {
    // Ctrl+O (Windows에서만)
    if (
      event.ctrlKey &&
      event.key === "o" &&
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      const openButton = document.querySelector(
        '[data-test-id="open-button"]',
      ) as HTMLButtonElement;
      if (openButton && !openButton.disabled) {
        openButton.click();
      }
    }

    // Ctrl+S (Windows에서만)
    if (
      event.ctrlKey &&
      event.key === "s" &&
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      const saveButton = document.querySelector(
        '[data-test-id="save-button"]',
      ) as HTMLButtonElement;
      if (saveButton && !saveButton.disabled) {
        saveButton.click();

        setTimeout(() => {
          const saveExcelButton = document.querySelector(
            '[data-test-id="export-excel-menuitem"]',
          ) as HTMLButtonElement;
          if (saveExcelButton && !saveExcelButton.disabled) {
            saveExcelButton.click();
          }
        }, 0);
      }
    }
  });
}

// 이벤트 리스너 설정
setupMenuEventListeners();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

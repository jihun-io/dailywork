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

          // 클립보드에 복사
          await writeText(selectedText);

          // 선택된 텍스트 삭제
          const currentValue = activeElement.value;
          const newValue =
            currentValue.substring(0, start) + currentValue.substring(end);
          activeElement.value = newValue;

          // 커서 위치 설정
          activeElement.setSelectionRange(start, start);

          // React의 상태를 강제로 업데이트하기 위해 React 내부 속성 설정
          let nativeInputValueSetter;
          if (activeElement.tagName === "INPUT") {
            nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              "value"
            )?.set;
          } else if (activeElement.tagName === "TEXTAREA") {
            nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype,
              "value"
            )?.set;
          }

          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(activeElement, newValue);
          }

          // React SyntheticEvent를 위한 고급 이벤트 생성
          const inputEvent = new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            data: null, // 잘라내기는 데이터가 제거되므로 null
            inputType: "deleteContentBackward",
          });

          const changeEvent = new Event("change", {
            bubbles: true,
            cancelable: true,
          });

          // React의 이벤트 리스너를 트리거
          activeElement.dispatchEvent(inputEvent);
          activeElement.dispatchEvent(changeEvent);

          // 추가적으로 focus 이벤트도 발생시켜 React가 변경 사항을 확실히 감지하도록 함
          activeElement.blur();
          activeElement.focus();
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

        // 현재 커서 위치 확인
        const start = activeElement.selectionStart || 0;
        const end = activeElement.selectionEnd || 0;
        const currentValue = activeElement.value;

        // 새 값 계산
        const newValue =
          currentValue.substring(0, start) + text + currentValue.substring(end);
        const newCursorPos = start + text.length;

        // React-friendly한 방식으로 값 설정
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          activeElement.constructor.prototype,
          "value"
        )?.set;

        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(activeElement, newValue);
        }

        // 커서 위치 설정
        activeElement.setSelectionRange(newCursorPos, newCursorPos);

        // React가 인식할 수 있는 input 이벤트만 발생
        const inputEvent = new Event("input", { bubbles: true });
        activeElement.dispatchEvent(inputEvent);
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
      '[data-test-id="open-button"]'
    ) as HTMLButtonElement;
    if (openButton && !openButton.disabled) {
      openButton.click();
    }
  });

  await listen("menu-save", () => {
    // 저장 버튼 클릭 이벤트 트리거
    const saveButton = document.querySelector(
      '[data-test-id="save-button"]'
    ) as HTMLButtonElement;
    if (saveButton && !saveButton.disabled) {
      saveButton.click();

      setTimeout(() => {
        const saveExcelButton = document.querySelector(
          '[data-test-id="export-excel-menuitem"]'
        ) as HTMLButtonElement;
        if (saveExcelButton && !saveExcelButton.disabled) {
          saveExcelButton.click();
        }
      }, 0);
    }
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
        '[data-test-id="open-button"]'
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
        '[data-test-id="save-button"]'
      ) as HTMLButtonElement;
      if (saveButton && !saveButton.disabled) {
        saveButton.click();

        setTimeout(() => {
          const saveExcelButton = document.querySelector(
            '[data-test-id="export-excel-menuitem"]'
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
  </React.StrictMode>
);

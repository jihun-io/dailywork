import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { listen } from "@tauri-apps/api/event";

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
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        const start = activeElement.selectionStart || 0;
        const end = activeElement.selectionEnd || 0;
        
        if (start !== end) {
          const selectedText = activeElement.value.substring(start, end);
          
          // 클립보드에 복사
          await navigator.clipboard.writeText(selectedText);
          
          // 선택된 텍스트 삭제
          const currentValue = activeElement.value;
          const newValue = currentValue.substring(0, start) + currentValue.substring(end);
          activeElement.value = newValue;
          
          // 커서 위치 설정
          activeElement.setSelectionRange(start, start);
          
          // input 이벤트 발생
          const event = new Event('input', { bubbles: true });
          activeElement.dispatchEvent(event);
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
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        const start = activeElement.selectionStart || 0;
        const end = activeElement.selectionEnd || 0;
        
        if (start !== end) {
          const selectedText = activeElement.value.substring(start, end);
          await navigator.clipboard.writeText(selectedText);
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
      // 현재 포커스된 요소 확인
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        // 클립보드에서 텍스트 읽기
        const text = await navigator.clipboard.readText();
        
        // 현재 커서 위치 확인
        const start = activeElement.selectionStart || 0;
        const end = activeElement.selectionEnd || 0;
        const currentValue = activeElement.value;
        
        // 텍스트 삽입
        const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
        activeElement.value = newValue;
        
        // 커서 위치 설정
        const newCursorPos = start + text.length;
        activeElement.setSelectionRange(newCursorPos, newCursorPos);
        
        // input 이벤트 발생 (React의 상태 업데이트를 위해)
        const event = new Event('input', { bubbles: true });
        activeElement.dispatchEvent(event);
      } else {
        // 폴백: 기본 붙여넣기 명령 시도
        document.execCommand("paste");
      }
    } catch (err) {
      console.error("붙여넣기 실패:", err);
      // 폴백: 기본 붙여넣기 명령 시도
      document.execCommand("paste");
    }
  });

  await listen("menu-select-all", () => {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      activeElement.select();
    } else {
      document.execCommand("selectAll");
    }
  });
};

// 이벤트 리스너 설정
setupMenuEventListeners();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

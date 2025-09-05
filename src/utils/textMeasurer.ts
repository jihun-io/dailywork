/**
 * 가상 DOM을 사용하여 텍스트의 높이를 측정하는 유틸리티
 */

interface TextMeasureOptions {
  text: string;
  width: number; // 셀의 너비 (픽셀)
  fontSize?: number; // 폰트 크기 (기본값: 12)
  fontFamily?: string; // 폰트 패밀리 (기본값: Arial)
  lineHeight?: number; // 라인 높이 배수 (기본값: 1.2)
  padding?: number; // 패딩 (기본값: 4)
}

/**
 * 가상 DOM을 생성하여 텍스트의 실제 높이를 측정합니다.
 */
export function measureTextHeight(options: TextMeasureOptions): number {
  const {
    text,
    width,
    fontSize = 11,
    fontFamily = "Arial",
    lineHeight = 1.2,
    padding = 0,
  } = options;

  // 가상 DOM 엘리먼트 생성
  const measureElement = document.createElement("div");

  // 스타일 설정 - Excel 셀과 유사하게
  measureElement.style.cssText = `
    position: absolute;
    visibility: hidden;
    left: -9999px;
    top: -9999px;
    width: ${width - padding * 2}px;
    font-size: ${fontSize}px;
    font-family: ${fontFamily};
    line-height: ${lineHeight};
    word-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
    padding: ${padding}px;
    border: none;
    margin: 0;
  `;

  // 텍스트 내용 설정
  measureElement.textContent = text;

  // DOM에 추가
  document.body.appendChild(measureElement);

  // 높이 측정
  const height = measureElement.scrollHeight;

  // DOM에서 제거
  document.body.removeChild(measureElement);

  return height;
}

/**
 * 업무 설명 텍스트에 대한 Excel 행 높이를 계산합니다.
 */
export function calculateRowHeight(
  description: string,
  cellWidth: number = 300,
): number {
  if (!description || description.trim() === "") {
    return 33.75; // 기본 행 높이
  }

  const pixelHeight = measureTextHeight({
    text: description,
    width: cellWidth,
    fontSize: 11, // Excel 기본 폰트 크기
    fontFamily: "Arial, sans-serif",
    lineHeight: 2,
  });

  return pixelHeight;
}

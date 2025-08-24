/**
 * 날짜 형식 변환 유틸리티
 * 내부적으로는 YYYY-MM-DD 형식으로 통일
 */

/**
 * 다양한 날짜 형식을 YYYY-MM-DD 형식으로 변환
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr || !dateStr.trim()) {
    const today = new Date();
    return formatDateToISO(today);
  }

  const trimmed = dateStr.trim();

  // 이미 YYYY-MM-DD 형식인 경우
  if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return trimmed;
  }

  // YYYY. M. D. 형식 (한국어 날짜)
  if (trimmed.includes(".")) {
    const parts = trimmed.replaceAll(" ", "").split(".").filter(part => part);
    if (parts.length >= 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const day = parseInt(parts[2]);
      
      if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }
    }
  }

  // MM/DD/YYYY 또는 MM-DD-YYYY 형식
  const usDateMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (usDateMatch) {
    const [, month, day, year] = usDateMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // 파싱 실패 시 현재 날짜 반환
  console.warn("날짜 형식을 인식할 수 없습니다:", dateStr);
  const today = new Date();
  return formatDateToISO(today);
}

/**
 * Date 객체를 YYYY-MM-DD 형식으로 변환
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 형식을 한국어 표시용 형식으로 변환
 */
export function formatDateToKorean(dateStr: string): string {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}. ${parseInt(month)}. ${parseInt(day)}.`;
  }
  return dateStr;
}

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getCurrentDateISO(): string {
  return formatDateToISO(new Date());
}
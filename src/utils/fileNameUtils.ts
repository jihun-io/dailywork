import { normalizeDate } from "./dateUtils.ts";

export interface FileNameBlock {
  id: string;
  type: "text" | "name" | "date";
  content: string; // type이 "text"인 경우에만 사용
}

export interface FileNameFormat {
  blocks: Array<FileNameBlock>;
  dateFormat: "yyyymmdd" | "yymmdd" | "dateString" | "yyyy-mm-dd";
}

function formatDateForFilename({
  dateStr,
  dateFormat = "yyyymmdd",
}: {
  dateStr: string;
  dateFormat?: "yyyymmdd" | "yymmdd" | "dateString" | "yyyy-mm-dd";
}) {
  // 날짜를 YYYY-MM-DD 형식으로 정규화
  const normalized = normalizeDate(dateStr);
  if (dateFormat === "yyyymmdd") {
    return normalized.replace(/-/g, "");
  } else if (dateFormat === "yymmdd") {
    return normalized.slice(2).replace(/-/g, "");
  } else if (dateFormat === "dateString") {
    const [year, month, day] = normalized.split("-");
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  }
  return normalized;
}

export function generateFileName({
  dateStr,
  username,
}: {
  dateStr: string;
  username: string;
}) {
  // 로컬 스토리지에서 파일 형식 불러오기
  const preferredFileNameFormatString = localStorage.getItem(
    "preferredFileNameFormat",
  );

  const preferredFileNameFormat: FileNameFormat = preferredFileNameFormatString
    ? JSON.parse(preferredFileNameFormatString)
    : { blocks: [], dateFormat: "yyyymmdd" };

  const fileNameBlocks = preferredFileNameFormat.blocks || [];
  const dateFormat = preferredFileNameFormat.dateFormat || "yyyymmdd";

  return fileNameBlocks.length > 0
    ? fileNameBlocks
        .map((block) => {
          switch (block.type) {
            case "text":
              return block.content;
            case "name":
              return username || "[이름없음]";
            case "date":
              return formatDateForFilename({
                dateStr,
                dateFormat,
              });
            default:
              return block.content;
          }
        })
        .join("")
    : `${formatDateForFilename({ dateStr, dateFormat })} 일일업무일지_${username || "[이름없음]"}`;
}

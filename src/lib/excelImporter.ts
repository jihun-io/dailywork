import ExcelJS from "exceljs";
import { DailyWorkData, WorkTask } from "../types/dailyWork";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { normalizeDate, getCurrentDateISO } from "../utils/dateUtils";

function importFromWorksheet(worksheet: ExcelJS.Worksheet): DailyWorkData {
  // 셀 값 읽기 함수
  const getCellValue = (cellAddress: string): string => {
    const cell = worksheet.getCell(cellAddress);
    return cell.value ? String(cell.value).trim() : "";
  };

  // 날짜 파싱 (C4 셀에서)
  const dateCell = worksheet.getCell("C4");
  let formattedDate = "";

  console.log("date cell:", dateCell);
  console.log("date cell value:", dateCell.value);
  console.log("date cell text:", dateCell.text);

  // 다양한 방법으로 날짜 추출 시도
  if (dateCell.text) {
    console.log("Using cell text:", dateCell.text);
    formattedDate = normalizeDate(dateCell.text);
  } else if (dateCell.value) {
    if (dateCell.value instanceof Date) {
      const year = dateCell.value.getFullYear();
      const month = String(dateCell.value.getMonth() + 1).padStart(2, '0');
      const day = String(dateCell.value.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    } else if (typeof dateCell.value === "number") {
      // 엑셀 시리얼 날짜를 Date로 변환
      const excelDate = new Date((dateCell.value - 25569) * 86400 * 1000);
      const year = excelDate.getFullYear();
      const month = String(excelDate.getMonth() + 1).padStart(2, '0');
      const day = String(excelDate.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    } else {
      formattedDate = normalizeDate(String(dateCell.value));
    }
  } else {
    formattedDate = getCurrentDateISO();
  }

  console.log("Final formatted date:", formattedDate);

  // 근무시간 파싱 (E4 셀에서)
  const timeValue = getCellValue("E4");
  let startTime = "09:00";
  let endTime = "18:00";
  let halfDay = false;
  let oasis = false;

  if (timeValue) {
    const timeMatch = timeValue.match(/(\d{2}:\d{2})\s*~\s*(\d{2}:\d{2})/);
    if (timeMatch) {
      startTime = timeMatch[1];
      endTime = timeMatch[2];
    }
    halfDay = timeValue.includes("반차");
    oasis = timeValue.includes("오아시스");
  }

  // 부서 (C5)와 이름 (E5) 읽기
  const department = getCellValue("C5");
  const name = getCellValue("E5");

  // 업무 내용 읽기 (Row 8-15)
  const tasks: WorkTask[] = [];
  for (let row = 8; row <= 15; row++) {
    const description = getCellValue(`B${row}`);
    const completedValue = getCellValue(`D${row}`);
    const notes = getCellValue(`E${row}`);

    if (description.trim()) {
      tasks.push({
        id: `task-${tasks.length + 1}`,
        description,
        completed: completedValue.toLowerCase() === "o" || completedValue.toLowerCase() === "완료",
        notes,
      });
    }
  }

  // 최소 하나의 빈 작업 추가 (기존 로직과 일치)
  if (tasks.length === 0) {
    tasks.push({
      id: "1",
      description: "",
      completed: false,
      notes: "",
    });
  }

  // 특이사항 읽기 (B17)
  const specialNotes = getCellValue("B17");

  return {
    date: formattedDate,
    name,
    department,
    startTime,
    endTime,
    halfDay,
    oasis,
    tasks,
    specialNotes,
  };
}

export async function importExcelFile(): Promise<DailyWorkData | null> {
  try {
    console.log("파일 선택 대화상자 열기 시작");
    
    // 파일 선택 대화상자 열기
    const filePath = await open({
      multiple: false,
      filters: [
        {
          name: "Excel Files",
          extensions: ["xlsx", "xls"],
        },
      ],
    });

    console.log("선택된 파일 경로:", filePath);

    if (!filePath) {
      console.log("사용자가 파일 선택을 취소했습니다.");
      return null; // 사용자가 취소한 경우
    }

    // 파일 읽기
    console.log("파일 읽기 시작:", filePath);
    const fileBuffer = await readFile(filePath);
    console.log("파일 버퍼 크기:", fileBuffer.length);
    
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("파일이 비어있거나 읽을 수 없습니다.");
    }
    
    // ExcelJS로 파일 파싱
    console.log("ExcelJS로 파일 파싱 시작");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer.buffer);
    console.log("파일 파싱 완료");

    const worksheet = workbook.getWorksheet("일일업무일지");
    
    if (!worksheet) {
      // 첫 번째 워크시트를 시도
      const firstWorksheet = workbook.worksheets[0];
      if (!firstWorksheet) {
        throw new Error("워크시트를 찾을 수 없습니다.");
      }
      console.warn("'일일업무일지' 워크시트를 찾을 수 없어서 첫 번째 워크시트를 사용합니다.");
      return importFromWorksheet(firstWorksheet);
    }

    console.log("워크시트에서 데이터 읽기 시작");
    const result = importFromWorksheet(worksheet);
    console.log("데이터 읽기 완료:", result);
    return result;
  } catch (error: any) {
    console.error("Excel 파일 불러오기 중 오류:", error);
    console.error("오류 스택:", error.stack);
    alert("Excel 파일 불러오기 중 오류가 발생했습니다: " + error.message);
    return null;
  }
}
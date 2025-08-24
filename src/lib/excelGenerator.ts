import ExcelJS from "exceljs";
import { DailyWorkData } from "../types/dailyWork";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { normalizeDate } from "../utils/dateUtils";

export async function generateExcelFile(data: DailyWorkData, customFilename?: string) {
  try {
    // 템플릿 파일 로드 (public 폴더에서)
    const templatePath = "/daily-work.xlsx";
    const response = await fetch(templatePath);
    const arrayBuffer = await response.arrayBuffer();

    // ExcelJS로 템플릿 파일 읽기
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet("일일업무일지");

    if (!worksheet) {
      throw new Error("워크시트를 찾을 수 없습니다.");
    }

    // 날짜 포맷팅 - 항상 YYYY-MM-DD 형식으로 정규화
    const formatDate = (dateStr: string) => {
      return normalizeDate(dateStr);
    };

    // 파일명용 날짜 포맷팅 - YYYYMMDD 형식
    const formatDateForFilename = (dateStr: string) => {
      return normalizeDate(dateStr).replace(/-/g, "");
    };

    // 셀 값 업데이트 (스타일은 보존)
    const updateCellValue = (cellAddress: string, value: string) => {
      const cell = worksheet.getCell(cellAddress);
      cell.value = value;
    };

    // 기본 정보 채우기
    updateCellValue("C4", formatDate(data.date));
    updateCellValue("E4", `${data.startTime} ~ ${data.endTime}${data.halfDay ? ' (반차)' : data.oasis ? ' (오아시스)' : ''}`);
    updateCellValue("C5", data.department);
    updateCellValue("E5", data.name);

    // 업무 내용 셀 클리어 (Row 8-15)
    for (let row = 8; row <= 15; row++) {
      updateCellValue(`B${row}`, ""); // 업무내용
      updateCellValue(`D${row}`, ""); // 완료여부
      updateCellValue(`E${row}`, ""); // 비고
    }

    // 새로운 업무 내용 입력
    data.tasks.forEach((task, index) => {
      const row = 8 + index; // Row 8부터 시작
      if (row > 15) return; // Row 15까지만

      updateCellValue(`B${row}`, task.description);
      updateCellValue(`D${row}`, task.completed ? "O" : "");
      updateCellValue(`E${row}`, task.notes);
    });

    // 특이사항 입력
    updateCellValue("B17", data.specialNotes);

    // 파일을 Buffer로 변환
    const buffer = await workbook.xlsx.writeBuffer();

    // 기본 파일명 생성 - 커스텀 파일명이 있으면 사용, 없으면 기본값
    const defaultFilename = customFilename || `${formatDateForFilename(data.date)} 일일업무일지_${data.name}.xlsx`;

    // 파일 저장 대화상자 열기
    const filePath = await save({
      defaultPath: defaultFilename,
      filters: [
        {
          name: "Excel Files",
          extensions: ["xlsx"],
        },
      ],
    });

    // 사용자가 저장을 취소하지 않은 경우
    if (filePath) {
      // Tauri의 writeFile을 사용해서 파일 저장
      await writeFile(filePath, new Uint8Array(buffer));
    }
  } catch (error: any) {
    console.error("Excel 파일 생성 중 오류:", error);
    alert("Excel 파일 생성 중 오류가 발생했습니다: " + error.message);
  }
}

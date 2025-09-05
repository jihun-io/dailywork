import ExcelJS from "exceljs";
import { DailyWorkData } from "../types/dailyWork";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { normalizeDate } from "../utils/dateUtils";
import { generateFileName } from "../utils/fileNameUtils.ts";
import { calculateRowHeight } from "../utils/textMeasurer";

export async function generateExcelFile(data: DailyWorkData) {
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

    // 셀 값 업데이트 (스타일은 보존)
    const updateCellValue = (cellAddress: string, value: string) => {
      const cell = worksheet.getCell(cellAddress);
      cell.value = value;
    };

    // 셀 높이 업데이트 함수 추가
    const updateRowHeight = (rowNumber: number, height: number) => {
      const row = worksheet.getRow(rowNumber);
      row.height = height;
    };

    // 기본 정보 채우기
    updateCellValue("C4", formatDate(data.date));
    updateCellValue(
      "E4",
      `${data.startTime} ~ ${data.endTime}${data.halfDay ? " (반차)" : data.oasis ? " (오아시스)" : ""}`,
    );
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

      // 텍스트 길이에 따라 행 높이 동적 조정
      let descriptionHeight: number | null = null;
      let notesHeight: number | null = null;
      if (task.description && task.description.trim() !== "") {
        // B열의 대략적인 너비 (픽셀) - Excel에서 실제 측정값에 기반
        const cellWidth = 280; // B열 너비 (조정 가능)
        const calculatedHeight = calculateRowHeight(
          task.description,
          cellWidth,
        );

        descriptionHeight = calculatedHeight;
      }

      if (task.notes && task.notes.trim() !== "") {
        const cellWidth = 214; // E열 너비 (조정 가능)
        const calculatedHeight = calculateRowHeight(task.notes, cellWidth);

        notesHeight = calculatedHeight;
      }

      if (descriptionHeight || notesHeight) {
        const finalHeight = Math.max(
          descriptionHeight || 0,
          notesHeight || 0,
          15, // 최소 행 높이
        );

        if (finalHeight > 33.75) updateRowHeight(row, finalHeight);
      }
    });

    // 특이사항 입력
    updateCellValue("B17", data.specialNotes);

    // 파일을 Buffer로 변환
    const buffer = await workbook.xlsx.writeBuffer();

    // 기본 파일명 생성 - 커스텀 파일명이 있으면 사용, 없으면 기본값
    const defaultFilename = generateFileName({
      dateStr: data.date,
      username: data.name,
    });

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

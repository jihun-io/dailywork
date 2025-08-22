import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { DailyWorkData } from "../types/dailyWork";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";

export async function generatePDFFile(
  data: DailyWorkData,
  contentRef: React.RefObject<HTMLDivElement | null>
) {
  try {
    const element = contentRef.current;
    if (!element) {
      throw new Error("콘텐츠 영역을 찾을 수 없습니다.");
    }

    // 폰트 로딩 대기
    await document.fonts.ready;

    // 임시 컨테이너 생성 (원본 영향 없이 스타일 적용)
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.fontFamily = '"Pretendard Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    tempContainer.style.fontSize = '14px';
    tempContainer.style.lineHeight = '1.5';
    tempContainer.style.color = '#000000';
    
    // 원본 요소 복제
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // 복제된 요소에 PDF용 스타일 적용
    const pdfStyle = document.createElement("style");
    pdfStyle.innerHTML = `
      .pdf-container * {
        font-family: "Pretendard Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        box-sizing: border-box !important;
      }
      
      .pdf-container {
        background: #ffffff !important;
        padding: 20px !important;
        width: 794px !important;
        min-height: 1123px !important; /* A4 height */
      }
      
      .pdf-container .fui-Button,
      .pdf-container [role="button"],
      .pdf-container button,
      .pdf-container .no-print {
        display: none !important;
      }
      
      .pdf-container input[placeholder]:placeholder-shown,
      .pdf-container textarea[placeholder]:placeholder-shown {
        color: transparent !important;
      }
      
      .pdf-container input,
      .pdf-container textarea {
        border: 1px solid #e1e1e1 !important;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: inherit !important;
      }
      
      .pdf-container .fui-Checkbox {
        display: inline-flex !important;
      }
      
      .pdf-container .fui-Card {
        background: #ffffff !important;
        border: 1px solid #e1e1e1 !important;
        box-shadow: none !important;
      }
      
      /* Fluent UI 토큰 오버라이드 */
      .pdf-container [class*="colorNeutralBackground"],
      .pdf-container [class*="colorSubtleBackground"] {
        background-color: #ffffff !important;
      }
      
      .pdf-container [class*="colorBrandForeground"] {
        color: #0078d4 !important;
      }
      
      .pdf-container [class*="colorNeutralForeground"] {
        color: #000000 !important;
      }
    `;
    
    tempContainer.className = 'pdf-container';
    tempContainer.appendChild(clonedElement);
    document.head.appendChild(pdfStyle);
    document.body.appendChild(tempContainer);

    // 레이아웃 안정화를 위한 대기
    await new Promise(resolve => setTimeout(resolve, 300));

    // html2canvas로 화면 캡처 (최적화된 옵션)
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      width: 794,
      height: tempContainer.scrollHeight,
      logging: false,
      foreignObjectRendering: true,
      imageTimeout: 15000,
      removeContainer: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      windowHeight: tempContainer.scrollHeight,
    });

    // 임시 요소들 정리
    document.body.removeChild(tempContainer);
    document.head.removeChild(pdfStyle);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210; // A4 가로 길이 (mm)
    const pdfHeight = 297; // A4 세로 길이 (mm)
    const imgWidth = pdfWidth - 20; // 좌우 여백 10mm씩
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // 상단 여백 10mm

    // 첫 번째 페이지
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20; // 상하 여백 20mm 제외

    // 추가 페이지가 필요한 경우
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;
    }

    // 날짜 포맷팅
    const formatDate = (dateStr: string) => {
      const [year, month, day] = dateStr.replaceAll(" ", "").split(".");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    // 파일명 생성 (날짜 기반)
    const defaultFilename = `일일업무일지_${data.name}_${formatDate(data.date)}.pdf`;

    // 사용자에게 저장 위치 선택하게 하기
    const filePath = await save({
      title: "PDF 파일 저장",
      defaultPath: defaultFilename,
      filters: [
        {
          name: "PDF",
          extensions: ["pdf"],
        },
      ],
    });

    if (filePath) {
      // PDF를 ArrayBuffer로 변환
      const pdfBuffer = pdf.output("arraybuffer");
      const uint8Array = new Uint8Array(pdfBuffer);

      // 파일 저장
      await writeFile(filePath, uint8Array);
    }
  } catch (error) {
    console.error("PDF 파일 생성 중 오류:", error);
    throw error;
  }
}

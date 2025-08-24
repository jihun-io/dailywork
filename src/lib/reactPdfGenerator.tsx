import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { DailyWorkData } from "../types/dailyWork";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { normalizeDate, formatDateToKorean } from "../utils/dateUtils";

// 한글 폰트 등록
Font.register({
  family: "Pretendard",
  fonts: [
    {
      src: "/Pretendard-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/Pretendard-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: "20mm",
    paddingVertical: "15mm",
    fontFamily: "Pretendard",
    fontSize: 10,
    color: "#000000",
  },
  header: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    border: "1px solid #e9ecef",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#0066cc",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 12,
  },
  infoLabel: {
    fontWeight: "bold",
    minWidth: 60,
  },
  infoValue: {
    flex: 1,
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
    backgroundColor: "#f1f3f4",
    padding: 8,
    borderRadius: 4,
  },
  taskCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskNumberWrapper: {
    width: 24,
    height: 24,
    backgroundColor: "#0066cc",
    color: "#ffffff",
    borderRadius: 12,
    textAlign: "center",
    marginRight: 10,
    fontSize: 10,
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  taskNumber: {
    fontSize: 10,
    fontWeight: "bold",
  },
  taskNumberCompleted: {
    backgroundColor: "#28a745",
  },
  taskDescription: {
    flex: 1,
    fontSize: 11,
  },
  taskStatus: {
    fontSize: 9,
    color: "#666666",
  },
  taskNotes: {
    marginTop: 6,
    fontSize: 9,
    color: "#666666",
    backgroundColor: "#f8f9fa",
    padding: 6,
    borderRadius: 3,
  },
  specialNotes: {
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: 6,
    padding: 12,
  },
  specialNotesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#856404",
  },
  specialNotesContent: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#856404",
  },
  timeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  timeInfo: {
    textAlign: "center",
  },
  timeLabel: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 3,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginVertical: 15,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: "center",
    fontSize: 8,
    color: "#999999",
  },
});

// PDF 문서 컴포넌트
const DailyWorkPDF: React.FC<{ data: DailyWorkData }> = ({ data }) => {
  const completedTasks = data.tasks.filter((task) => task.completed).length;
  const totalTasks = data.tasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 정보 */}
        <View style={styles.header}>
          <Text style={styles.title}>일일 업무 일지</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>작성일:</Text>
            <Text style={styles.infoValue}>{formatDateToKorean(normalizeDate(data.date))}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>성명:</Text>
            <Text style={styles.infoValue}>{data.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>부서:</Text>
            <Text style={styles.infoValue}>{data.department}</Text>
          </View>
        </View>

        {/* 근무 시간 정보 */}
        <View style={styles.timeSection}>
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>시작 시간</Text>
            <Text style={styles.timeValue}>{data.startTime}</Text>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>종료 시간</Text>
            <Text style={styles.timeValue}>{data.endTime}{data.halfDay ? ' (반차)' : data.oasis ? ' (오아시스)' : ''}</Text>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>완료율</Text>
            <Text style={styles.timeValue}>{completionRate}%</Text>
          </View>
        </View>

        {/* 업무 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            업무 목록 ({completedTasks}/{totalTasks} 완료)
          </Text>

          {data.tasks.map((task, index) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View
                  style={
                    task.completed
                      ? [styles.taskNumberWrapper, styles.taskNumberCompleted]
                      : styles.taskNumberWrapper
                  }
                >
                  <Text>{index + 1}</Text>
                </View>
                <Text style={styles.taskDescription}>
                  {task.description || "업무 내용이 입력되지 않았습니다."}
                </Text>
                <Text style={styles.taskStatus}>
                  {task.completed ? "✓ 완료" : "○ 진행 중"}
                </Text>
              </View>

              {task.notes && (
                <View style={styles.taskNotes}>
                  <Text>{task.notes}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 특이사항 */}
        {data.specialNotes && (
          <View style={styles.section}>
            <View style={styles.specialNotes}>
              <Text style={styles.specialNotesTitle}>특이사항</Text>
              <Text style={styles.specialNotesContent}>
                {data.specialNotes}
              </Text>
            </View>
          </View>
        )}

        {/* 푸터 */}
        <Text style={styles.footer}>
          {new Date().toLocaleString("ko-KR")} | dailywork
        </Text>
      </Page>
    </Document>
  );
};

// PDF 생성 및 저장 함수
export async function generateReactPDF(data: DailyWorkData) {
  try {
    // PDF 문서 생성
    const doc = <DailyWorkPDF data={data} />;
    const pdfBlob = await pdf(doc).toBlob();

    // 파일명 생성 - 날짜를 YYYY-MM-DD 형식으로 정규화
    const normalizedDate = normalizeDate(data.date);
    const defaultFilename = `일일업무일지_${data.name}_${normalizedDate}.pdf`;

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
      // Blob을 ArrayBuffer로 변환
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // 파일 저장
      await writeFile(filePath, uint8Array);
      return true;
    }

    return false;
  } catch (error) {
    console.error("React PDF 생성 중 오류:", error);
    throw error;
  }
}

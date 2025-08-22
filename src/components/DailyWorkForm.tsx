import { useState, useEffect } from "react";
import {
  FluentProvider,
  webLightTheme,
  Card,
  Text,
  Button,
  Input,
  Field,
  Textarea,
  Checkbox,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Add20Regular,
  Subtract20Regular,
  Clock20Regular,
  Save20Regular,
} from "@fluentui/react-icons";
import { DailyWorkData, WorkTask } from "../types/dailyWork";
import { generateExcelFile } from "../lib/excelGenerator";
import { saveUserInfo, loadUserInfo, UserInfo } from "../lib/autoFill";

function handleRightClick(e: React.MouseEvent) {
  if (
    (e.target as HTMLElement).tagName !== "INPUT" &&
    (e.target as HTMLElement).tagName !== "TEXTAREA"
  ) {
    e.preventDefault();
  }
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    margin: "0 auto",
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: "hidden",
    userSelect: "none",
    cursor: "default",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalXL}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow2,
    zIndex: 10,
  },
  title: {
    fontSize: tokens.fontSizeHero900,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
    margin: 0,
    lineHeight: tokens.lineHeightHero900,
  },
  saveButton: {
    minWidth: "160px",
  },
  content: {
    flex: 1,
    overflow: "auto",
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
    backgroundColor: tokens.colorNeutralBackground2,
    "@media (max-width: 768px)": {
      padding: tokens.spacingHorizontalM,
    },
  },
  card: {
    marginBottom: tokens.spacingVerticalXL,
    boxShadow: tokens.shadow4,
    border: "none",
    borderRadius: tokens.borderRadiusLarge,
    overflow: "hidden",
  },
  cardHeader: {
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXL}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  cardContent: {
    padding: tokens.spacingHorizontalXL,
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    margin: 0,
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
      gap: tokens.spacingHorizontalM,
    },
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  taskContainer: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  taskCard: {
    position: "relative",
    padding: tokens.spacingHorizontalL,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow2,
    transition: "all 0.2s ease-in-out",
  },
  taskCardHover: {
    boxShadow: tokens.shadow8,
    border: `1px solid ${tokens.colorBrandStroke1}`,
  },
  taskCardCompleted: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    border: `1px solid ${tokens.colorPaletteGreenBorder1}`,
  },
  removeButton: {
    position: "absolute",
    top: tokens.spacingVerticalS,
    right: tokens.spacingHorizontalS,
    minWidth: "32px",
    height: "32px",
  },
  taskFieldContainer: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    marginTop: tokens.spacingVerticalS,
  },
  taskBottomSection: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: tokens.spacingHorizontalL,
    alignItems: "start",
    marginTop: tokens.spacingVerticalM,
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
      gap: tokens.spacingVerticalM,
    },
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "flex-start",
    paddingTop: "6px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
  },
  addTaskButton: {
    minWidth: "140px",
  },
  userInfoSection: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: tokens.spacingVerticalL,
    paddingTop: tokens.spacingVerticalM,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  specialNotesField: {
    "& textarea": {
      minHeight: "120px",
      fontFamily: tokens.fontFamilyBase,
      lineHeight: tokens.lineHeightBase300,
    },
  },
});

export default function DailyWorkForm() {
  const styles = useStyles();
  const [formData, setFormData] = useState<DailyWorkData>({
    date: new Date().toISOString().split("T")[0],
    name: "",
    department: "",
    workTimeRange: "09:00 ~ 18:00",
    tasks: [
      {
        id: "1",
        description: "",
        completed: false,
        notes: "",
      },
    ],
    specialNotes: "",
  });

  useEffect(() => {
    const userInfo = loadUserInfo();
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        name: userInfo.name,
        department: userInfo.department,
        workTimeRange: userInfo.workTimeRange,
      }));
    }
  }, []);

  const addTask = () => {
    const newTask: WorkTask = {
      id: Date.now().toString(),
      description: "",
      completed: false,
      notes: "",
    };
    setFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const removeTask = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  };

  const updateTask = (id: string, updates: Partial<WorkTask>) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  };

  const handleSaveUserInfo = () => {
    const userInfo: UserInfo = {
      name: formData.name,
      department: formData.department,
      workTimeRange: formData.workTimeRange,
    };
    saveUserInfo(userInfo);
    alert("사용자 정보가 저장되었습니다!");
  };

  const handleExportExcel = async () => {
    try {
      await generateExcelFile(formData);
    } catch (error) {
      console.error("엑셀 파일 생성 중 오류:", error);
      alert("엑셀 파일 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.container} onContextMenu={handleRightClick}>
        <header className={styles.header}>
          <Text as="h1" className={styles.title}>
            dailywork
          </Text>
          <Button
            appearance="primary"
            size="large"
            icon={<Save20Regular />}
            onClick={handleExportExcel}
            className={styles.saveButton}
          >
            엑셀 파일로 저장
          </Button>
        </header>

        <main className={styles.content}>
          <Card className={styles.card} appearance="filled">
            <div className={styles.cardHeader}>
              <Text className={styles.sectionTitle}>기본 정보</Text>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.gridContainer}>
                <Field label="작성일자">
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    size="large"
                  />
                </Field>
                <Field label="근무시간">
                  <Input
                    placeholder="09:00 ~ 18:00"
                    value={formData.workTimeRange}
                    contentBefore={<Clock20Regular />}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        workTimeRange: e.target.value,
                      }))
                    }
                    size="large"
                  />
                </Field>
                <Field label="부서명">
                  <Input
                    placeholder="부서명을 입력하세요"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    size="large"
                  />
                </Field>
                <Field label="작성자">
                  <Input
                    placeholder="이름을 입력하세요"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    size="large"
                  />
                </Field>
              </div>

              <div className={styles.userInfoSection}>
                <Button
                  appearance="subtle"
                  icon={<Save20Regular />}
                  onClick={handleSaveUserInfo}
                >
                  사용자 정보 저장
                </Button>
              </div>
            </div>
          </Card>

          <Card className={styles.card} appearance="filled">
            <div className={styles.cardHeader}>
              <Text className={styles.sectionTitle}>업무 내용</Text>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.taskContainer}>
                {formData.tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`${styles.taskCard} ${
                      task.completed ? styles.taskCardCompleted : ""
                    }`}
                  >
                    {formData.tasks.length > 1 && (
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Subtract20Regular />}
                        onClick={() => removeTask(task.id)}
                        className={styles.removeButton}
                        title="업무 항목 삭제"
                      />
                    )}

                    <div className={styles.taskFieldContainer}>
                      <Field label={`업무 ${index + 1}`}>
                        <Input
                          placeholder="수행한 업무 내용을 입력하세요"
                          value={task.description}
                          onChange={(e) =>
                            updateTask(task.id, { description: e.target.value })
                          }
                          size="large"
                        />
                      </Field>

                      <div className={styles.taskBottomSection}>
                        <Field label="비고 (진행상황 또는 이슈사항)">
                          <Input
                            placeholder="진행상황, 이슈사항 등을 입력하세요"
                            value={task.notes}
                            onChange={(e) =>
                              updateTask(task.id, { notes: e.target.value })
                            }
                            size="large"
                          />
                        </Field>
                        <div className={styles.checkboxContainer}>
                          <Checkbox
                            checked={task.completed}
                            onChange={(_, data) =>
                              updateTask(task.id, { completed: !!data.checked })
                            }
                            label="완료됨"
                            size="large"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.buttonContainer}>
                <Button
                  appearance="primary"
                  icon={<Add20Regular />}
                  onClick={addTask}
                  className={styles.addTaskButton}
                  size="large"
                >
                  업무 항목 추가
                </Button>
              </div>
            </div>
          </Card>

          <Card className={styles.card} appearance="filled">
            <div className={styles.cardHeader}>
              <Text className={styles.sectionTitle}>특이사항</Text>
            </div>
            <div className={styles.cardContent}>
              <Field
                label="특이사항 (신규 발생 업무 또는 이슈사항 등)"
                hint="업무 중 발생한 특별한 사항이나 이슈를 작성해주세요"
              >
                <Textarea
                  rows={6}
                  placeholder="신규 발생 업무, 이슈사항, 특별한 사항 등을 작성하세요..."
                  value={formData.specialNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      specialNotes: e.target.value,
                    }))
                  }
                  className={styles.specialNotesField}
                  resize="vertical"
                />
              </Field>
            </div>
          </Card>
        </main>
      </div>
    </FluentProvider>
  );
}

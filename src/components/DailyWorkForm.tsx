import { useState, useEffect, useRef } from "react";
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
  Spinner,
  Tooltip,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuButton,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from "@fluentui/react-components";
import {
  Add20Regular,
  Clock20Regular,
  Person20Regular,
  Building20Regular,
  Calendar20Regular,
  Info20Regular,
  CheckmarkCircle20Filled,
  Dismiss20Regular,
  TaskListSquareLtr20Regular,
  Settings20Regular,
  Copy20Regular,
  ArrowUp20Regular,
  ArrowDown20Regular,
  DocumentPdf20Regular,
  ChevronDown16Regular,
  Save20Regular,
  DocumentTable20Regular,
} from "@fluentui/react-icons";
import { DailyWorkData, WorkTask } from "../types/dailyWork";
import { generateExcelFile } from "../lib/excelGenerator";
import { generateReactPDF } from "../lib/reactPdfGenerator";
import { saveUserInfo, loadUserInfo, UserInfo } from "../lib/autoFill";

// 우클릭 방지 핸들러
function handleRightClick(e: React.MouseEvent) {
  // input 및 textarea 요소에서는 우클릭을 허용
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
    backgroundColor: tokens.colorNeutralBackground3,
    overflow: "hidden",
    userSelect: "none",
    cursor: "default",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXXL}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow4,
    zIndex: 10,
    backdropFilter: "blur(8px)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  title: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
    margin: 0,
    lineHeight: tokens.lineHeightHero800,
    letterSpacing: "-0.02em",
  },
  headerActions: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    alignItems: "center",
  },
  saveButton: {
    minWidth: "auto",
    boxShadow: tokens.shadow2,
    alignItems: "center",
  },
  content: {
    flex: 1,
    overflow: "auto",
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
    backgroundColor: tokens.colorNeutralBackground3,
    overscrollBehaviorY: "contain",
  },
  card: {
    marginBottom: tokens.spacingVerticalXL,
    boxShadow: tokens.shadow8,
    border: "none",
    borderRadius: tokens.borderRadiusXLarge,
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  cardHeader: {
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXL}`,
    backgroundColor: tokens.colorSubtleBackground,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXL}`,
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  flexContainer: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
    marginBottom: tokens.spacingVerticalXXL,
  },
  firstRow: {
    display: "flex",
    gap: tokens.spacingHorizontalXL,
    alignItems: "start",
  },
  dateField: {
    flex: 1,
  },
  timeField: {
    flexShrink: 0,
    width: "fit-content",
    minWidth: "120px",
  },
  secondRow: {
    display: "flex",
    gap: tokens.spacingHorizontalXL,
    flexWrap: "wrap",
    rowGap: tokens.spacingVerticalXL,
  },
  equalField: {
    flex: 1,
    minWidth: "250px",
  },
  flexibleInput: {
    minWidth: "0 !important",
    width: "100%",
    "& .fui-Input": {
      minWidth: "0 !important",
      width: "100%",
    },
    "& .fui-Input__input": {
      minWidth: "0 !important",
      width: "100%",
    },
  },
  enhancedField: {
    position: "relative",
    "&:focus-within": {
      "& .field-icon": {
        color: tokens.colorBrandForeground1,
      },
    },
  },
  taskContainer: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
  },
  taskCard: {
    position: "relative",
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `2px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow4,
    transition: "all 0.3s ease-out",
    "&:focus-within": {
      border: `2px solid ${tokens.colorBrandForeground1}`,
      boxShadow: `${tokens.shadow8}, 0 0 0 2px ${tokens.colorBrandBackground2}`,
    },
  },
  taskCardCompleted: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    border: `2px solid ${tokens.colorPaletteGreenForeground3}`,
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      backgroundColor: tokens.colorPaletteGreenBackground3,
      borderRadius: `${tokens.borderRadiusLarge} ${tokens.borderRadiusLarge} 0 0`,
    },
  },
  taskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: tokens.spacingVerticalS,
  },
  taskNumber: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    transition: "all 0.2s ease-out",
  },
  taskNumberCompleted: {
    backgroundColor: tokens.colorPaletteGreenForeground3,
  },
  taskActions: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
  },
  taskButton: {
    minWidth: "32px",
    height: "32px",
    borderRadius: "50%",
  },
  taskFieldContainer: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  taskBottomSection: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: tokens.spacingHorizontalXL,
    alignItems: "end",
    marginTop: tokens.spacingVerticalL,
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorSubtleBackground,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    minWidth: "140px",
    transition: "all 0.2s ease-out",
    "&:hover": {
      backgroundColor: tokens.colorSubtleBackgroundHover,
    },
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalXXL,
    paddingTop: tokens.spacingVerticalXL,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  addTaskButton: {
    minWidth: "200px",
    boxShadow: tokens.shadow4,
    transition: "all 0.2s ease-out",
    "&:hover": {
      boxShadow: tokens.shadow8,
    },
  },
  specialNotesField: {
    "& textarea": {
      minHeight: "160px",
      fontFamily: tokens.fontFamilyBase,
      lineHeight: tokens.lineHeightBase400,
      resize: "vertical",
    },
  },
  timeRangeContainer: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: tokens.spacingHorizontalL,
    "& .fui-Input": {
      minWidth: "0 !important",
      width: "100%",
    },
    "& .fui-Input__input": {
      minWidth: "0 !important",
      width: "100%",
    },
    "& input": {
      minWidth: "0 !important",
      width: "100%",
    },
  },
});

export default function DailyWorkForm() {
  const styles = useStyles();
  const contentRef = useRef<HTMLDivElement>(null);
  const departmentInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<DailyWorkData>({
    date: new Date().toLocaleDateString("ko-KR"),
    name: "",
    department: "",
    startTime: "09:00",
    endTime: "18:00",
    halfDay: false,
    oasis: false,
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

  const [isLoading, setIsLoading] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  // 작업 통계 계산 (사이드바 제거로 현재 사용되지 않음)
  // const taskStats = {
  //   total: formData.tasks.length,
  //   completed: formData.tasks.filter(task => task.completed).length,
  //   pending: formData.tasks.filter(task => !task.completed).length,
  //   completionRate: formData.tasks.length > 0
  //     ? Math.round((formData.tasks.filter(task => task.completed).length / formData.tasks.length) * 100)
  //     : 0
  // };

  useEffect(() => {
    const userInfo = loadUserInfo();
    if (userInfo) {
      // 기존 workTimeRange가 있으면 시작/종료 시간으로 분리
      let startTime = "09:00";
      let endTime = "18:00";

      if (userInfo.workTimeRange) {
        const timeMatch = userInfo.workTimeRange.match(
          /(\d{2}:\d{2})\s*~\s*(\d{2}:\d{2})/
        );
        if (timeMatch) {
          startTime = timeMatch[1];
          endTime = timeMatch[2];
        }
      }

      setFormData((prev) => ({
        ...prev,
        name: userInfo.name,
        department: userInfo.department,
        startTime,
        endTime,
      }));
    }
  }, []);

  const moveTask = (id: string, direction: "up" | "down") => {
    const taskIndex = formData.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) return;

    const newIndex = direction === "up" ? taskIndex - 1 : taskIndex + 1;
    if (newIndex < 0 || newIndex >= formData.tasks.length) return;

    const newTasks = [...formData.tasks];
    [newTasks[taskIndex], newTasks[newIndex]] = [
      newTasks[newIndex],
      newTasks[taskIndex],
    ];

    setFormData((prev) => ({ ...prev, tasks: newTasks }));
  };

  const duplicateTask = (id: string) => {
    const taskToDuplicate = formData.tasks.find((task) => task.id === id);
    if (!taskToDuplicate) return;

    const newTask: WorkTask = {
      ...taskToDuplicate,
      id: Date.now().toString(),
      completed: false,
    };

    setFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const addTask = () => {
    if (formData.tasks.length >= 8) {
      alert("업무는 최대 8개까지 추가할 수 있습니다.");
      return;
    }

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
      workTimeRange: `${formData.startTime} ~ ${formData.endTime}`, // time 필드를 문자열로 변환
    };
    saveUserInfo(userInfo);
  };

  const openModalWithDepartmentFocus = () => {
    setUserDialogOpen(true);
    // 모달이 열린 후 포커스를 주기 위해 약간의 지연 필요
    setTimeout(() => {
      departmentInputRef.current?.focus();
    }, 100);
  };

  const openModalWithNameFocus = () => {
    setUserDialogOpen(true);
    // 모달이 열린 후 포커스를 주기 위해 약간의 지연 필요
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      await generateExcelFile(formData);
    } catch (error) {
      console.error("엑셀 파일 생성 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReactPDF = async () => {
    setIsLoading(true);
    try {
      await generateReactPDF(formData);
    } catch (error) {
      console.error("React PDF 파일 생성 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.container} onContextMenu={handleRightClick}>
        {/* 메인 콘텐츠 */}
        <div className={styles.mainContent}>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <Text className={styles.title}>dailywork</Text>
            </div>
            <div className={styles.headerActions}>
              {isLoading && <Spinner size="small" />}

              {/* 사용자 정보 모달 */}
              <Dialog
                open={userDialogOpen}
                onOpenChange={(_, data) => setUserDialogOpen(data.open)}
              >
                <DialogTrigger disableButtonEnhancement>
                  <Tooltip content="사용자 정보 설정" relationship="label">
                    <Button
                      appearance="subtle"
                      size="large"
                      icon={<Settings20Regular />}
                    >
                      설정
                    </Button>
                  </Tooltip>
                </DialogTrigger>
                <DialogSurface>
                  <DialogBody>
                    <DialogTitle>사용자 정보 설정</DialogTitle>
                    <DialogContent>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: tokens.spacingVerticalL,
                        }}
                      >
                        <Field label="작성자" required>
                          <Input
                            ref={nameInputRef}
                            placeholder="이름을 입력하세요"
                            value={formData.name}
                            contentBefore={<Person20Regular />}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            size="large"
                          />
                        </Field>
                        <Field label="부서명" required>
                          <Input
                            ref={departmentInputRef}
                            placeholder="부서명을 입력하세요"
                            value={formData.department}
                            contentBefore={<Building20Regular />}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                department: e.target.value,
                              }))
                            }
                            size="large"
                          />
                        </Field>
                      </div>
                    </DialogContent>
                    <DialogActions>
                      <DialogTrigger disableButtonEnhancement>
                        <Button appearance="secondary">취소</Button>
                      </DialogTrigger>
                      <Button
                        appearance="primary"
                        onClick={() => {
                          handleSaveUserInfo();
                          setUserDialogOpen(false);
                        }}
                      >
                        저장
                      </Button>
                    </DialogActions>
                  </DialogBody>
                </DialogSurface>
              </Dialog>

              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <MenuButton
                    appearance="primary"
                    size="large"
                    icon={<Save20Regular />}
                    menuIcon={
                      <ChevronDown16Regular style={{ display: "block" }} />
                    }
                    className={styles.saveButton}
                    disabled={isLoading}
                  >
                    {isLoading ? "저장 중..." : "저장"}
                  </MenuButton>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem
                      icon={<DocumentPdf20Regular />}
                      onClick={handleExportReactPDF}
                      disabled={isLoading}
                    >
                      PDF로 내보내기
                    </MenuItem>
                    <MenuItem
                      icon={<DocumentTable20Regular />}
                      onClick={handleExportExcel}
                      disabled={isLoading}
                    >
                      엑셀 파일 저장
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </div>
          </header>

          <main className={styles.content} ref={contentRef}>
            {/* 기본 정보 카드 */}
            <Card className={styles.card}>
              <div className={styles.cardHeader}>
                <Text className={styles.sectionTitle}>
                  <Calendar20Regular />
                  기본 정보
                </Text>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.flexContainer}>
                  <div className={styles.secondRow}>
                    <div
                      className={`${styles.enhancedField} ${styles.equalField}`}
                    >
                      <Field label="부서명" required>
                        <Input
                          placeholder="클릭하여 설정하세요"
                          value={formData.department}
                          contentBefore={
                            <Building20Regular className="field-icon" />
                          }
                          size="large"
                          readOnly
                          tabIndex={-1}
                          onClick={openModalWithDepartmentFocus}
                          className={styles.flexibleInput}
                        />
                      </Field>
                    </div>
                    <div
                      className={`${styles.enhancedField} ${styles.equalField}`}
                    >
                      <Field label="작성자" required>
                        <Input
                          placeholder="클릭하여 설정하세요"
                          value={formData.name}
                          contentBefore={
                            <Person20Regular className="field-icon" />
                          }
                          size="large"
                          readOnly
                          tabIndex={-1}
                          onClick={openModalWithNameFocus}
                          className={styles.flexibleInput}
                        />
                      </Field>
                    </div>
                  </div>
                  <div className={styles.firstRow}>
                    <div
                      className={`${styles.enhancedField} ${styles.dateField}`}
                    >
                      <Field label="작성일자" required>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          size="large"
                          contentBefore={
                            <Calendar20Regular className="field-icon" />
                          }
                        />
                      </Field>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: tokens.spacingVerticalM,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: tokens.spacingHorizontalL,
                        }}
                      >
                        <div
                          className={`${styles.enhancedField} ${styles.timeField}`}
                        >
                          <Field label="시작 시간" required>
                            <Input
                              type="time"
                              value={formData.startTime}
                              contentBefore={
                                <Clock20Regular className="field-icon" />
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  startTime: e.target.value,
                                }))
                              }
                              size="large"
                            />
                          </Field>
                        </div>
                        <div
                          className={`${styles.enhancedField} ${styles.timeField}`}
                        >
                          <Field label="종료 시간" required>
                            <Input
                              type="time"
                              value={formData.endTime}
                              contentBefore={
                                <Clock20Regular className="field-icon" />
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  endTime: e.target.value,
                                }))
                              }
                              size="large"
                            />
                          </Field>
                        </div>
                      </div>
                      <div
                        style={{ display: "flex", justifyContent: "end" }}
                      >
                        <Checkbox
                          checked={formData.halfDay}
                          onChange={(_, data) =>
                            setFormData((prev) => ({
                              ...prev,
                              halfDay: !!data.checked,
                              oasis: !!data.checked ? false : prev.oasis
                            }))
                          }
                          label="반차"
                          size="large"
                        />
                        <Checkbox
                          checked={formData.oasis}
                          onChange={(_, data) =>
                            setFormData((prev) => ({
                              ...prev,
                              oasis: !!data.checked,
                              halfDay: !!data.checked ? false : prev.halfDay
                            }))
                          }
                          label="오아시스"
                          size="large"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 업무 내용 카드 */}
            <Card className={styles.card}>
              <div className={styles.cardHeader}>
                <Text className={styles.sectionTitle}>
                  <TaskListSquareLtr20Regular />
                  업무 내용
                </Text>
                <Button
                  appearance="subtle"
                  icon={<Add20Regular />}
                  onClick={addTask}
                  size="small"
                />
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
                      <div className={styles.taskHeader}>
                        <div
                          className={`${styles.taskNumber} ${
                            task.completed ? styles.taskNumberCompleted : ""
                          }`}
                        >
                          {task.completed ? (
                            <CheckmarkCircle20Filled />
                          ) : (
                            index + 1
                          )}
                        </div>

                        <div className={styles.taskActions}>
                          {index > 0 && (
                            <Tooltip content="위로 이동" relationship="label">
                              <Button
                                appearance="subtle"
                                size="small"
                                icon={<ArrowUp20Regular />}
                                onClick={() => moveTask(task.id, "up")}
                                className={styles.taskButton}
                              />
                            </Tooltip>
                          )}
                          {index < formData.tasks.length - 1 && (
                            <Tooltip content="아래로 이동" relationship="label">
                              <Button
                                appearance="subtle"
                                size="small"
                                icon={<ArrowDown20Regular />}
                                onClick={() => moveTask(task.id, "down")}
                                className={styles.taskButton}
                              />
                            </Tooltip>
                          )}
                          <Tooltip content="복사" relationship="label">
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={<Copy20Regular />}
                              onClick={() => duplicateTask(task.id)}
                              className={styles.taskButton}
                            />
                          </Tooltip>
                          {formData.tasks.length > 1 && (
                            <Tooltip content="삭제" relationship="label">
                              <Button
                                appearance="subtle"
                                size="small"
                                icon={<Dismiss20Regular />}
                                onClick={() => removeTask(task.id)}
                                className={styles.taskButton}
                              />
                            </Tooltip>
                          )}
                        </div>
                      </div>

                      <div className={styles.taskFieldContainer}>
                        <Field label={`업무 ${index + 1}`} required>
                          <Input
                            placeholder="수행한 업무 내용을 입력하세요"
                            value={task.description}
                            onChange={(e) =>
                              updateTask(task.id, {
                                description: e.target.value,
                              })
                            }
                            size="large"
                          />
                        </Field>

                        <div className={styles.taskBottomSection}>
                          <Field label="비고">
                            <Input
                              placeholder="진행상황, 이슈사항 등을 입력하세요"
                              value={task.notes}
                              onChange={(e) =>
                                updateTask(task.id, { notes: e.target.value })
                              }
                              size="large"
                            />
                          </Field>
                          <Checkbox
                            checked={task.completed}
                            onChange={(_, data) =>
                              updateTask(task.id, { completed: !!data.checked })
                            }
                            style={{ cursor: "default" }}
                            label="완료됨"
                            size="large"
                          />
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

            {/* 특이사항 카드 */}
            <Card className={styles.card}>
              <div className={styles.cardHeader}>
                <Text className={styles.sectionTitle}>
                  <Info20Regular />
                  특이사항
                </Text>
              </div>
              <div className={styles.cardContent}>
                <Field>
                  <Textarea
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
      </div>
    </FluentProvider>
  );
}

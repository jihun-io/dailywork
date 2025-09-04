import { useState, useEffect, useRef } from "react";
import {
  FluentProvider,
  webLightTheme,
  Spinner,
  MenuButton,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Button,
  Tooltip,
} from "@fluentui/react-components";
import {
  DocumentPdf20Regular,
  ChevronDown16Regular,
  Save20Regular,
  DocumentTable20Regular,
  FolderOpen20Regular,
  Settings20Regular,
  Edit20Regular,
  TextBulletListLtr20Regular,
} from "@fluentui/react-icons";
import { invoke } from "@tauri-apps/api/core";
import { DailyWorkData, WorkTask } from "../types/dailyWork";
import { generateExcelFile } from "../lib/excelGenerator";
import { generateReactPDF } from "../lib/reactPdfGenerator";
import { importExcelFile } from "../lib/excelImporter";
import { ask } from "@tauri-apps/plugin-dialog";
import { getCurrentDateISO } from "../utils/dateUtils";
import { IconLogo, TextLogo } from "./Logo";
import { useStyles } from "./styles/DailyWorkForm.styles";
import { tokens } from "@fluentui/react-components";
import {
  moveTask,
  duplicateTask,
  addTask,
  removeTask,
  updateTask,
} from "./utils/taskUtils";
import {
  handleRightClick,
  loadUserInfoToForm,
  saveUserInfoFromForm,
} from "./utils/userInfoUtils";
import { UserInfoDialog } from "./UserInfoDialog";
import { BasicInfoCard } from "./BasicInfoCard";
import { TaskCard } from "./TaskCard";
import { SpecialNotesCard } from "./SpecialNotesCard";
import { FileNameCustomizer } from "./FileNameCustomizer";
import { SaveConfirmDialog } from "./SaveConfirmDialog";
import { UpdateChecker } from "./UpdateChecker";

export default function DailyWorkForm() {
  const styles = useStyles();
  const contentRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<DailyWorkData>({
    date: getCurrentDateISO(),
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
  const [isImporting, setIsImporting] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [dialogFocusTarget, setDialogFocusTarget] = useState<
    "department" | "name" | undefined
  >();
  const [fileNameCustomizerOpen, setFileNameCustomizerOpen] = useState(false);
  const [pendingExportType, setPendingExportType] = useState<
    "pdf" | "excel" | null
  >(null);
  const [isModified, setIsModified] = useState(false);
  const [saveConfirmDialogOpen, setSaveConfirmDialogOpen] = useState(false);

  useEffect(() => {
    loadUserInfoToForm(setFormData);
  }, []);

  // isModified 상태가 변경될 때마다 Tauri로 상태 전달
  useEffect(() => {
    const updateModifiedState = async () => {
      try {
        await invoke("set_modified_state", { isModified });
      } catch (error) {
        console.error("수정 상태 업데이트 실패:", error);
      }
    };

    updateModifiedState();
  }, [isModified]);

  // 창 닫기 확인 이벤트 리스너
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupCloseListener = async () => {
      const { listen } = await import("@tauri-apps/api/event");

      unlisten = await listen("confirm-close", () => {
        setSaveConfirmDialogOpen(true);
      });
    };

    setupCloseListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const handleMoveTask = (id: string, direction: "up" | "down") => {
    const newTasks = moveTask(formData.tasks, id, direction);
    setFormData((prev) => ({ ...prev, tasks: newTasks }));
  };

  const handleDuplicateTask = (id: string) => {
    const newTasks = duplicateTask(formData.tasks, id);
    setFormData((prev) => ({ ...prev, tasks: newTasks }));
  };

  const handleAddTask = () => {
    const newTasks = addTask(formData.tasks);
    setFormData((prev) => ({ ...prev, tasks: newTasks }));
  };

  const handleRemoveTask = (id: string) => {
    const newTasks = removeTask(formData.tasks, id);
    setFormData((prev) => ({ ...prev, tasks: newTasks }));
  };

  const handleUpdateTask = (id: string, updates: Partial<WorkTask>) => {
    const newTasks = updateTask(formData.tasks, id, updates);
    setFormData((prev) => ({ ...prev, tasks: newTasks }));
    setIsModified(true);
  };

  const handleSaveUserInfo = () => {
    saveUserInfoFromForm(formData);
  };

  const openModalWithDepartmentFocus = () => {
    setDialogFocusTarget("department");
    setUserDialogOpen(true);
  };

  const openModalWithNameFocus = () => {
    setDialogFocusTarget("name");
    setUserDialogOpen(true);
  };

  const handleFormDataChange = (updates: Partial<DailyWorkData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setIsModified(true);
  };

  const handleExportExcel = async (customFilename?: string) => {
    setIsLoading(true);
    try {
      await generateExcelFile(formData, customFilename);
      setIsModified(false); // 저장 후 수정 상태 초기화
    } catch (error) {
      console.error("엑셀 파일 생성 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReactPDF = async (customFilename?: string) => {
    setIsLoading(true);
    try {
      await generateReactPDF(formData, customFilename);
      setIsModified(false); // 저장 후 수정 상태 초기화
    } catch (error) {
      console.error("React PDF 파일 생성 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportClick = (type: "pdf" | "excel") => {
    if (type === "pdf") {
      handleExportReactPDF();
    } else if (type === "excel") {
      handleExportExcel();
    }
  };

  const handleFileNameConfirm = (filename: string) => {
    if (pendingExportType === "pdf") {
      handleExportReactPDF(filename);
    } else if (pendingExportType === "excel") {
      handleExportExcel(filename);
    }

    setPendingExportType(null);
  };

  const handleFileNameSettings = () => {
    setPendingExportType(null); // 파일명 설정만 열기
    setFileNameCustomizerOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await generateExcelFile(formData);
      setIsModified(false); // 저장 완료 후 수정 상태 초기화
    } catch (error) {
      console.error("저장 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseWithoutSaving = async () => {
    try {
      await invoke("force_close_window");
    } catch (error) {
      console.error("창 닫기 실패:", error);
    }
  };

  const handleCancelClose = () => {
    // 아무것도 하지 않음 - 다이얼로그만 닫힘
  };

  const handleImportExcel = async () => {
    console.log("엑셀 파일 불러오기 시작");

    // 현재 폼에 데이터가 있는지 확인
    const hasExistingData =
      formData.tasks.some((task) => task.description.trim()) ||
      formData.specialNotes.trim();

    let shouldProceed = true;

    if (hasExistingData) {
      console.log("기존 데이터 존재, 사용자 확인 요청");
      shouldProceed = await ask(
        "새 파일을 불러오면 현재 내용이 사라집니다.\n" + "계속하시겠습니까?",
        {
          kind: "warning",
          okLabel: "열기",
          cancelLabel: "취소",
        },
      );
      console.log("사용자 확인 결과:", shouldProceed);
    }

    if (!shouldProceed) {
      console.log("사용자가 취소했습니다.");
      return;
    }

    console.log("파일 불러오기 진행");
    setIsImporting(true);
    try {
      const importedData = await importExcelFile();
      console.log("불러온 데이터:", importedData);
      if (importedData) {
        setFormData(importedData);
        setIsModified(false); // 파일 불러온 후 수정 상태 초기화
        console.log("폼 데이터 업데이트 완료");
      } else {
        console.log("불러온 데이터가 없습니다.");
      }
    } catch (error) {
      console.error("Excel 파일 불러오기 중 오류:", error);
    } finally {
      setIsImporting(false);
      console.log("파일 불러오기 완료");
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.container} onContextMenu={handleRightClick}>
        {/* 메인 콘텐츠 */}
        <div className={styles.mainContent}>
          <header className={styles.header}>
            <h1 className={styles.headerLeft}>
              <IconLogo height={40} />
              <TextLogo height={32} color={tokens.colorBrandForeground1} />
            </h1>
            <div className={styles.headerActions}>
              {(isLoading || isImporting) && <Spinner size="small" />}

              <UpdateChecker />

              <UserInfoDialog
                isOpen={userDialogOpen}
                onOpenChange={setUserDialogOpen}
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onSave={handleSaveUserInfo}
                focusTarget={dialogFocusTarget}
              />

              <FileNameCustomizer
                isOpen={fileNameCustomizerOpen}
                onOpenChange={setFileNameCustomizerOpen}
                onConfirm={handleFileNameConfirm}
                defaultExtension={
                  pendingExportType === "pdf"
                    ? ".pdf"
                    : pendingExportType === "excel"
                      ? ".xlsx"
                      : ".pdf"
                }
                formData={formData}
                title={
                  pendingExportType === "pdf"
                    ? "PDF"
                    : pendingExportType === "excel"
                      ? "엑셀"
                      : "파일명"
                }
                isSettingsMode={pendingExportType === null}
              />

              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Tooltip content="설정" relationship="label">
                    <MenuButton
                      appearance="subtle"
                      size="large"
                      icon={<Settings20Regular />}
                      menuIcon={
                        <ChevronDown16Regular style={{ display: "block" }} />
                      }
                      disabled={isLoading || isImporting}
                      aria-label="설정"
                    />
                  </Tooltip>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem
                      icon={<Edit20Regular />}
                      onClick={() => setUserDialogOpen(true)}
                      disabled={isLoading || isImporting}
                    >
                      사용자 정보 설정
                    </MenuItem>
                    <MenuItem
                      icon={<TextBulletListLtr20Regular />}
                      onClick={handleFileNameSettings}
                      disabled={isLoading || isImporting}
                    >
                      파일 이름 설정
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>

              <Tooltip content="열기" relationship="label">
                <Button
                  appearance="subtle"
                  size="large"
                  icon={<FolderOpen20Regular />}
                  onClick={handleImportExcel}
                  disabled={isLoading || isImporting}
                  data-test-id="open-button"
                  aria-label="열기"
                />
              </Tooltip>

              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Tooltip content="저장" relationship="label">
                    <MenuButton
                      appearance="primary"
                      size="large"
                      icon={<Save20Regular />}
                      menuIcon={
                        <ChevronDown16Regular style={{ display: "block" }} />
                      }
                      className={styles.saveButton}
                      disabled={isLoading || isImporting}
                      data-test-id="save-button"
                      aria-label="저장"
                    />
                  </Tooltip>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem
                      icon={<DocumentPdf20Regular />}
                      onClick={() => handleExportClick("pdf")}
                      disabled={isLoading || isImporting}
                    >
                      PDF로 내보내기
                    </MenuItem>
                    <MenuItem
                      icon={<DocumentTable20Regular />}
                      onClick={() => handleExportClick("excel")}
                      disabled={isLoading || isImporting}
                      data-test-id="export-excel-menuitem"
                    >
                      엑셀 파일 저장
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </div>
          </header>

          <main className={styles.content} ref={contentRef}>
            <BasicInfoCard
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onDepartmentClick={openModalWithDepartmentFocus}
              onNameClick={openModalWithNameFocus}
            />

            <TaskCard
              formData={formData}
              onAddTask={handleAddTask}
              onMoveTask={handleMoveTask}
              onDuplicateTask={handleDuplicateTask}
              onRemoveTask={handleRemoveTask}
              onUpdateTask={handleUpdateTask}
            />

            <SpecialNotesCard
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />
          </main>
        </div>

        {/* 저장 확인 다이얼로그 */}
        <SaveConfirmDialog
          isOpen={saveConfirmDialogOpen}
          onOpenChange={setSaveConfirmDialogOpen}
          onSave={handleSave}
          onCloseWithoutSaving={handleCloseWithoutSaving}
          onCancel={handleCancelClose}
        />
      </div>
    </FluentProvider>
  );
}

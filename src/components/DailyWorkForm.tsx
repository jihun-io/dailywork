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
} from "@fluentui/react-components";
import {
  DocumentPdf20Regular,
  ChevronDown16Regular,
  Save20Regular,
  DocumentTable20Regular,
  FolderOpen20Regular,
} from "@fluentui/react-icons";
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
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [dialogFocusTarget, setDialogFocusTarget] = useState<"department" | "name" | undefined>();

  useEffect(() => {
    loadUserInfoToForm(setFormData);
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
              <IconLogo height={40} />
              <TextLogo height={32} color={tokens.colorBrandForeground1} />
            </div>
            <div className={styles.headerActions}>
              {isLoading && <Spinner size="small" />}

              <UserInfoDialog
                isOpen={userDialogOpen}
                onOpenChange={setUserDialogOpen}
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onSave={handleSaveUserInfo}
                focusTarget={dialogFocusTarget}
              />

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
      </div>
    </FluentProvider>
  );
}

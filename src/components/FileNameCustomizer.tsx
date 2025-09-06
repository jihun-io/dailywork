import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  Button,
  Text,
  makeStyles,
  tokens,
  Radio,
  RadioGroup,
} from "@fluentui/react-components";
import { Add12Filled, Dismiss12Filled } from "@fluentui/react-icons";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DailyWorkData } from "../types/dailyWork";
import { normalizeDate } from "../utils/dateUtils";
import { FileNameFormat, FileNameBlock } from "../utils/fileNameUtils.ts";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  blockSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sectionTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
  },
  blocksContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    minHeight: "40px",
    padding: "8px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  block: {
    padding: "8px 12px",
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase200,
    userSelect: "none",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    position: "relative",
    "&:hover .add-button": {
      opacity: 1,
    },
  },
  addButton: {
    boxShadow: `0 2px 4px ${tokens.colorNeutralShadowKey}`,
    position: "absolute",
    top: "-10px",
    right: "-10px",
    width: "20px",
    height: "20px",
    padding: "0",
    borderRadius: "50%",
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    zIndex: 2,
    "&:hover": {
      backgroundColor: tokens.colorPaletteGreenBackground2,
    },
  },
  draggableBlock: {
    padding: "8px 12px",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    cursor: "grab",
    height: "32px",
    boxSizing: "border-box",
    position: "relative",
    "&:active": {
      cursor: "grabbing",
    },
    "&:hover .delete-button": {
      opacity: 1,
    },
  },
  deleteButton: {
    boxShadow: `0 2px 4px ${tokens.colorNeutralShadowKey}`,
    position: "absolute",
    top: "-10px",
    right: "-10px",
    width: "20px",
    height: "20px",
    padding: "0",
    borderRadius: "50%",
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    zIndex: 2,
    "&:hover": {
      backgroundColor: tokens.colorPaletteRedBackground2,
    },
  },
  dropZone: {
    minHeight: "60px",
    padding: "12px",
    border: `2px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: "4px",
    position: "relative",
  },
  dropZoneActive: {
    border: `2px dashed ${tokens.colorBrandStroke1}`,
    backgroundColor: tokens.colorBrandBackground2,
  },
  dropZonePlaceholder: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    pointerEvents: "none",
  },
  textInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: tokens.fontSizeBase200,
    padding: "0",
    height: "100%",
    textAlign: "center",
    minWidth: "20px",
  },
  preview: {
    padding: "8px 12px",
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  dateFormatSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  actionButtons: {
    width: "100%",
    paddingTop: "16px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
});

interface FileNameCustomizerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (filename: string) => void;
  defaultExtension: string;
  formData: DailyWorkData;
  title: string;
  isSettingsMode?: boolean;
}

const AVAILABLE_BLOCKS: FileNameBlock[] = [
  { id: "text-template", type: "text", content: "텍스트" },
  { id: "name-template", type: "name", content: "작성자" },
  { id: "date-template", type: "date", content: "날짜" },
];

// 블록 컴포넌트
const BlockComponent: React.FC<{
  block: FileNameBlock;
  onTextChange?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: (type: FileNameBlock["type"]) => void;
  isTemplate?: boolean;
}> = ({ block, onTextChange, onDelete, onAdd, isTemplate = false }) => {
  const styles = useStyles();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(block.id);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd?.(block.type);
  };

  if (isTemplate) {
    return (
      <div style={{ width: "fit-content" }} className={styles.block}>
        <span>{block.content}</span>
        <button
          className={`${styles.addButton} add-button`}
          onClick={handleAdd}
          aria-label="추가"
        >
          <Add12Filled />
        </button>
      </div>
    );
  }

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.draggableBlock}
    >
      {block.type === "text" ? (
        <input
          type="text"
          value={block.content}
          onChange={(e) => onTextChange?.(block.id, e.target.value)}
          className={styles.textInput}
          placeholder="텍스트"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          size={Math.max(block.content.length || 5, 5)}
          style={{
            width: `${!Math.max(block.content.length) ? 6 : Math.max(block.content.length) + 3}ch`,
            textAlign: "center",
          }}
        />
      ) : (
        <span>{block.content}</span>
      )}

      {onDelete && (
        <button
          className={`${styles.deleteButton} delete-button`}
          onClick={handleDelete}
          aria-label="삭제"
        >
          <Dismiss12Filled />
        </button>
      )}
    </div>
  );
};

export const FileNameCustomizer: React.FC<FileNameCustomizerProps> = ({
  isOpen,
  onOpenChange,
  defaultExtension,
  formData,
  isSettingsMode = false,
}) => {
  const styles = useStyles();

  const preferredFileNameFormatString = localStorage.getItem(
    "preferredFileNameFormat",
  );

  const preferredFileNameFormat: FileNameFormat = preferredFileNameFormatString
    ? JSON.parse(preferredFileNameFormatString)
    : {
        blocks: [
          { id: "1", type: "date", content: "날짜" },
          { id: "2", type: "text", content: " 일일업무일지_" },
          { id: "3", type: "name", content: "작성자" },
        ],
        dateFormat: "yyyymmdd",
      };

  const [fileNameBlocks, setFileNameBlocks] = useState<FileNameBlock[]>(
    preferredFileNameFormat.blocks,
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dateFormat, setDateFormat] = useState<
    "yyyy-mm-dd" | "yyyymmdd" | "yymmdd" | "dateString"
  >(preferredFileNameFormat.dateFormat);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const formatDateForFilename = useCallback(
    (dateStr: string) => {
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
    },
    [dateFormat],
  );

  const generatePreview = useCallback(() => {
    return (
      fileNameBlocks
        .map((block) => {
          switch (block.type) {
            case "text":
              return block.content;
            case "name":
              return formData.name || "[이름없음]";
            case "date":
              return formatDateForFilename(formData.date);
            default:
              return block.content;
          }
        })
        .join("") + defaultExtension
    );
  }, [fileNameBlocks, formData, defaultExtension, formatDateForFilename]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    // 작업 영역 내에서만 재정렬 (템플릿 블록은 드래그 불가)
    if (active.id !== over.id) {
      setFileNameBlocks((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(prev, oldIndex, newIndex);
        }
        return prev;
      });
    }
    setActiveId(null);
  };

  const handleDeleteBlock = (blockId: string) => {
    setFileNameBlocks((prev) => prev.filter((block) => block.id !== blockId));
  };

  const handleAddBlock = (type: FileNameBlock["type"]) => {
    const templateContent =
      type === "text" ? "텍스트" : type === "name" ? "작성자" : "날짜";
    const newBlock: FileNameBlock = {
      id: `${Date.now()}-${Math.random()}`,
      type: type,
      content: templateContent,
    };
    setFileNameBlocks((prev) => [...prev, newBlock]);
  };

  const handleTextChange = (blockId: string, newContent: string) => {
    setFileNameBlocks((blocks) =>
      blocks.map((block) =>
        block.id === blockId ? { ...block, content: newContent } : block,
      ),
    );
  };

  const handleConfirm = () => {
    // 로컬 스토리지에 파일 이름 형식 저장
    localStorage.setItem(
      "preferredFileNameFormat",
      JSON.stringify({
        blocks: fileNameBlocks,
        dateFormat,
      }),
    );

    onOpenChange(false);
  };

  const handleReset = () => {
    setFileNameBlocks([
      { id: "1", type: "date", content: "날짜" },
      { id: "2", type: "text", content: " 일일업무일지_" },
      { id: "3", type: "name", content: "작성자" },
    ]);

    setDateFormat("yyyymmdd");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface
        style={{ userSelect: "none", cursor: "default" }}
        draggable={false}
      >
        <DialogTitle>파일 이름 설정</DialogTitle>
        <DialogBody
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className={styles.container}>
              {/* 사용 가능한 블록들 */}
              <div className={styles.blockSection}>
                <Text className={styles.sectionTitle}>사용 가능한 블록</Text>
                <div className={styles.blocksContainer}>
                  {AVAILABLE_BLOCKS.map((block) => (
                    <BlockComponent
                      key={block.id}
                      block={block}
                      isTemplate={true}
                      onAdd={handleAddBlock}
                    />
                  ))}
                </div>
              </div>

              {/* 날짜 형식 설정 */}
              <div className={styles.blockSection}>
                <Text className={styles.sectionTitle}>날짜 형식 설정</Text>
                <div className={styles.dateFormatSection}>
                  <RadioGroup
                    value={dateFormat}
                    onChange={(_, data) =>
                      setDateFormat(
                        data.value as "yyyy-mm-dd" | "yyyymmdd" | "dateString",
                      )
                    }
                  >
                    <Radio
                      value="dateString"
                      label={`${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일`}
                    />
                    <Radio
                      value="yyyy-mm-dd"
                      label={new Date().toLocaleDateString("en-CA")}
                    />
                    <Radio
                      value="yyyymmdd"
                      label={new Date()
                        .toLocaleDateString("en-CA")
                        .replace(/-/g, "")}
                    />
                    <Radio
                      value="yymmdd"
                      label={new Date()
                        .toLocaleDateString("en-CA")
                        .slice(2)
                        .replace(/-/g, "")}
                    />
                  </RadioGroup>
                </div>
              </div>

              {/* 파일명 구성 영역 */}
              <div className={styles.blockSection}>
                <Text className={styles.sectionTitle}>파일 이름 구성</Text>
                <SortableContext
                  items={fileNameBlocks.map((b) => b.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className={styles.dropZone}>
                    {fileNameBlocks.length === 0 && (
                      <div className={styles.dropZonePlaceholder}>
                        위의 블록들을 클릭하여 추가하세요
                      </div>
                    )}
                    {fileNameBlocks.map((block) => (
                      <BlockComponent
                        key={block.id}
                        block={block}
                        onTextChange={handleTextChange}
                        onDelete={handleDeleteBlock}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>

              {/* 미리보기 */}
              <div className={styles.blockSection}>
                <Text className={styles.sectionTitle}>파일명 미리보기</Text>
                <div className={styles.preview}>{generatePreview()}</div>
              </div>
            </div>

            {createPortal(
              <DragOverlay
                dropAnimation={{
                  duration: 200,
                  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                }}
              >
                {activeId ? (
                  <div
                    style={{
                      opacity: 0,
                      cursor: "grabbing",
                    }}
                  >
                    <BlockComponent
                      block={fileNameBlocks.find((b) => b.id === activeId)!}
                      onTextChange={handleTextChange}
                    />
                  </div>
                ) : null}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>
        </DialogBody>
        <DialogActions className={styles.actionButtons}>
          <Button
            appearance="secondary"
            style={{ marginRight: "auto" }}
            onClick={handleReset}
          >
            초기화
          </Button>
          <Button appearance="secondary" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button appearance="primary" onClick={handleConfirm}>
            {isSettingsMode ? "저장" : "확인"}
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

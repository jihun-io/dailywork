import {
  Card,
  Text,
  Button,
  Input,
  Field,
  Checkbox,
  Tooltip,
} from "@fluentui/react-components";
import {
  Add20Regular,
  CheckmarkCircle20Filled,
  Dismiss20Regular,
  TaskListSquareLtr20Regular,
  Copy20Regular,
  ArrowUp20Regular,
  ArrowDown20Regular,
} from "@fluentui/react-icons";
import { DailyWorkData, WorkTask } from "../types/dailyWork";
import { useStyles } from "./styles/DailyWorkForm.styles";

interface TaskCardProps {
  formData: DailyWorkData;
  onAddTask: () => void;
  onMoveTask: (id: string, direction: "up" | "down") => void;
  onDuplicateTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<WorkTask>) => void;
}

export function TaskCard({
  formData,
  onAddTask,
  onMoveTask,
  onDuplicateTask,
  onRemoveTask,
  onUpdateTask,
}: TaskCardProps) {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <div className={styles.cardHeader}>
        <Text className={styles.sectionTitle}>
          <TaskListSquareLtr20Regular />
          업무 내용
        </Text>
        <Button
          appearance="subtle"
          icon={<Add20Regular />}
          onClick={onAddTask}
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
                        onClick={() => onMoveTask(task.id, "up")}
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
                        onClick={() => onMoveTask(task.id, "down")}
                        className={styles.taskButton}
                      />
                    </Tooltip>
                  )}
                  <Tooltip content="복사" relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<Copy20Regular />}
                      onClick={() => onDuplicateTask(task.id)}
                      className={styles.taskButton}
                    />
                  </Tooltip>
                  {formData.tasks.length > 1 && (
                    <Tooltip content="삭제" relationship="label">
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Dismiss20Regular />}
                        onClick={() => onRemoveTask(task.id)}
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
                      onUpdateTask(task.id, {
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
                        onUpdateTask(task.id, {
                          notes: e.target.value,
                        })
                      }
                      size="large"
                    />
                  </Field>
                  <Checkbox
                    checked={task.completed}
                    onChange={(_, data) =>
                      onUpdateTask(task.id, {
                        completed: !!data.checked,
                      })
                    }
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
            onClick={onAddTask}
            className={styles.addTaskButton}
            size="large"
          >
            업무 항목 추가
          </Button>
        </div>
      </div>
    </Card>
  );
}
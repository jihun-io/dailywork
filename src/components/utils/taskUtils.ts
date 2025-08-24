import { WorkTask } from "../../types/dailyWork";

export const moveTask = (
  tasks: WorkTask[],
  id: string,
  direction: "up" | "down"
): WorkTask[] => {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) return tasks;

  const newIndex = direction === "up" ? taskIndex - 1 : taskIndex + 1;
  if (newIndex < 0 || newIndex >= tasks.length) return tasks;

  const newTasks = [...tasks];
  [newTasks[taskIndex], newTasks[newIndex]] = [
    newTasks[newIndex],
    newTasks[taskIndex],
  ];

  return newTasks;
};

export const duplicateTask = (tasks: WorkTask[], id: string): WorkTask[] => {
  const taskToDuplicate = tasks.find((task) => task.id === id);
  if (!taskToDuplicate) return tasks;

  const newTask: WorkTask = {
    ...taskToDuplicate,
    id: Date.now().toString(),
    completed: false,
  };

  return [...tasks, newTask];
};

export const addTask = (tasks: WorkTask[]): WorkTask[] => {
  if (tasks.length >= 8) {
    alert("업무는 최대 8개까지 추가할 수 있습니다.");
    return tasks;
  }

  const newTask: WorkTask = {
    id: Date.now().toString(),
    description: "",
    completed: false,
    notes: "",
  };

  return [...tasks, newTask];
};

export const removeTask = (tasks: WorkTask[], id: string): WorkTask[] => {
  return tasks.filter((task) => task.id !== id);
};

export const updateTask = (
  tasks: WorkTask[],
  id: string,
  updates: Partial<WorkTask>
): WorkTask[] => {
  return tasks.map((task) =>
    task.id === id ? { ...task, ...updates } : task
  );
};
export interface DailyWorkData {
  date: string;
  name: string;
  department: string;
  workTimeRange: string;
  tasks: WorkTask[];
  specialNotes: string;
}

export interface WorkTask {
  id: string;
  description: string;
  completed: boolean;
  notes: string;
}
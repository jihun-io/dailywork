export interface DailyWorkData {
  date: string;
  name: string;
  department: string;
  startTime: string;
  endTime: string;
  halfDay: boolean;
  oasis: boolean;
  tasks: WorkTask[];
  specialNotes: string;
}

export interface WorkTask {
  id: string;
  description: string;
  completed: boolean;
  notes: string;
}
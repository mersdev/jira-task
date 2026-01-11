export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Subtask {
  id: string;
  key?: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: number;
  subtasks: Subtask[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
}
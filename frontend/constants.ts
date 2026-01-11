import { TaskStatus, Column } from './types';

export const COLUMNS: Column[] = [
  { id: TaskStatus.TODO, title: 'To Do' },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress' },
  { id: TaskStatus.DONE, title: 'Done' },
];
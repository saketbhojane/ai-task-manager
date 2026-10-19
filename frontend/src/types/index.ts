export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface User {
  id: number
  email: string
  name: string
  created_at: string
}

export interface UserCreate {
  email: string
  name: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  ai_suggested_priority: Priority | null
  assignee_id: number | null
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  assignee_id?: number
}

export interface TaskUpdate {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  assignee_id?: number | null
}

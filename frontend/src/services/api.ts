import axios from 'axios'
import type { User, UserCreate, Task, TaskCreate, TaskUpdate, TaskStatus, Priority } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// User API
export const userApi = {
  create: async (data: UserCreate): Promise<User> => {
    const response = await api.post<User>('/users', data)
    return response.data
  },

  list: async (skip = 0, limit = 100): Promise<User[]> => {
    const response = await api.get<User[]>('/users', { params: { skip, limit } })
    return response.data
  },

  get: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}

// Task API
export interface TaskFilters {
  status?: TaskStatus
  priority?: Priority
  assignee_id?: number
  skip?: number
  limit?: number
}

export const taskApi = {
  create: async (data: TaskCreate): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data)
    return response.data
  },

  list: async (filters: TaskFilters = {}): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks', { params: filters })
    return response.data
  },

  get: async (id: number): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`)
    return response.data
  },

  update: async (id: number, data: TaskUpdate): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },
}

// AI API
export interface PrioritySuggestion {
  priority: Priority
  reasoning: string
}

export interface TaskSummary {
  summary: string
  task_count: number
}

export interface AIStatus {
  enabled: boolean
  configured: boolean
  model: string
}

export const aiApi = {
  suggestPriority: async (title: string, description?: string): Promise<PrioritySuggestion> => {
    const response = await api.post<PrioritySuggestion>('/ai/suggest-priority', {
      title,
      description,
    })
    return response.data
  },

  summarizeTasks: async (taskIds?: number[]): Promise<TaskSummary> => {
    const response = await api.post<TaskSummary>('/ai/summarize', {
      task_ids: taskIds,
    })
    return response.data
  },

  getStatus: async (): Promise<AIStatus> => {
    const response = await api.get<AIStatus>('/ai/status')
    return response.data
  },
}

export default api

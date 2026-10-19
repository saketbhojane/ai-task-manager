import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '../services/api'
import type { TaskFilters } from '../services/api'
import type { TaskCreate, TaskUpdate } from '../types'

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskApi.list(filters),
  })
}

export function useTask(id: number) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskApi.get(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TaskCreate) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) =>
      taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

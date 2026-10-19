import { useQuery, useMutation } from '@tanstack/react-query'
import { aiApi } from '../services/api'

export function useAIStatus() {
  return useQuery({
    queryKey: ['ai-status'],
    queryFn: () => aiApi.getStatus(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useSuggestPriority() {
  return useMutation({
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      aiApi.suggestPriority(title, description),
  })
}

export function useSummarizeTasks() {
  return useMutation({
    mutationFn: (taskIds?: number[]) => aiApi.summarizeTasks(taskIds),
  })
}

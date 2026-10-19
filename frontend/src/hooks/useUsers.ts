import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../services/api'
import type { UserCreate } from '../types'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.list(),
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.get(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserCreate) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

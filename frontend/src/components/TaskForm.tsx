import { useState, useEffect } from 'react'
import type { Task, TaskCreate, TaskUpdate, User } from '../types'
import { TaskStatus, Priority } from '../types'
import { useSuggestPriority, useAIStatus } from '../hooks'
import { PriorityBadge } from './PriorityBadge'

interface TaskFormProps {
  task?: Task | null
  users: User[]
  onSubmit: (data: TaskCreate | TaskUpdate) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TaskForm({ task, users, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO)
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)
  const [assigneeId, setAssigneeId] = useState<number | ''>('')
  const [aiSuggestion, setAiSuggestion] = useState<{ priority: Priority; reasoning: string } | null>(null)

  const { data: aiStatus } = useAIStatus()
  const suggestPriority = useSuggestPriority()

  const isAIAvailable = aiStatus?.enabled && aiStatus?.configured

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStatus(task.status)
      setPriority(task.priority)
      setAssigneeId(task.assignee_id || '')
      // Show existing AI suggestion if available
      if (task.ai_suggested_priority) {
        setAiSuggestion({
          priority: task.ai_suggested_priority,
          reasoning: 'Previously suggested by AI',
        })
      }
    }
  }, [task])

  const handleSuggestPriority = () => {
    if (!title.trim()) return

    suggestPriority.mutate(
      { title, description },
      {
        onSuccess: (data) => {
          setAiSuggestion(data)
        },
      }
    )
  }

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      setPriority(aiSuggestion.priority)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      title,
      description: description || undefined,
      status,
      priority,
      assignee_id: assigneeId || undefined,
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
          >
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.DONE}>Done</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            {isAIAvailable && (
              <button
                type="button"
                onClick={handleSuggestPriority}
                disabled={!title.trim() || suggestPriority.isPending}
                className="text-xs text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {suggestPriority.isPending ? 'Analyzing...' : 'AI Suggest'}
              </button>
            )}
          </div>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
          >
            <option value={Priority.LOW}>Low</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.HIGH}>High</option>
          </select>
        </div>
      </div>

      {/* AI Suggestion Box */}
      {aiSuggestion && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium text-purple-800">AI Suggestion:</span>
              <PriorityBadge priority={aiSuggestion.priority} />
            </div>
            {aiSuggestion.priority !== priority && (
              <button
                type="button"
                onClick={handleAcceptSuggestion}
                className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
              >
                Accept
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-purple-700">{aiSuggestion.reasoning}</p>
        </div>
      )}

      {suggestPriority.isError && (
        <div className="text-sm text-red-600">
          Failed to get AI suggestion. Please try again.
        </div>
      )}

      <div>
        <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
          Assignee
        </label>
        <select
          id="assignee"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : '')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}

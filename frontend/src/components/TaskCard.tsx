import type { Task, User } from '../types'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'

interface TaskCardProps {
  task: Task
  users: User[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange?: (task: Task) => void
}

export function TaskCard({ task, users, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const assignee = users.find((u) => u.id === task.assignee_id)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3
          className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
          onClick={() => onEdit(task)}
        >
          {task.title}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {onStatusChange && <StatusBadge status={task.status} />}
      </div>

      {assignee && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
            {assignee.name.charAt(0).toUpperCase()}
          </div>
          <span>{assignee.name}</span>
        </div>
      )}
    </div>
  )
}

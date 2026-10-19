import { TaskStatus } from '../types'

interface StatusBadgeProps {
  status: TaskStatus
}

const statusConfig = {
  [TaskStatus.TODO]: {
    label: 'To Do',
    className: 'bg-gray-100 text-gray-800',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800',
  },
  [TaskStatus.DONE]: {
    label: 'Done',
    className: 'bg-green-100 text-green-800',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}

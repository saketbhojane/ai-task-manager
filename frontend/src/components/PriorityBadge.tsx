import { Priority } from '../types'

interface PriorityBadgeProps {
  priority: Priority
}

const priorityConfig = {
  [Priority.HIGH]: {
    label: 'High',
    className: 'bg-red-100 text-red-800',
  },
  [Priority.MEDIUM]: {
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-800',
  },
  [Priority.LOW]: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-600',
  },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}

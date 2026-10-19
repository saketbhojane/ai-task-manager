import type { Task, User } from '../types'
import { TaskStatus } from '../types'
import { TaskCard } from './TaskCard'

interface TaskBoardProps {
  tasks: Task[]
  users: User[]
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
}

const columns = [
  { status: TaskStatus.TODO, title: 'To Do', bgColor: 'bg-gray-50' },
  { status: TaskStatus.IN_PROGRESS, title: 'In Progress', bgColor: 'bg-blue-50' },
  { status: TaskStatus.DONE, title: 'Done', bgColor: 'bg-green-50' },
]

export function TaskBoard({ tasks, users, onEditTask, onDeleteTask, onStatusChange }: TaskBoardProps) {
  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status)

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    const taskId = parseInt(e.dataTransfer.getData('taskId'))
    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== status) {
      onStatusChange(task, status)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => (
        <div
          key={column.status}
          className={`${column.bgColor} rounded-lg p-4 min-h-[400px]`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">{column.title}</h2>
            <span className="bg-white px-2 py-1 rounded-full text-sm text-gray-600">
              {getTasksByStatus(column.status).length}
            </span>
          </div>
          <div className="space-y-3">
            {getTasksByStatus(column.status).map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                className="cursor-move"
              >
                <TaskCard
                  task={task}
                  users={users}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

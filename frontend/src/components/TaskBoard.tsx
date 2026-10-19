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
  { status: TaskStatus.TODO, title: 'To Do', bgColor: 'bg-sky-100', headerColor: 'bg-sky-500' },
  { status: TaskStatus.IN_PROGRESS, title: 'In Progress', bgColor: 'bg-amber-100', headerColor: 'bg-amber-500' },
  { status: TaskStatus.DONE, title: 'Done', bgColor: 'bg-emerald-100', headerColor: 'bg-emerald-500' },
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
          className={`${column.bgColor} rounded-lg overflow-hidden min-h-[400px]`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          <div className={`${column.headerColor} px-4 py-3 flex items-center justify-between`}>
            <h2 className="font-semibold text-white">{column.title}</h2>
            <span className="bg-white/20 px-2 py-1 rounded-full text-sm text-white">
              {getTasksByStatus(column.status).length}
            </span>
          </div>
          <div className="p-4">
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
        </div>
      ))}
    </div>
  )
}

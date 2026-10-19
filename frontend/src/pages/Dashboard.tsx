import { useState } from 'react'
import type { Task, TaskCreate, TaskUpdate } from '../types'
import { TaskStatus } from '../types'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import { useUsers } from '../hooks/useUsers'
import { useAIStatus, useSummarizeTasks } from '../hooks/useAI'
import { TaskBoard, TaskForm, Modal } from '../components'

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Task | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useTasks()
  const { data: users = [] } = useUsers()
  const { data: aiStatus } = useAIStatus()
  const summarizeTasks = useSummarizeTasks()

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const isAIAvailable = aiStatus?.enabled && aiStatus?.configured

  const handleCreateClick = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleDeleteTask = (task: Task) => {
    setDeleteConfirm(task)
  }

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    updateTask.mutate({ id: task.id, data: { status: newStatus } })
  }

  const handleFormSubmit = (data: TaskCreate | TaskUpdate) => {
    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false)
            setEditingTask(null)
          },
        }
      )
    } else {
      createTask.mutate(data as TaskCreate, {
        onSuccess: () => {
          setIsModalOpen(false)
        },
      })
    }
  }

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      deleteTask.mutate(deleteConfirm.id, {
        onSuccess: () => {
          setDeleteConfirm(null)
        },
      })
    }
  }

  const handleGenerateSummary = () => {
    summarizeTasks.mutate(undefined, {
      onSuccess: (data) => {
        setSummary(data.summary)
        setShowSummary(true)
      },
    })
  }

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (tasksError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          Error loading tasks. Make sure the backend is running.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <div className="flex items-center gap-3">
              {isAIAvailable && tasks.length > 0 && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={summarizeTasks.isPending}
                  className="inline-flex items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {summarizeTasks.isPending ? 'Generating...' : 'AI Summary'}
                </button>
              )}
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <TaskBoard
          tasks={tasks}
          users={users}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
      </main>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <TaskForm
          task={editingTask}
          users={users}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingTask(null)
          }}
          isLoading={createTask.isPending || updateTask.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleteTask.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deleteTask.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Summary Modal */}
      <Modal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        title="AI Task Summary"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-purple-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium">Generated by AI</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowSummary(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

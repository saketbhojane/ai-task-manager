import { useState } from 'react'
import type { Task, TaskCreate, TaskUpdate, UserCreate, User } from '../types'
import { TaskStatus } from '../types'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import { useUsers, useCreateUser, useDeleteUser } from '../hooks/useUsers'
import { useAIStatus, useSummarizeTasks } from '../hooks/useAI'
import { TaskBoard, TaskForm, Modal, UserForm } from '../components'

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Task | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<User | null>(null)

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useTasks()
  const { data: users = [] } = useUsers()
  const { data: aiStatus } = useAIStatus()
  const summarizeTasks = useSummarizeTasks()

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()

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

  const handleCreateUser = (data: UserCreate) => {
    createUser.mutate(data, {
      onSuccess: () => {
        // Keep modal open to show the new user in the list
      },
    })
  }

  const handleConfirmDeleteUser = () => {
    if (deleteUserConfirm) {
      deleteUser.mutate(deleteUserConfirm.id, {
        onSuccess: () => {
          setDeleteUserConfirm(null)
        },
      })
    }
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
                onClick={() => setIsUserModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Manage Assignees
              </button>
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

      {/* Manage Assignees Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Manage Assignees"
      >
        <div className="space-y-6">
          {/* Existing Users List */}
          {users.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Assignees</h3>
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {users.map((user) => (
                  <li key={user.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => setDeleteUserConfirm(user)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete assignee"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add New User Form */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Assignee</h3>
            <UserForm
              onSubmit={handleCreateUser}
              onCancel={() => setIsUserModalOpen(false)}
              isLoading={createUser.isPending}
            />
          </div>
        </div>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={!!deleteUserConfirm}
        onClose={() => setDeleteUserConfirm(null)}
        title="Delete Assignee"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{deleteUserConfirm?.name}"? Tasks assigned to this person will become unassigned.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteUserConfirm(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDeleteUser}
              disabled={deleteUser.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deleteUser.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TaskModal } from './components/TaskModal'
import { BoardToolbar } from './components/BoardToolbar'
import { AddColumnButton } from './components/AddColumnButton'
import { BoardEmptyState } from './components/BoardEmptyState'
import { ColumnModal } from './components/ColumnModal'
import { SortableColumn } from './components/SortableColumn'
import { SortableTaskCard } from './components/SortableTaskCard'
import { ColumnTaskDropZone } from './components/ColumnTaskDropZone'
import {
  AuthPanel,
  type AuthFormMode,
  type AuthResult,
  type LoginPayload,
  type RegisterPayload,
} from './components/AuthPanel'
import { useBoardStore } from './store/boardStore'
import type { Column, Task, TaskPriority } from './types/board'
import type { PriorityFilter, SortMode } from './types/filters'
import { api } from './api/client'
import './App.scss'

function App() {
  const [isTaskModalOpen, setTaskModalOpen] = useState(false)
  const [isColumnModalOpen, setColumnModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('priority')
  const [taskToEdit, setTaskToEdit] = useState<{ task: Task; columnId: string } | null>(null)
  const [columnToEdit, setColumnToEdit] = useState<Column | null>(null)
  const [authMode, setAuthMode] = useState<AuthFormMode>('login')
  const [currentUser, setCurrentUser] = useState<{ fullName: string; email: string } | null>(() => {
    const stored = localStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  })
  const { boards, activeBoardId, isLoading, loadBoards, addColumn, updateColumn, moveColumn, moveTask } = useBoardStore()
  const activeBoard = boards.find((board) => board.id === activeBoardId)

  useEffect(() => {
    if (currentUser) {
      loadBoards()
    }
  }, [currentUser, loadBoards])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const filteredColumns = useMemo(() => {
    if (!activeBoard) return []
    const query = searchQuery.trim().toLowerCase()
    const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }

    const parseDate = (value?: string) => {
      if (!value) return undefined
      const timestamp = Date.parse(value)
      return Number.isNaN(timestamp) ? undefined : timestamp
    }

    const matchesQuery = (task: typeof activeBoard.columns[number]['tasks'][number]) => {
      if (!query) return true
      const haystack = [
        task.title,
        task.description,
        task.assignee.name,
        task.tags?.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    }

    const sortTasks = (
      tasks: typeof activeBoard.columns[number]['tasks'][number][]
    ) => {
      return [...tasks].sort((a, b) => {
        switch (sortMode) {
          case 'alphabetical':
            return a.title.localeCompare(b.title, 'ru')
          case 'dueDateAsc': {
            const aDate = parseDate(a.dueDate) ?? Number.POSITIVE_INFINITY
            const bDate = parseDate(b.dueDate) ?? Number.POSITIVE_INFINITY
            return aDate - bDate
          }
          case 'dueDateDesc': {
            const aDate = parseDate(a.dueDate) ?? Number.NEGATIVE_INFINITY
            const bDate = parseDate(b.dueDate) ?? Number.NEGATIVE_INFINITY
            return bDate - aDate
          }
          case 'priority':
          default:
            return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
      })
    }

    return activeBoard.columns.map((column) => {
      const filtered = column.tasks.filter((task) => {
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
        return matchesPriority && matchesQuery(task)
      })

      return {
        column,
        tasks: sortTasks(filtered),
        originalTaskCount: column.tasks.length,
      }
    })
  }, [activeBoard, priorityFilter, searchQuery, sortMode])

  const handleLogin = useCallback(
    async ({ email, password }: LoginPayload): Promise<AuthResult> => {
      try {
        const response = await api.post('/auth/login', { email, password })
        const { user, accessToken } = response.data
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('currentUser', JSON.stringify({ fullName: user.fullName, email: user.email }))
        
        setCurrentUser({ fullName: user.fullName, email: user.email })
        await loadBoards()
      return { success: true }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Ошибка при входе'
        return { success: false, message }
      }
    },
    [loadBoards]
  )

  const handleRegister = useCallback(
    async ({ fullName, email, password }: RegisterPayload): Promise<AuthResult> => {
      try {
        const response = await api.post('/auth/register', { fullName, email, password })
        const { user, accessToken } = response.data
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('currentUser', JSON.stringify({ fullName: user.fullName, email: user.email }))
        
        setCurrentUser({ fullName: user.fullName, email: user.email })
        await loadBoards()
      return { success: true }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Ошибка при регистрации'
        return { success: false, message }
      }
    },
    [loadBoards]
  )

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    setTaskModalOpen(false)
    setColumnModalOpen(false)
    setTaskToEdit(null)
    setColumnToEdit(null)
    setAuthMode('login')
  }, [])

  const userInitials = useMemo(() => {
    if (!currentUser) return ''
    return (
      currentUser.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((chunk) => chunk[0]?.toUpperCase() ?? '')
        .join('') || currentUser.email[0]?.toUpperCase() || '?'
    )
  }, [currentUser])

  const totalTasks = activeBoard?.columns.reduce((acc, column) => acc + column.tasks.length, 0) ?? 0
  const visibleTasks = filteredColumns.reduce((acc, entry) => acc + entry.tasks.length, 0)
  const showBoardEmptyState = (activeBoard?.columns.length ?? 0) === 0
  const showFilteredEmptyState = totalTasks > 0 && visibleTasks === 0

  const handleColumnCreate = (title: string, accentColor?: string) => {
    addColumn(title, accentColor)
  }

  const handleTaskModalClose = () => {
    setTaskModalOpen(false)
    setTaskToEdit(null)
  }

  const handleColumnModalClose = () => {
    setColumnModalOpen(false)
    setColumnToEdit(null)
  }

  const handleOpenCreateTaskModal = () => {
    setTaskToEdit(null)
    setTaskModalOpen(true)
  }

  const handleTaskEdit = (task: Task, columnId: string) => {
    setTaskToEdit({ task, columnId })
    setTaskModalOpen(true)
  }

  const handleColumnEdit = (column: Column) => {
    setColumnToEdit(column)
    setColumnModalOpen(true)
  }

  const handleOpenCreateColumnModal = () => {
    setColumnToEdit(null)
    setColumnModalOpen(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!active || !over) return

    const activeType = active.data.current?.type

    if (activeType === 'column') {
      const overId = String(over.id)
      if (overId && overId !== active.id) {
        moveColumn(String(active.id), overId)
      }
      return
    }

    if (activeType === 'task') {
      const sourceColumnId = active.data.current?.columnId as string | undefined
      if (!sourceColumnId) return

      let targetColumnId = sourceColumnId
      let targetTaskId: string | undefined

      const overData = over.data.current

      if (overData?.type === 'task') {
        targetColumnId = overData.columnId
        targetTaskId = String(over.id)
      } else if (overData?.type === 'task-droppable') {
        targetColumnId = overData.columnId
      } else if (typeof over.id === 'string') {
        targetColumnId = over.id
      }

      moveTask(String(active.id), sourceColumnId, targetColumnId, targetTaskId)
    }
  }

  if (!currentUser) {
    return (
      <div className="auth-page">
        <AuthPanel
          mode={authMode}
          onModeChange={setAuthMode}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </div>
    )
  }

  if (!activeBoard) {
    return (
      <div className="board-page">
        <header className="board-page__header">
          <h1 className="board-page__title">TaskFlow</h1>
          <p className="board-page__subtitle">Нет доступных досок. Добавьте первую, чтобы начать работу.</p>
        </header>
      </div>
    )
  }

  return (
    <div className="board-page">
      <header className="board-page__header">
        <div>
          <h1 className="board-page__title">{activeBoard.title}</h1>
          {activeBoard.description && (
            <p className="board-page__subtitle">{activeBoard.description}</p>
          )}
        </div>
        <div className="board-page__actions">
          <button className="btn btn_type_primary" onClick={handleOpenCreateTaskModal}>
            + Добавить задачу
          </button>
          <div className="board-page__user">
            <div className="board-page__user-avatar" aria-hidden="true">
              {userInitials}
            </div>
            <div className="board-page__user-meta">
              <span className="board-page__user-name">{currentUser.fullName}</span>
              <span className="board-page__user-email">{currentUser.email}</span>
            </div>
            <button type="button" className="board-page__logout-btn" onClick={handleSignOut}>
              Выйти
            </button>
          </div>
        </div>
      </header>
      <BoardToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        columnCount={activeBoard.columns.length}
        visibleTasks={visibleTasks}
        totalTasks={totalTasks}
      />
      <main className="board-page__columns" role="list">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <SortableContext
            items={filteredColumns.map(({ column }) => column.id)}
            strategy={horizontalListSortingStrategy}
          >
            {filteredColumns.map(({ column, tasks, originalTaskCount }) => (
              <SortableColumn
                key={column.id}
                column={column}
                tasks={tasks}
                originalTaskCount={originalTaskCount}
                onTaskEdit={handleTaskEdit}
                onColumnEdit={handleColumnEdit}
                taskListSlot={
                  <ColumnTaskDropZone columnId={column.id}>
                    {tasks.length === 0 ? (
                      <div className="board-column__empty">
                        <p>Нет задач</p>
                        <small>Измените фильтры или добавьте новую задачу</small>
                      </div>
                    ) : (
                      <SortableContext
                        items={tasks.map((task) => task.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="board-column__task-list">
                          {tasks.map((task) => (
                            <SortableTaskCard
                              key={task.id}
                              task={task}
                              columnId={column.id}
                              onEdit={handleTaskEdit}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    )}
                  </ColumnTaskDropZone>
                }
              />
            ))}
          </SortableContext>
          <AddColumnButton onClick={handleOpenCreateColumnModal} />
        </DndContext>
      </main>
      {showBoardEmptyState && (
        <BoardEmptyState
          title="На доске пока нет колонок и задач."
          description="Создайте колонку, чтобы добавить первую задачу."
          actionLabel="Создать первую колонку"
          onAction={handleOpenCreateColumnModal}
        />
      )}
      {showFilteredEmptyState && (
        <BoardEmptyState
          title="Нет задач, подходящих под условия поиска или фильтрации."
          description="Попробуйте скорректировать запрос или сбросить фильтры."
          actionLabel="Сбросить фильтры"
          onAction={() => setSearchQuery('')}
          tone="filters"
        />
      )}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleTaskModalClose}
        columns={activeBoard.columns}
        initialColumnId={activeBoard.columns[0]?.id}
        taskToEdit={taskToEdit}
      />
      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={handleColumnModalClose}
        onSubmit={handleColumnCreate}
        columnToEdit={columnToEdit}
        onUpdate={(columnId, payload) => updateColumn(columnId, payload)}
      />
    </div>
  )
}

export default App

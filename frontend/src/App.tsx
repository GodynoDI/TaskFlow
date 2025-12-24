import { useMemo, useState } from 'react'
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
import { useBoardStore } from './store/boardStore'
import type { TaskPriority } from './types/board'
import type { PriorityFilter, SortMode } from './types/filters'
import './App.scss'

function App() {
  const [isTaskModalOpen, setTaskModalOpen] = useState(false)
  const [isColumnModalOpen, setColumnModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('priority')
  const { boards, activeBoardId, addColumn, moveColumn, moveTask } = useBoardStore()
  const activeBoard = boards.find((board) => board.id === activeBoardId)
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

  const totalTasks = activeBoard?.columns.reduce((acc, column) => acc + column.tasks.length, 0) ?? 0
  const visibleTasks = filteredColumns.reduce((acc, entry) => acc + entry.tasks.length, 0)
  const showBoardEmptyState = (activeBoard?.columns.length ?? 0) === 0
  const showFilteredEmptyState = totalTasks > 0 && visibleTasks === 0

  const handleColumnCreate = (title: string, accentColor?: string) => {
    addColumn(title, accentColor)
    setColumnModalOpen(false)
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
          <button className="btn btn_type_primary" onClick={() => setTaskModalOpen(true)}>
            + Добавить задачу
          </button>
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
                            <SortableTaskCard key={task.id} task={task} columnId={column.id} />
                          ))}
                        </div>
                      </SortableContext>
                    )}
                  </ColumnTaskDropZone>
                }
              />
            ))}
          </SortableContext>
          <AddColumnButton onClick={() => setColumnModalOpen(true)} />
        </DndContext>
      </main>
      {showBoardEmptyState && (
        <BoardEmptyState
          title="На доске пока нет колонок и задач."
          description="Создайте колонку, чтобы добавить первую задачу."
          actionLabel="Создать первую колонку"
          onAction={() => setColumnModalOpen(true)}
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
        onClose={() => setTaskModalOpen(false)}
        columns={activeBoard.columns}
        initialColumnId={activeBoard.columns[0]?.id}
      />
      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setColumnModalOpen(false)}
        onSubmit={handleColumnCreate}
      />
    </div>
  )
}

export default App

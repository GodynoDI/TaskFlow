import type { HTMLAttributes, ReactNode } from 'react'
import type { Column, Task } from '../types/board'
import { TaskCard } from './TaskCard'
import './BoardColumn.scss'

interface BoardColumnProps {
  column: Column
  tasks?: Task[]
  originalTaskCount?: number
  taskListSlot?: ReactNode
  dragHandleProps?: HTMLAttributes<HTMLElement>
  onTaskEdit?: (task: Task, columnId: string) => void
  onColumnEdit?: (column: Column) => void
}

export function BoardColumn({
  column,
  tasks,
  originalTaskCount,
  taskListSlot,
  dragHandleProps,
  onTaskEdit,
  onColumnEdit,
}: BoardColumnProps) {
  const visibleTasks = tasks ?? column.tasks
  const totalTasks = originalTaskCount ?? column.tasks.length
  const headerClassName = [
    'board-column__header',
    dragHandleProps ? 'board-column__header_drag-handle' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className="board-column">
      <header className={headerClassName} {...dragHandleProps}>
        <div className="board-column__header-main">
          <div className="board-column__pill">
            <span
              className="board-column__pill-dot"
              style={{ backgroundColor: column.accentColor }}
            />
            <span>{column.title}</span>
          </div>
          <span className="board-column__count">
            {visibleTasks.length}/{totalTasks}
          </span>
        </div>
        {onColumnEdit && (
          <button
            type="button"
            className="board-column__edit-btn"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onColumnEdit(column)}
          >
            Изменить
          </button>
        )}
      </header>

      {taskListSlot ? (
        taskListSlot
      ) : visibleTasks.length === 0 ? (
        <div className="board-column__empty">
          <p>Нет задач</p>
          <small>Измените фильтры или добавьте новую задачу</small>
        </div>
      ) : (
        <div className="board-column__task-list">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              onEdit={onTaskEdit}
            />
          ))}
        </div>
      )}
    </section>
  )
}

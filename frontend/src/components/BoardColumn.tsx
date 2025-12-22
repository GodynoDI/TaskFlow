import type { Column, Task } from '../types/board'
import { TaskCard } from './TaskCard'
import './BoardColumn.scss'

interface BoardColumnProps {
  column: Column
  tasks?: Task[]
  originalTaskCount?: number
}

export function BoardColumn({ column, tasks, originalTaskCount }: BoardColumnProps) {
  const visibleTasks = tasks ?? column.tasks
  const totalTasks = originalTaskCount ?? column.tasks.length

  return (
    <section className="board-column">
      <header className="board-column__header">
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
      </header>

      {visibleTasks.length === 0 ? (
        <div className="board-column__empty">
          <p>Нет задач</p>
          <small>Измените фильтры или добавьте новую задачу</small>
        </div>
      ) : (
        <div className="board-column__task-list">
          {visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </section>
  )
}

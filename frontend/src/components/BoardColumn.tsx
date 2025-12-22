import type { Column } from '../types/board'
import { TaskCard } from './TaskCard'
import './BoardColumn.scss'

interface BoardColumnProps {
  column: Column
}

export function BoardColumn({ column }: BoardColumnProps) {
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
        <span className="board-column__count">{column.tasks.length}</span>
      </header>

      <div className="board-column__task-list">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  )
}

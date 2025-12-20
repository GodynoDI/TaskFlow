import type { Column } from '../types/board'
import { TaskCard } from './TaskCard'

interface BoardColumnProps {
  column: Column
}

export function BoardColumn({ column }: BoardColumnProps) {
  return (
    <section className="board-column">
      <header className="board-column__header">
        <div className="column-pill">
          <span
            className="column-pill__dot"
            style={{ backgroundColor: column.accentColor }}
          />
          <span>{column.title}</span>
        </div>
        <span className="column-count">{column.tasks.length}</span>
      </header>

      <div className="task-stack">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  )
}

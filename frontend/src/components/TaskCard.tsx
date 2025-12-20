export type TaskPriority = 'high' | 'medium' | 'low'

export interface TaskCardData {
  id: string
  title: string
  description?: string
  dueDate?: string
  tags?: string[]
  priority: TaskPriority
  assignee: {
    name: string
    initials: string
  }
  subtasks?: {
    completed: number
    total: number
  }
}

interface TaskCardProps {
  task: TaskCardData
}

const PRIORITY_CLASS_MAP: Record<TaskPriority, string> = {
  high: 'priority-badge priority-high',
  medium: 'priority-badge priority-medium',
  low: 'priority-badge priority-low',
}

export function TaskCard({ task }: TaskCardProps) {
  const subtaskLabel = task.subtasks
    ? `${task.subtasks.completed}/${task.subtasks.total} подзадач`
    : 'Нет подзадач'

  return (
    <article className="task-card">
      <div className="task-card__header">
        <span className={PRIORITY_CLASS_MAP[task.priority]}>
          {task.priority === 'high'
            ? 'Высокий'
            : task.priority === 'medium'
              ? 'Средний'
              : 'Низкий'}
        </span>
        {task.dueDate && <span className="due-chip">до {task.dueDate}</span>}
      </div>

      <div>
        <h3 className="task-card__title">{task.title}</h3>
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="tag-list">
          {task.tags.map((tag) => (
            <span key={tag} className="task-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-card__footer">
        <div className="person-chip">
          <span className="person-chip__avatar">{task.assignee.initials}</span>
          <span>{task.assignee.name}</span>
        </div>
        <span className="subtask-indicator">{subtaskLabel}</span>
      </div>
    </article>
  )
}

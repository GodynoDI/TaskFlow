import { useBoardStore } from '../store/boardStore'
import type { Task, TaskPriority } from '../types/board'
import './TaskCard.scss'

interface TaskCardProps {
  task: Task
  columnId: string
  onEdit?: (task: Task, columnId: string) => void
}

const PRIORITY_CLASS_MAP: Record<TaskPriority, string> = {
  high: 'task-card__priority task-card__priority_level_high',
  medium: 'task-card__priority task-card__priority_level_medium',
  low: 'task-card__priority task-card__priority_level_low',
}

const formatDueDate = (raw?: string) => {
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = new Date(raw)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('ru-RU')
    }
  }
  return raw
}

export function TaskCard({ task, columnId, onEdit }: TaskCardProps) {
  const toggleSubtask = useBoardStore((state) => state.toggleSubtask)
  const subtaskCount = task.subtasks?.length ?? 0
  const completedSubtasks = task.subtasks?.filter((subtask) => subtask.isDone).length ?? 0
  const hasSubtasks = subtaskCount > 0
  const subtaskLabel = hasSubtasks ? `${completedSubtasks}/${subtaskCount} подзадач` : 'Нет подзадач'
  const isEditAvailable = typeof onEdit === 'function'
  const showHeaderActions = Boolean(task.dueDate || isEditAvailable)

  const handleSubtaskToggle = (subtaskId: string) => {
    toggleSubtask({
      columnId,
      taskId: task.id,
      subtaskId,
      isDone: !task.subtasks?.find((subtask) => subtask.id === subtaskId)?.isDone,
    })
  }

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
        {showHeaderActions && (
          <div className="task-card__header-actions">
            {task.dueDate && (
              <span className="task-card__due-date">до {formatDueDate(task.dueDate)}</span>
            )}
            {isEditAvailable && (
              <button
                type="button"
                className="task-card__edit-btn"
                onClick={() => onEdit?.(task, columnId)}
                onPointerDown={(event) => event.stopPropagation()}
              >
                Изменить
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="task-card__title">{task.title}</h3>
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}
      </div>

      {hasSubtasks && (
        <ul className="task-card__subtask-list">
          {task.subtasks!.map((subtask) => (
            <li
              key={subtask.id}
              className={[
                'task-card__subtask',
                subtask.isDone ? 'task-card__subtask_state_done' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <label className="task-card__subtask-label">
                <input
                  type="checkbox"
                  name="taskCardSubtaskToggle"
                  className="task-card__subtask-checkbox"
                  checked={subtask.isDone}
                  onChange={() => handleSubtaskToggle(subtask.id)}
                />
                <span className="task-card__subtask-text">{subtask.title}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="task-card__tag-list">
          {task.tags.map((tag) => (
            <span key={tag} className="task-card__tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-card__footer">
        <div className="task-card__assignee">
          <span className="task-card__assignee-avatar">{task.assignee.initials}</span>
          <span>{task.assignee.name}</span>
        </div>
        <span className="task-card__subtasks">{subtaskLabel}</span>
      </div>
    </article>
  )
}

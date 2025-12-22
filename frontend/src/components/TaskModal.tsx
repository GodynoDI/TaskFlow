import { useEffect, useMemo, useState } from 'react'
import { useBoardStore } from '../store/boardStore'
import type { Column, TaskPriority } from '../types/board'
import './TaskModal.scss'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  columns: Column[]
  initialColumnId?: string
}

const defaultForm = {
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  dueDate: '',
  tags: '',
  assigneeName: '',
  columnId: '',
}

export function TaskModal({ isOpen, onClose, columns, initialColumnId }: TaskModalProps) {
  const addTask = useBoardStore((state) => state.addTask)
  const [form, setForm] = useState(defaultForm)
  const [showDescriptionField, setShowDescriptionField] = useState(false)
  const columnOptions = useMemo(
    () => columns.map((column) => ({ id: column.id, title: column.title })),
    [columns]
  )

  useEffect(() => {
    if (!isOpen) return
    const fallbackColumn = initialColumnId || columnOptions[0]?.id || ''
    setForm((prev) => ({ ...prev, columnId: fallbackColumn }))
  }, [isOpen, initialColumnId, columnOptions])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.columnId) return
    const descriptionValue = showDescriptionField ? form.description.trim() : ''
    const initials =
      form.assigneeName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((chunk) => chunk[0]?.toUpperCase() ?? '')
        .join('') || '??'

    addTask(form.columnId, {
      title: form.title,
      description: descriptionValue || undefined,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()) : undefined,
      assignee: {
        name: form.assigneeName || 'Без исполнителя',
        initials,
      },
      subtasks: { completed: 0, total: 0 },
    })
    setForm(defaultForm)
    setShowDescriptionField(false)
    onClose()
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="task-modal__backdrop"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div className="task-modal">
        <div className="task-modal__header">
          <h2 className="task-modal__title">Новая задача</h2>
          <button className="task-modal__close-btn" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <form className="task-modal__form" onSubmit={handleSubmit}>
          <div className="task-modal__field">
            <label htmlFor="title">Название</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Например, проработать карточки"
            />
          </div>

          {showDescriptionField ? (
            <div className="task-modal__field">
              <label htmlFor="description">Описание</label>
              <div className="task-modal__description-wrapper">
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Кратко опишите задачу"
                />
                <button
                  type="button"
                  className="task-modal__icon-btn task-modal__description-close"
                  aria-label="Свернуть описание"
                  onClick={() => setShowDescriptionField(false)}
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="task-modal__add-description-btn"
              onClick={() => setShowDescriptionField(true)}
            >
              + Добавить описание
            </button>
          )}

          <div className="task-modal__row task-modal__row_layout_compact">
            <div className="task-modal__field">
              <label htmlFor="columnId">Колонка</label>
              <select
                id="columnId"
                name="columnId"
                value={form.columnId}
                onChange={handleChange}
                required
              >
                {columnOptions.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="task-modal__field">
              <label htmlFor="priority">Приоритет</label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>

            <div className="task-modal__field">
              <label htmlFor="dueDate">Срок</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="task-modal__field">
              <label htmlFor="tags">Теги</label>
              <input
                id="tags"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="ui, карточки"
              />
            </div>

            <div className="task-modal__field">
              <label htmlFor="assigneeName">Исполнитель</label>
              <input
                id="assigneeName"
                name="assigneeName"
                value={form.assigneeName}
                onChange={handleChange}
                placeholder="Имя исполнителя"
              />
            </div>
          </div>

          <div className="task-modal__actions">
            <button type="button" className="btn btn_type_secondary" onClick={onClose}>
              Отмена
            </button>
            <button className="btn btn_type_primary" type="submit">
              Добавить задачу
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

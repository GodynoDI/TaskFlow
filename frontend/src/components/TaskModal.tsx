import { useEffect, useMemo, useRef, useState } from 'react'
import { useBoardStore } from '../store/boardStore'
import type { Column, Task, TaskPriority, TaskSubtask } from '../types/board'
import { RevealableSection } from './RevealableSection'
import { FormInput } from './FormInput'
import './TaskModal.scss'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  columns: Column[]
  initialColumnId?: string
  taskToEdit?: {
    task: Task
    columnId: string
  } | null
}

const defaultForm = {
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  dueDate: '',
  assigneeName: '',
  columnId: '',
}

export function TaskModal({ isOpen, onClose, columns, initialColumnId, taskToEdit }: TaskModalProps) {
  const addTask = useBoardStore((state) => state.addTask)
  const updateTask = useBoardStore((state) => state.updateTask)
  const [form, setForm] = useState(defaultForm)
  const [isDescriptionOpen, setDescriptionOpen] = useState(false)
  const [isSubtasksOpen, setSubtasksOpen] = useState(false)
  const [isTagsOpen, setTagsOpen] = useState(false)
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTagTitle, setNewTagTitle] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const columnOptions = useMemo(
    () => columns.map((column) => ({ id: column.id, title: column.title })),
    [columns]
  )
  const isEditMode = Boolean(taskToEdit)

  useEffect(() => {
    if (!isOpen) return
    if (taskToEdit) {
      setForm({
        title: taskToEdit.task.title,
        description: taskToEdit.task.description ?? '',
        priority: taskToEdit.task.priority,
        dueDate: taskToEdit.task.dueDate ?? '',
        assigneeName: taskToEdit.task.assignee.name,
        columnId: taskToEdit.columnId,
      })
      setDescriptionOpen(Boolean(taskToEdit.task.description))
      setSubtasks(taskToEdit.task.subtasks ?? [])
      setSubtasksOpen(Boolean(taskToEdit.task.subtasks?.length))
      setTags(taskToEdit.task.tags ?? [])
      setTagsOpen(Boolean(taskToEdit.task.tags?.length))
      setNewSubtaskTitle('')
      setNewTagTitle('')
      return
    }

    const fallbackColumn = initialColumnId || columnOptions[0]?.id || ''
    setForm({
      ...defaultForm,
      columnId: fallbackColumn,
    })
    setDescriptionOpen(false)
    setSubtasksOpen(false)
    setSubtasks([])
    setNewSubtaskTitle('')
    setTags([])
    setTagsOpen(false)
    setNewTagTitle('')
  }, [isOpen, initialColumnId, columnOptions, taskToEdit])

  useEffect(() => {
    if (!isOpen) return
    const timeoutId = window.setTimeout(() => {
      titleInputRef.current?.focus()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [isOpen])

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
    const descriptionValue = isDescriptionOpen ? form.description.trim() : ''
    const initials =
      form.assigneeName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((chunk) => chunk[0]?.toUpperCase() ?? '')
        .join('') || '??'

    const normalizedSubtasks = subtasks.map((subtask) => ({
      ...subtask,
      id: subtask.id || crypto.randomUUID(),
      title: subtask.title.trim(),
    }))
    const normalizedTags = tags.map((tag) => tag.trim()).filter(Boolean)

    if (isEditMode && taskToEdit) {
      updateTask({
        taskId: taskToEdit.task.id,
        fromColumnId: taskToEdit.columnId,
        toColumnId: form.columnId,
        patch: {
          title: form.title,
          description: descriptionValue || undefined,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
          tags: normalizedTags.length ? normalizedTags : undefined,
          assignee: {
            name: form.assigneeName || 'Без исполнителя',
            initials,
          },
          subtasks: normalizedSubtasks,
        },
      })
    } else {
      addTask(form.columnId, {
        title: form.title,
        description: descriptionValue || undefined,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        tags: normalizedTags.length ? normalizedTags : undefined,
        assignee: {
          name: form.assigneeName || 'Без исполнителя',
          initials,
        },
        subtasks: normalizedSubtasks,
      })
    }

    setForm(defaultForm)
    setDescriptionOpen(false)
    setSubtasksOpen(false)
    setSubtasks([])
    setNewSubtaskTitle('')
    setTags([])
    setTagsOpen(false)
    setNewTagTitle('')
    onClose()
  }

  const handleAddSubtask = () => {
    const trimmed = newSubtaskTitle.trim()
    if (!trimmed) return
    setSubtasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: trimmed,
        isDone: false,
      },
    ])
    setNewSubtaskTitle('')
    setSubtasksOpen(true)
  }

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks((prev) =>
      prev.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, isDone: !subtask.isDone } : subtask
      )
    )
  }

  const handleRemoveSubtask = (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((subtask) => subtask.id !== subtaskId))
  }

  const handleAddTag = () => {
    const trimmed = newTagTitle.trim()
    if (!trimmed) return
    setTags((prev) => [...prev, trimmed])
    setNewTagTitle('')
    setTagsOpen(true)
  }

  const handleRemoveTag = (indexToRemove: number) => {
    setTags((prev) => prev.filter((_, index) => index !== indexToRemove))
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
          <h2 className="task-modal__title">
            {isEditMode ? 'Редактировать задачу' : 'Новая задача'}
          </h2>
          <button className="task-modal__close-btn" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <form className="task-modal__form" onSubmit={handleSubmit}>
          <div className="task-modal__field">
            <label htmlFor="title">Название</label>
            <FormInput
              id="title"
              name="title"
              ref={titleInputRef}
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Например, проработать карточки"
            />
          </div>

          <RevealableSection
            isOpen={isDescriptionOpen}
            title="Описание"
            triggerLabel="+ Добавить описание"
            onOpen={() => setDescriptionOpen(true)}
            onClose={() => setDescriptionOpen(false)}
          >
            <div className="task-modal__field">
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Кратко опишите задачу"
              />
            </div>
          </RevealableSection>

          <RevealableSection
            isOpen={isSubtasksOpen}
            title="Подзадачи"
            triggerLabel="+ Добавить подзадачу"
            onOpen={() => setSubtasksOpen(true)}
            onClose={() => setSubtasksOpen(false)}
          >
            <ul className="task-modal__subtasks">
              {subtasks.map((subtask) => (
                <li
                  key={subtask.id}
                  className={[
                    'task-modal__subtask-item',
                    subtask.isDone ? 'task-modal__subtask-item_state_done' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <label className="task-modal__subtask-label">
                    <input
                      type="checkbox"
                      name="subtaskToggle"
                      checked={subtask.isDone}
                      onChange={() => handleToggleSubtask(subtask.id)}
                      className="task-modal__subtask-checkbox"
                    />
                    <span className="task-modal__subtask-text">{subtask.title}</span>
                  </label>
                  <button
                    type="button"
                    className="task-modal__subtask-remove"
                    aria-label="Удалить подзадачу"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="task-modal__subtask-input">
              <FormInput
                type="text"
                name="newSubtaskTitle"
                value={newSubtaskTitle}
                onChange={(event) => setNewSubtaskTitle(event.target.value)}
                placeholder="Название подзадачи"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleAddSubtask()
                  }
                }}
                size="compact"
              />
              <button type="button" onClick={handleAddSubtask}>
                Добавить
              </button>
            </div>
          </RevealableSection>

          <RevealableSection
            isOpen={isTagsOpen}
            title="Теги"
            triggerLabel="+ Добавить тег"
            onOpen={() => setTagsOpen(true)}
            onClose={() => setTagsOpen(false)}
          >
            {tags.length > 0 && (
              <ul className="task-modal__tags">
                {tags.map((tag, index) => (
                  <li key={`${tag}-${index}`} className="task-modal__tag">
                    <span>{tag}</span>
                    <button
                      type="button"
                      aria-label="Удалить тег"
                      className="task-modal__tag-remove"
                      onClick={() => handleRemoveTag(index)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="task-modal__tag-input">
              <FormInput
                type="text"
                name="newTagTitle"
                value={newTagTitle}
                onChange={(event) => setNewTagTitle(event.target.value)}
                placeholder="Название тега"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleAddTag()
                  }
                }}
                size="compact"
              />
              <button type="button" onClick={handleAddTag}>
                Добавить
              </button>
            </div>
          </RevealableSection>

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
              <FormInput
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
                size="compact"
              />
            </div>

            <div className="task-modal__field">
              <label htmlFor="assigneeName">Исполнитель</label>
              <FormInput
                id="assigneeName"
                name="assigneeName"
                value={form.assigneeName}
                onChange={handleChange}
                placeholder="Имя исполнителя"
                size="compact"
              />
            </div>
          </div>

          <div className="task-modal__actions">
            <button type="button" className="btn btn_type_secondary" onClick={onClose}>
              Отмена
            </button>
            <button className="btn btn_type_primary" type="submit">
              {isEditMode ? 'Сохранить изменения' : 'Добавить задачу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

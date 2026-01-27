import { useEffect, useRef, useState } from 'react'
import type { Column } from '../types/board'
import { FormInput } from './FormInput'
import './ColumnModal.scss'

interface ColumnModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, accentColor?: string) => void
  columnToEdit?: Column | null
  onUpdate?: (columnId: string, payload: { title: string; accentColor: string }) => void
}

const COLOR_OPTIONS = ['#6d5efc', '#3b82f6', '#f2c94c', '#10b981', '#f59e0b', '#ef4444']

export function ColumnModal({ isOpen, onClose, onSubmit, columnToEdit, onUpdate }: ColumnModalProps) {
  const [title, setTitle] = useState('')
  const [accentColor, setAccentColor] = useState(COLOR_OPTIONS[0])
  const titleInputRef = useRef<HTMLInputElement>(null)
  const isEditMode = Boolean(columnToEdit)

  useEffect(() => {
    if (!isOpen) return
    if (columnToEdit) {
      setTitle(columnToEdit.title)
      setAccentColor(columnToEdit.accentColor)
    } else {
      setTitle('')
      setAccentColor(COLOR_OPTIONS[0])
    }
  }, [columnToEdit, isOpen])

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

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    if (isEditMode && columnToEdit && onUpdate) {
      onUpdate(columnToEdit.id, { title: trimmed, accentColor })
    } else {
      onSubmit(trimmed, accentColor)
    }
    onClose()
  }

  const handleCustomColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccentColor(event.target.value)
  }

  return (
    <div className="column-modal__backdrop" role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div className="column-modal">
        <div className="column-modal__header">
          <h2 className="column-modal__title">{isEditMode ? 'Редактировать колонку' : 'Новая колонка'}</h2>
          <button type="button" className="column-modal__close-btn" aria-label="Закрыть" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="column-modal__form" onSubmit={handleSubmit}>
          <label className="column-modal__field">
            <span>Название</span>
            <FormInput
              name="title"
              ref={titleInputRef}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например, В работе"
              required
            />
          </label>

          <div className="column-modal__field">
            <span>Цвет маркера</span>
            <div className="column-modal__color-grid">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={[
                    'column-modal__color-option',
                    accentColor === color ? 'column-modal__color-option_active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ backgroundColor: color }}
                  aria-label={`Выбрать цвет ${color}`}
                  onClick={() => setAccentColor(color)}
                >
                  {accentColor === color && <span className="column-modal__color-check">✓</span>}
                </button>
              ))}
            </div>
            <label className="column-modal__custom-color" htmlFor="column-accent-color">
              <span>Или укажите свой</span>
              <input
                id="column-accent-color"
                name="accentColorCustom"
                type="color"
                value={accentColor}
                onChange={handleCustomColorChange}
              />
            </label>
          </div>

          <div className="column-modal__actions">
            <button type="button" className="btn btn_type_secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn_type_primary">
              {isEditMode ? 'Сохранить изменения' : 'Создать колонку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

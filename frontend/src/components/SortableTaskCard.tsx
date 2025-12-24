import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CSSProperties } from 'react'
import type { Task } from '../types/board'
import { TaskCard } from './TaskCard'

interface SortableTaskCardProps {
  task: Task
  columnId: string
  onEdit?: (task: Task, columnId: string) => void
}

export function SortableTaskCard({ task, columnId, onEdit }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      columnId,
      task,
    },
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
  }

  const className = ['task-card__draggable', isDragging ? 'task-card__draggable_state_dragging' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
      <TaskCard task={task} columnId={columnId} onEdit={onEdit} />
    </div>
  )
}

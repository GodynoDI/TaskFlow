import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'
import './BoardColumn.scss'

interface ColumnTaskDropZoneProps {
  columnId: string
  children: ReactNode
}

export function ColumnTaskDropZone({ columnId, children }: ColumnTaskDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnId}-dropzone`,
    data: {
      type: 'task-droppable',
      columnId,
    },
  })

  const className = ['board-column__task-zone', isOver ? 'board-column__task-zone_state_over' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  )
}

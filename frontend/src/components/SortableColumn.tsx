import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'
import type { Column, Task } from '../types/board'
import { BoardColumn } from './BoardColumn'

interface SortableColumnProps {
  column: Column
  tasks?: Task[]
  originalTaskCount?: number
  taskListSlot?: ReactNode
}

export function SortableColumn({ column, tasks, originalTaskCount, taskListSlot }: SortableColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id,
    },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const className = ['board-column__draggable', isDragging ? 'board-column__draggable_state_dragging' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={setNodeRef} style={style} className={className}>
      <BoardColumn
        column={column}
        tasks={tasks}
        originalTaskCount={originalTaskCount}
        taskListSlot={taskListSlot}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

import { arrayMove } from '@dnd-kit/sortable'
import { create } from 'zustand'
import type { Board } from '../types/board'

const mockBoard: Board = {
  id: 'board-default',
  title: 'TaskFlow',
  description: 'Доска-досточка',
  columns: [
    {
      id: 'col-1',
      title: 'бэклог',
      accentColor: '#f2c94c',
      tasks: [
        {
          id: 'task-1',
          title: 'Задача 1',
          description: 'Описание 1',
          priority: 'medium',
          dueDate: '2025-01-15',
          tags: ['тег 1'],
          assignee: { name: 'Исполнитель 1', initials: 'И1' },
          subtasks: [
            { id: 'task-1-sub-1', title: 'Подзадача 1', isDone: true },
            { id: 'task-1-sub-2', title: 'Подзадача 2', isDone: false },
            { id: 'task-1-sub-3', title: 'Подзадача 3', isDone: false },
          ],
        },
      ],
    },
    {
      id: 'col-2',
      title: 'В работе',
      accentColor: '#6d5efc',
      tasks: [
        {
          id: 'task-2',
          title: 'Задача 2',
          description: 'Описание 2',
          priority: 'high',
          assignee: { name: 'Исполнитель 2', initials: 'И2' },
          subtasks: [
            { id: 'task-2-sub-1', title: 'Подзадача 1', isDone: true },
            { id: 'task-2-sub-2', title: 'Подзадача 2', isDone: false },
            { id: 'task-2-sub-3', title: 'Подзадача 3', isDone: false },
          ],
        },
        {
          id: 'task-3',
          title: 'Задача 3',
          priority: 'low',
          tags: ['тег 2'],
          assignee: { name: 'Исполнитель 3', initials: 'И3' },
          subtasks: [
            { id: 'task-3-sub-1', title: 'Подзадача 1', isDone: false },
            { id: 'task-3-sub-2', title: 'Подзадача 2', isDone: false },
          ],
        },
      ],
    },
    {
      id: 'col-3',
      title: 'Готово',
      accentColor: '#10b981',
      tasks: [
        {
          id: 'task-4',
          title: 'Задача 4',
          description: 'Описание 4',
          priority: 'low',
          tags: ['тег 3'],
          assignee: { name: 'Исполнитель 4', initials: 'И4' },
          subtasks: [
            { id: 'task-4-sub-1', title: 'Подзадача 1', isDone: true },
            { id: 'task-4-sub-2', title: 'Подзадача 2', isDone: true },
            { id: 'task-4-sub-3', title: 'Подзадача 3', isDone: true },
          ],
        },
      ],
    },
  ],
}

type BoardTask = Board['columns'][number]['tasks'][number]

interface BoardState {
  boards: Board[]
  activeBoardId: string | null
  setBoards: (boards: Board[]) => void
  setActiveBoard: (boardId: string) => void
  addTask: (columnId: string, task: Omit<BoardTask, 'id'>) => void
  updateTask: (params: {
    taskId: string
    fromColumnId: string
    toColumnId?: string
    patch: Partial<Omit<BoardTask, 'id'>>
  }) => void
  toggleSubtask: (params: {
    columnId: string
    taskId: string
    subtaskId: string
    isDone: boolean
  }) => void
  addColumn: (title: string, accentColor?: string) => void
  updateColumn: (columnId: string, payload: { title?: string; accentColor?: string }) => void
  moveColumn: (activeId: string, overId: string) => void
  moveTask: (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetTaskId?: string
  ) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  boards: [mockBoard],
  activeBoardId: mockBoard.id,
  setBoards: (boards) => set({ boards }),
  setActiveBoard: (boardId) => set({ activeBoardId: boardId }),
  addTask: (columnId, task) =>
    set((state) => {
      const newTask: BoardTask = {
        ...task,
        id: crypto.randomUUID(),
        subtasks: task.subtasks?.map((subtask) => ({
          ...subtask,
          id: subtask.id || crypto.randomUUID(),
        })),
      }
      const boards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board
        return {
          ...board,
          columns: board.columns.map((column) =>
            column.id === columnId
              ? { ...column, tasks: [newTask, ...column.tasks] }
              : column
          ),
        }
      })
      return { boards }
    }),
  toggleSubtask: ({ columnId, taskId, subtaskId, isDone }) =>
    set((state) => {
      const boards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board

        const columns = board.columns.map((column) => {
          if (column.id !== columnId) return column

          const tasks = column.tasks.map((task) => {
            if (task.id !== taskId || !task.subtasks) return task

            const subtasks = task.subtasks.map((subtask) =>
              subtask.id === subtaskId ? { ...subtask, isDone } : subtask
            )

            return { ...task, subtasks }
          })

          return { ...column, tasks }
        })

        return { ...board, columns }
      })

      return { boards }
    }),
  updateColumn: (columnId, payload) =>
    set((state) => {
      const boards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board

        const columns = board.columns.map((column) =>
          column.id === columnId ? { ...column, ...payload } : column
        )

        return { ...board, columns }
      })

      return { boards }
    }),
  updateTask: ({ taskId, fromColumnId, toColumnId, patch }) =>
    set((state) => {
      const boards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board

        const columnsCopy = board.columns.map((column) => ({
          ...column,
          tasks: [...column.tasks],
        }))

        const sourceIndex = columnsCopy.findIndex((column) => column.id === fromColumnId)
        if (sourceIndex === -1) return board

        const taskIndex = columnsCopy[sourceIndex].tasks.findIndex((task) => task.id === taskId)
        if (taskIndex === -1) return board

        const [task] = columnsCopy[sourceIndex].tasks.splice(taskIndex, 1)
        const destinationColumnId = toColumnId ?? fromColumnId
        const destinationIndex = columnsCopy.findIndex((column) => column.id === destinationColumnId)
        if (destinationIndex === -1) {
          // вернуть задачу обратно, если целевая колонка не найдена
          columnsCopy[sourceIndex].tasks.splice(taskIndex, 0, task)
          return board
        }

        const updatedTask: BoardTask = {
          ...task,
          ...patch,
        }

        const isSameColumn = destinationColumnId === fromColumnId
        const insertIndex = isSameColumn ? taskIndex : 0
        columnsCopy[destinationIndex].tasks.splice(insertIndex, 0, updatedTask)

        return { ...board, columns: columnsCopy }
      })

      return { boards }
    }),
  addColumn: (title, accentColor) =>
    set((state) => {
      const palette = ['#6d5efc', '#3b82f6', '#f2c94c', '#10b981', '#f59e0b', '#ef4444']

      const boards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board
        const nextAccent =
          accentColor ||
          palette[board.columns.length % palette.length] ||
          '#6d5efc'

        const newColumn = {
          id: crypto.randomUUID(),
          title,
          accentColor: nextAccent,
          tasks: [],
        }
        return { ...board, columns: [...board.columns, newColumn] }
      })

      return { boards }
    }),
  moveColumn: (activeId, overId) =>
    set((state) => {
      const boards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board
        const fromIndex = board.columns.findIndex((column) => column.id === activeId)
        const toIndex = board.columns.findIndex((column) => column.id === overId)
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return board
        return {
          ...board,
          columns: arrayMove(board.columns, fromIndex, toIndex),
        }
      })
      return { boards }
    }),
  moveTask: (taskId, sourceColumnId, targetColumnId, targetTaskId) =>
    set((state) => {
      const boards = state.boards.map((board) => {
        if (board.id !== state.activeBoardId) return board

        const columnsCopy = board.columns.map((column) => ({
          ...column,
          tasks: [...column.tasks],
        }))

        const sourceIndex = columnsCopy.findIndex((column) => column.id === sourceColumnId)
        const targetIndex = columnsCopy.findIndex((column) => column.id === targetColumnId)

        if (sourceIndex === -1 || targetIndex === -1) {
          return board
        }

        const sourceColumn = columnsCopy[sourceIndex]
        const targetColumn = columnsCopy[targetIndex]

        const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === taskId)
        if (taskIndex === -1) {
          return board
        }

        if (targetTaskId && taskId === targetTaskId) {
          return board
        }

        const [task] = sourceColumn.tasks.splice(taskIndex, 1)

        let insertIndex = targetTaskId
          ? targetColumn.tasks.findIndex((task) => task.id === targetTaskId)
          : targetColumn.tasks.length

        if (insertIndex === -1) {
          insertIndex = targetColumn.tasks.length
        }

        const isSameColumn = sourceColumnId === targetColumnId
        if (isSameColumn && taskIndex < insertIndex) {
          insertIndex -= 1
        }

        targetColumn.tasks.splice(insertIndex, 0, task)

        return { ...board, columns: columnsCopy }
      })

      return { boards }
    }),
}))

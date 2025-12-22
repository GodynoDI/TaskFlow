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
          title: '1',
          description: '1',
          priority: 'medium',
          dueDate: '1',
          tags: ['task1', 'col1'],
          assignee: { name: '11111111', initials: '1' },
          subtasks: { completed: 1, total: 3 },
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
          title: '2',
          description: '2',
          priority: 'high',
          assignee: { name: '22222222', initials: '2' },
          subtasks: { completed: 2, total: 4 },
        },
        {
          id: 'task-3',
          title: '3',
          priority: 'low',
          tags: ['task3'],
          assignee: { name: '3333333', initials: '3' },
          subtasks: { completed: 0, total: 2 },
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
          title: '4',
          description: '4',
          priority: 'low',
          tags: ['col3'],
          assignee: { name: '44444444444', initials: '4' },
          subtasks: { completed: 3, total: 4 },
        },
      ],
    },
  ],
}

interface BoardState {
  boards: Board[]
  activeBoardId: string | null
  setBoards: (boards: Board[]) => void
  setActiveBoard: (boardId: string) => void
  addTask: (
    columnId: string,
    task: Omit<Board['columns'][number]['tasks'][number], 'id'>
  ) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  boards: [mockBoard],
  activeBoardId: mockBoard.id,
  setBoards: (boards) => set({ boards }),
  setActiveBoard: (boardId) => set({ activeBoardId: boardId }),
  addTask: (columnId, task) =>
    set((state) => {
      const newTask = { ...task, id: crypto.randomUUID() }
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
}))

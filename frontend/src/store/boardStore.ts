import { arrayMove } from '@dnd-kit/sortable'
import { create } from 'zustand'
import type { Board } from '../types/board'
import { boardsApi } from '../api/boards'
import { columnsApi } from '../api/columns'
import { tasksApi } from '../api/tasks'

type BoardTask = Board['columns'][number]['tasks'][number]

interface BoardState {
  boards: Board[]
  activeBoardId: string | null
  isLoading: boolean
  loadBoards: () => Promise<void>
  loadBoard: (boardId: string) => Promise<void>
  setActiveBoard: (boardId: string) => void
  addTask: (columnId: string, task: Omit<BoardTask, 'id'>) => Promise<void>
  updateTask: (params: {
    taskId: string
    fromColumnId: string
    toColumnId?: string
    patch: Partial<Omit<BoardTask, 'id'>>
  }) => Promise<void>
  toggleSubtask: (params: {
    columnId: string
    taskId: string
    subtaskId: string
    isDone: boolean
  }) => Promise<void>
  addColumn: (title: string, accentColor?: string) => Promise<void>
  updateColumn: (columnId: string, payload: { title?: string; accentColor?: string }) => Promise<void>
  moveColumn: (activeId: string, overId: string) => Promise<void>
  moveTask: (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetTaskId?: string
  ) => Promise<void>
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  activeBoardId: null,
  isLoading: false,
  loadBoards: async () => {
    set({ isLoading: true })
    try {
      const boards = await boardsApi.getAll()
      set({ boards, isLoading: false })
      if (boards.length > 0 && !get().activeBoardId) {
        set({ activeBoardId: boards[0].id })
      }
    } catch (error) {
      console.error('Failed to load boards:', error)
      set({ isLoading: false })
    }
  },
  loadBoard: async (boardId: string) => {
    set({ isLoading: true })
    try {
      const board = await boardsApi.getById(boardId)
      set((state) => {
        const boards = state.boards.map((b) => (b.id === boardId ? board : b))
        if (!boards.find((b) => b.id === boardId)) {
          boards.push(board)
        }
        return { boards, isLoading: false }
      })
    } catch (error) {
      console.error('Failed to load board:', error)
      set({ isLoading: false })
    }
  },
  setActiveBoard: (boardId) => set({ activeBoardId: boardId }),
  addTask: async (columnId, task) => {
    const state = get()
    const boardId = state.activeBoardId
    if (!boardId) return

    try {
      await tasksApi.create(boardId, columnId, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        tags: task.tags,
        assigneeName: task.assignee.name,
        assigneeInitials: task.assignee.initials,
        subtasks: task.subtasks?.map((s) => ({ title: s.title })),
      })

      await get().loadBoard(boardId)
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  },
  toggleSubtask: async ({ columnId, taskId, subtaskId, isDone }) => {
    const state = get()
    const boardId = state.activeBoardId
    if (!boardId) return

    try {
      await tasksApi.toggleSubtask(boardId, columnId, taskId, subtaskId, isDone)
      await get().loadBoard(boardId)
    } catch (error) {
      console.error('Failed to toggle subtask:', error)
    }
  },
  updateColumn: async (columnId, payload) => {
    const state = get()
    const boardId = state.activeBoardId
    if (!boardId) return

    try {
      await columnsApi.update(boardId, columnId, payload)
      await get().loadBoard(boardId)
    } catch (error) {
      console.error('Failed to update column:', error)
    }
  },
  updateTask: async ({ taskId, fromColumnId, toColumnId, patch }) => {
    const state = get()
    const boardId = state.activeBoardId
    if (!boardId) return

    try {
      const updateData: any = {
        title: patch.title,
        description: patch.description,
        priority: patch.priority,
        dueDate: patch.dueDate,
        tags: patch.tags,
        assigneeName: patch.assignee?.name,
        assigneeInitials: patch.assignee?.initials,
        columnId: toColumnId,
      }
      Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key])

      await tasksApi.update(boardId, fromColumnId, taskId, updateData)
      await get().loadBoard(boardId)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  },
  addColumn: async (title, accentColor) => {
    const state = get()
    const boardId = state.activeBoardId
    if (!boardId) return

    try {
      const palette = ['#6d5efc', '#3b82f6', '#f2c94c', '#10b981', '#f59e0b', '#ef4444']
      const activeBoard = state.boards.find((b) => b.id === boardId)
      const nextAccent =
        accentColor ||
        (activeBoard ? palette[activeBoard.columns.length % palette.length] : null) ||
        '#6d5efc'

      await columnsApi.create(boardId, { title, accentColor: nextAccent })
      await get().loadBoard(boardId)
    } catch (error) {
      console.error('Failed to add column:', error)
    }
  },
  moveColumn: async (activeId, overId) => {
    const state = get()
    const boardId = state.activeBoardId
    if (!boardId) return

    const activeBoard = state.boards.find((b) => b.id === boardId)
    if (!activeBoard) return

    const fromIndex = activeBoard.columns.findIndex((column) => column.id === activeId)
    const toIndex = activeBoard.columns.findIndex((column) => column.id === overId)
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return

    const reorderedColumns = arrayMove(activeBoard.columns, fromIndex, toIndex)
    const columnIds = reorderedColumns.map((col) => col.id)

    try {
      await columnsApi.reorder(boardId, columnIds)
      await get().loadBoard(boardId)
    } catch (error) {
      console.error('Failed to move column:', error)
    }
  },
  moveTask: async (taskId, sourceColumnId, targetColumnId, targetTaskId) => {
    const state = get()
    const boardId = state.activeBoardId
    if (!boardId) return

    try {
      await tasksApi.move(boardId, sourceColumnId, taskId, {
        targetColumnId,
        targetTaskId,
      })
      await get().loadBoard(boardId)
    } catch (error) {
      console.error('Failed to move task:', error)
    }
  },
}))

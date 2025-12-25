export type TaskPriority = 'high' | 'medium' | 'low'

export interface TaskSubtask {
  id: string
  title: string
  isDone: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  tags?: string[]
  priority: TaskPriority
  assignee: {
    name: string
    initials: string
  }
  subtasks?: TaskSubtask[]
}

export interface Column {
  id: string
  title: string
  accentColor: string
  tasks: Task[]
}

export interface Board {
  id: string
  title: string
  description?: string
  columns: Column[]
}

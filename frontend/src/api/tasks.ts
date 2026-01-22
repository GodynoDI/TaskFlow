import { api } from './client';
import type { Task, TaskSubtask } from '../types/board';

export const tasksApi = {
  create: async (
    boardId: string,
    columnId: string,
    data: {
      title: string;
      description?: string;
      priority: string;
      dueDate?: string;
      tags?: string[];
      assigneeName: string;
      assigneeInitials: string;
      subtasks?: { title: string }[];
    }
  ): Promise<Task> => {
    const response = await api.post(`/boards/${boardId}/columns/${columnId}/tasks`, data);
    return response.data;
  },

  update: async (
    boardId: string,
    columnId: string,
    taskId: string,
    data: {
      title?: string;
      description?: string;
      priority?: string;
      dueDate?: string;
      tags?: string[];
      assigneeName?: string;
      assigneeInitials?: string;
      columnId?: string;
    }
  ): Promise<Task> => {
    const response = await api.patch(`/boards/${boardId}/columns/${columnId}/tasks/${taskId}`, data);
    return response.data;
  },

  delete: async (boardId: string, columnId: string, taskId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}/columns/${columnId}/tasks/${taskId}`);
  },

  move: async (
    boardId: string,
    columnId: string,
    taskId: string,
    data: { targetColumnId: string; targetTaskId?: string }
  ): Promise<void> => {
    await api.post(`/boards/${boardId}/columns/${columnId}/tasks/${taskId}/move`, data);
  },

  toggleSubtask: async (
    boardId: string,
    columnId: string,
    taskId: string,
    subtaskId: string,
    isDone: boolean
  ): Promise<TaskSubtask> => {
    const response = await api.patch(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/subtasks/${subtaskId}?isDone=${isDone}`
    );
    return response.data;
  },
};

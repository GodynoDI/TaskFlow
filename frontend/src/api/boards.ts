import { api } from './client';
import type { Board } from '../types/board';

export const boardsApi = {
  getAll: async (): Promise<Board[]> => {
    const response = await api.get('/boards');
    return response.data;
  },

  getById: async (id: string): Promise<Board> => {
    const response = await api.get(`/boards/${id}`);
    return response.data;
  },

  create: async (data: { title: string; description?: string }): Promise<Board> => {
    const response = await api.post('/boards', data);
    return response.data;
  },

  update: async (id: string, data: { title?: string; description?: string }): Promise<Board> => {
    const response = await api.patch(`/boards/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },
};

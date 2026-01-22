import { api } from './client';
import type { Column } from '../types/board';

export const columnsApi = {
  create: async (boardId: string, data: { title: string; accentColor?: string }): Promise<Column> => {
    const response = await api.post(`/boards/${boardId}/columns`, data);
    return response.data;
  },

  update: async (
    boardId: string,
    columnId: string,
    data: { title?: string; accentColor?: string }
  ): Promise<Column> => {
    const response = await api.patch(`/boards/${boardId}/columns/${columnId}`, data);
    return response.data;
  },

  delete: async (boardId: string, columnId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}/columns/${columnId}`);
  },

  reorder: async (boardId: string, columnIds: string[]): Promise<void> => {
    await api.post(`/boards/${boardId}/columns/reorder`, { columnIds });
  },
};

import { create } from "zustand";

interface BoardState {
  boards: any[];
  setBoards: (boards: any[]) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  boards: [],
  setBoards: (boards) => set({ boards }),
}));

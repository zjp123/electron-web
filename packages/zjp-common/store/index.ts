import create from "zustand";

type State = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

export const useStore = create<State>((set) => ({
  isAuthenticated: false,
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
}));

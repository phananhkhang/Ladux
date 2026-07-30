import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface UIState {
  theme: ThemeMode;
  isSidebarOpen: boolean;
  isCartDrawerOpen: boolean;
  isSearchModalOpen: boolean;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleCartDrawer: () => void;
  setCartDrawerOpen: (isOpen: boolean) => void;
  toggleSearchModal: () => void;
  setSearchModalOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  isSidebarOpen: true,
  isCartDrawerOpen: false,
  isSearchModalOpen: false,

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  setTheme: (theme) => set({ theme }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  toggleCartDrawer: () =>
    set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

  setCartDrawerOpen: (isOpen) => set({ isCartDrawerOpen: isOpen }),

  toggleSearchModal: () =>
    set((state) => ({ isSearchModalOpen: !state.isSearchModalOpen })),

  setSearchModalOpen: (isOpen) => set({ isSearchModalOpen: isOpen }),
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAppStore = create(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isDarkTheme: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleDarkTheme: () =>
        set((state) => ({ isDarkTheme: !state.isDarkTheme })),
    }),
    {
      name: "appStore", // unique name for the storage
      getStorage: () => localStorage, // use localStorage
    }
  )
);

export default useAppStore;

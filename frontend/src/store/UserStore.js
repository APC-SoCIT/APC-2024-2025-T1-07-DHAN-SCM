import { create } from "zustand";

const useUserStore = create((set) => ({
  id: null,
  name: "",
  roles: [],
  type: "All",
  // status: "For Verification",
  setUser: (user) => set((state) => ({ ...state, ...user })),
}));

export default useUserStore;

// store/user-edit-store.ts
import { create } from "zustand";

interface UserEditData {
  id: string;
  full_name: string;
  email: string;
  user_name: string;
}

type UserEditModalStore = {
  isOpen: boolean;
  userId: string | null;
  open: (id: string) => void;
  close: () => void;
  currentUser?: UserEditData;
  setCurrentUserData: (data: UserEditData) => void;
};

export const useUserEditModal = create<UserEditModalStore>((set) => ({
  isOpen: false,
  userId: null,
  currentUser: { id: "", full_name: "", email: "", user_name: "" },
  setCurrentUserData: (data) => set({ currentUser: data, isOpen: true }),
  open: (id: string) => set({ isOpen: true, userId: id }),
  close: () => set({ isOpen: false, userId: null }),
}));
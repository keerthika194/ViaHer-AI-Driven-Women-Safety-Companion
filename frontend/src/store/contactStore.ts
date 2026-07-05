import { create } from "zustand";
import api from "../services/api";

export interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface ContactState {
  contacts: Contact[];
  loading: boolean;
  fetched: boolean;
  fetchContacts: () => Promise<void>;
  addContact: (data: {
    name: string;
    phone?: string;
    email?: string;
  }) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  reset: () => void;
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  loading: false,
  fetched: false,

  fetchContacts: async () => {
    if (get().fetched) return;
    set({ loading: true });
    try {
      const res = await api.get("/contacts/");
      set({ contacts: res.data, fetched: true });
    } catch (_err) {
      console.error("Failed to fetch contacts", _err);
      set({ fetched: true });
    } finally {
      set({ loading: false });
    }
  },

  addContact: async (data) => {
    const res = await api.post("/contacts/", data);
    set((s) => ({ contacts: [...s.contacts, res.data] }));
  },

  deleteContact: async (id) => {
    await api.delete(`/contacts/${id}`);
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) }));
  },

  reset: () => set({ contacts: [], fetched: false, loading: false }),
}));

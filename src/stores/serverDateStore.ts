// src/stores/serverDateStore.ts
import { create } from "zustand";

interface ServerDateState {
  serverDate: string | null;
  lastSync: number | null;
  setServerDate: (date: string) => void;
  getAdjustedTime: () => Date;
}

export const useServerDateStore = create<ServerDateState>((set, get) => ({
  serverDate: null,
  lastSync: null,

  setServerDate: (date: string) => {
    set({
      serverDate: date,
      lastSync: Date.now(),
    });
  },

  getAdjustedTime: () => {
    const { serverDate, lastSync } = get();
    
    if (!serverDate || !lastSync) {
      return new Date();
    }

    const serverTime = new Date(serverDate);
    const elapsed = Date.now() - lastSync;
    
    return new Date(serverTime.getTime() + elapsed);
  },
}));
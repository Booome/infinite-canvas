import { create } from "zustand";
import { nanoid } from "nanoid";

export type AppLogEntry = {
    id: string;
    time: number;
    title: string;
    detail?: string;
};

const APP_LOG_LIMIT = 100;

type AppLogState = {
    entries: AppLogEntry[];
    logError: (title: string, detail?: string) => void;
    clear: () => void;
};

export const useAppLogStore = create<AppLogState>((set) => ({
    entries: [],
    logError: (title, detail) => set((state) => ({ entries: [{ id: nanoid(), time: Date.now(), title, detail }, ...state.entries].slice(0, APP_LOG_LIMIT) })),
    clear: () => set({ entries: [] }),
}));

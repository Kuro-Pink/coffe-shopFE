import { create } from 'zustand';

interface SoundState {
  enabled: boolean;
  enable: () => void;
  disable: () => void;
}

export const useSoundStore = create<SoundState>((set) => ({
  enabled: false,
  enable: () => set({ enabled: true }),
  disable: () => set({ enabled: false }),
}));
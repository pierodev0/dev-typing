import { create } from 'zustand';
import type { Char, GameStats, GameOptions } from '@/types';
import { parseCodeToChars } from '@/lib/parser';

interface GameStore {
  chars: Char[];
  cursor: number;
  stats: GameStats;
  isFinished: boolean;
  code: string;
  lang: string;
  langName: string;
  startTime: number | null;
  options: GameOptions;
  
  initGame: (code: string, lang: string, options?: GameOptions) => void;
  resetGame: () => void;
  setCursor: (cursor: number) => void;
  setStats: (stats: Partial<GameStats>) => void;
  updateChar: (index: number, updates: Partial<Char>) => void;
  finishGame: () => void;
  incrementErrors: () => void;
  startTimer: () => void;
}

const initialStats: GameStats = {
  wpm: 0,
  acc: 100,
  time: 0,
  errors: 0,
  started: false,
};

const defaultOptions: GameOptions = {
  stopOnError: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  chars: [],
  cursor: 0,
  stats: initialStats,
  isFinished: false,
  code: '',
  lang: '',
  langName: '',
  startTime: null,
  options: defaultOptions,

  initGame: (code: string, lang: string, options?: GameOptions) => {
    const { chars, detectedLang } = parseCodeToChars(code, lang);
    set({
      chars,
      cursor: 0,
      stats: initialStats,
      isFinished: false,
      code,
      lang,
      langName: lang === 'auto' ? detectedLang : lang,
      startTime: null,
      options: options || defaultOptions,
    });
  },

  resetGame: () => {
    const { code, lang, options } = get();
    const { chars, detectedLang } = parseCodeToChars(code, lang);
    set({
      chars,
      cursor: 0,
      stats: initialStats,
      isFinished: false,
      langName: lang === 'auto' ? detectedLang : lang,
      startTime: null,
      options,
    });
  },

  setCursor: (cursor: number) => set({ cursor }),

  setStats: (newStats: Partial<GameStats>) => 
    set((state) => ({ stats: { ...state.stats, ...newStats } })),

  updateChar: (index: number, updates: Partial<Char>) =>
    set((state) => {
      const chars = [...state.chars];
      chars[index] = { ...chars[index], ...updates };
      return { chars };
    }),

  finishGame: () => {
    const { chars, cursor, startTime, stats } = get();
    const now = Date.now();
    const totalTimeMs = startTime ? now - startTime : 0;
    const mins = totalTimeMs / 60000;
    
    const correct = chars.slice(0, cursor).filter((c) => c.status === 'correct').length;
    const attempted = cursor;
    
    const finalWpm = mins > 0 ? Math.round((correct / 5) / mins) : 0;
    const finalAcc = attempted > 0 
      ? Math.round(((attempted - stats.errors) / attempted) * 100) 
      : 0;

    set({
      isFinished: true,
      stats: {
        ...stats,
        wpm: finalWpm,
        acc: Math.max(0, finalAcc),
        time: Math.floor(totalTimeMs / 1000),
      },
    });
  },

  incrementErrors: () =>
    set((state) => ({
      stats: { ...state.stats, errors: state.stats.errors + 1 },
    })),

  startTimer: () => {
    set({
      startTime: Date.now(),
      stats: { ...get().stats, started: true },
    });
  },
}));

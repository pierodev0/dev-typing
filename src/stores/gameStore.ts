import { create } from 'zustand';
import type { Char, GameStats, GameOptions, PracticeState } from '@/types';
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
  practiceState: PracticeState;
  pausedTime: number | null;
  
  initGame: (code: string, lang: string, options?: GameOptions) => void;
  resetGame: () => void;
  setCursor: (cursor: number) => void;
  setStats: (stats: Partial<GameStats>) => void;
  updateChar: (index: number, updates: Partial<Char>) => void;
  finishGame: () => void;
  incrementErrors: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  startPractice: (word: string, errorIndex: number) => void;
  updatePracticeInput: (input: string) => void;
  incrementPracticeCount: () => void;
  resetPracticeCount: () => void;
  exitPractice: () => void;
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
  timeLimit: null,
  practiceMode: false,
  practiceRepetitions: 5,
};

const initialPracticeState: PracticeState = {
  isActive: false,
  targetWord: '',
  currentInput: '',
  repetitionCount: 0,
  requiredRepetitions: 5,
  errorCharIndex: 0,
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
  practiceState: initialPracticeState,
  pausedTime: null,

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
      practiceState: {
        ...initialPracticeState,
        requiredRepetitions: options?.practiceRepetitions || 5,
      },
      pausedTime: null,
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
      practiceState: {
        ...initialPracticeState,
        requiredRepetitions: options.practiceRepetitions,
      },
      pausedTime: null,
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
    const { chars, cursor, startTime, stats, pausedTime } = get();
    const now = Date.now();
    const totalPausedMs = pausedTime || 0;
    const totalTimeMs = startTime ? (now - startTime - totalPausedMs) : 0;
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

  pauseTimer: () => {
    const { startTime, pausedTime } = get();
    if (startTime) {
      const now = Date.now();
      const elapsed = now - startTime;
      set({
        startTime: null,
        pausedTime: (pausedTime || 0) + elapsed,
      });
    }
  },

  resumeTimer: () => {
    set({ startTime: Date.now() });
  },

  startPractice: (word: string, errorIndex: number) => {
    const { options } = get();
    set({
      practiceState: {
        isActive: true,
        targetWord: word,
        currentInput: '',
        repetitionCount: 0,
        requiredRepetitions: options.practiceRepetitions,
        errorCharIndex: errorIndex,
      },
    });
  },

  updatePracticeInput: (input: string) => {
    set((state) => ({
      practiceState: { ...state.practiceState, currentInput: input },
    }));
  },

  incrementPracticeCount: () => {
    set((state) => ({
      practiceState: {
        ...state.practiceState,
        repetitionCount: state.practiceState.repetitionCount + 1,
        currentInput: '',
      },
    }));
  },

  resetPracticeCount: () => {
    set((state) => ({
      practiceState: {
        ...state.practiceState,
        repetitionCount: 0,
        currentInput: '',
      },
    }));
  },

  exitPractice: () => {
    const { practiceState, chars } = get();
    const newChars = [...chars];
    for (let i = 0; i < practiceState.targetWord.length; i++) {
      const charIndex = practiceState.errorCharIndex - 
        Math.min(practiceState.errorCharIndex, practiceState.targetWord.length - 1) + i;
      if (charIndex >= 0 && charIndex < newChars.length) {
        newChars[charIndex] = { ...newChars[charIndex], status: 'correct', typed: newChars[charIndex].char };
      }
    }
    
    const newCursor = Math.min(practiceState.errorCharIndex + 1, chars.length);
    
    set({
      chars: newChars,
      cursor: newCursor,
      practiceState: initialPracticeState,
    });
  },
}));

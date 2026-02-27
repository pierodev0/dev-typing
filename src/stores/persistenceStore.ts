import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedSnippet, ExerciseResult, CustomLanguage, SavedSequence } from '@/types';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

const generateSnippetName = (): string => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
    style: 'capital',
  });
};

const LANGUAGE_COLORS = [
  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-green-500/20 text-green-400 border-green-500/30',
  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'bg-red-500/20 text-red-400 border-red-500/30',
  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'bg-teal-500/20 text-teal-400 border-teal-500/30',
];

interface PersistenceStore {
  snippets: SavedSnippet[];
  customLanguages: CustomLanguage[];
  sequences: SavedSequence[];
  
  addSnippet: (name: string, code: string, lang: string) => string;
  findOrCreateSnippet: (code: string, lang: string) => string;
  updateSnippet: (id: string, name: string, code: string, lang: string) => void;
  renameSnippet: (id: string, name: string) => void;
  changeSnippetLanguage: (id: string, lang: string) => void;
  deleteSnippet: (id: string) => void;
  addResult: (snippetId: string, result: Omit<ExerciseResult, 'id' | 'date'>) => void;
  getSnippet: (id: string) => SavedSnippet | undefined;
  getSnippetByCode: (code: string) => SavedSnippet | undefined;
  clearHistory: (snippetId: string) => void;
  
  addCustomLanguage: (name: string) => string;
  renameCustomLanguage: (id: string, name: string) => void;
  deleteCustomLanguage: (id: string) => void;
  getCustomLanguage: (id: string) => CustomLanguage | undefined;

  addSequence: (name: string, snippetIds: string[]) => string;
  renameSequence: (id: string, name: string) => void;
  deleteSequence: (id: string) => void;
  updateSequenceLastPracticed: (id: string) => void;
  getSequence: (id: string) => SavedSequence | undefined;
}

export const usePersistenceStore = create<PersistenceStore>()(
  persist(
    (set, get) => ({
      snippets: [],
      customLanguages: [],
      sequences: [],

      addSnippet: (name: string, code: string, lang: string) => {
        const id = `snippet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSnippet: SavedSnippet = {
          id,
          name,
          code,
          lang,
          createdAt: new Date().toISOString(),
          results: [],
        };
        set((state) => ({
          snippets: [...state.snippets, newSnippet],
        }));
        return id;
      },

      findOrCreateSnippet: (code: string, lang: string) => {
        const existing = get().snippets.find(s => s.code === code);
        if (existing) {
          return existing.id;
        }
        return get().addSnippet(generateSnippetName(), code, lang);
      },

      updateSnippet: (id: string, name: string, code: string, lang: string) => {
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === id ? { ...s, name, code, lang } : s
          ),
        }));
      },

      renameSnippet: (id: string, name: string) => {
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === id ? { ...s, name } : s
          ),
        }));
      },

      changeSnippetLanguage: (id: string, lang: string) => {
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === id ? { ...s, lang } : s
          ),
        }));
      },

      deleteSnippet: (id: string) => {
        set((state) => ({
          snippets: state.snippets.filter((s) => s.id !== id),
        }));
      },

      addResult: (snippetId: string, result: Omit<ExerciseResult, 'id' | 'date'>) => {
        const newResult: ExerciseResult = {
          ...result,
          id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
        };
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === snippetId
              ? { ...s, results: [...s.results, newResult] }
              : s
          ),
        }));
      },

      getSnippet: (id: string) => {
        return get().snippets.find((s) => s.id === id);
      },

      getSnippetByCode: (code: string) => {
        return get().snippets.find((s) => s.code === code);
      },

      clearHistory: (snippetId: string) => {
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === snippetId ? { ...s, results: [] } : s
          ),
        }));
      },

      addCustomLanguage: (name: string) => {
        const id = `lang_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const colorIndex = get().customLanguages.length % LANGUAGE_COLORS.length;
        const newLanguage: CustomLanguage = {
          id,
          name,
          color: LANGUAGE_COLORS[colorIndex],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          customLanguages: [...state.customLanguages, newLanguage],
        }));
        return id;
      },

      renameCustomLanguage: (id: string, name: string) => {
        set((state) => ({
          customLanguages: state.customLanguages.map((l) =>
            l.id === id ? { ...l, name } : l
          ),
        }));
      },

      deleteCustomLanguage: (id: string) => {
        const lang = get().customLanguages.find(l => l.id === id);
        if (lang) {
          set((state) => ({
            customLanguages: state.customLanguages.filter((l) => l.id !== id),
            snippets: state.snippets.map((s) =>
              s.lang === id ? { ...s, lang: 'other' } : s
            ),
          }));
        }
      },

      getCustomLanguage: (id: string) => {
        return get().customLanguages.find((l) => l.id === id);
      },

      addSequence: (name: string, snippetIds: string[]) => {
        const id = `sequence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSequence: SavedSequence = {
          id,
          name,
          snippetIds,
          createdAt: new Date().toISOString(),
          lastPracticedAt: null,
        };
        set((state) => ({
          sequences: [...state.sequences, newSequence],
        }));
        return id;
      },

      renameSequence: (id: string, name: string) => {
        set((state) => ({
          sequences: state.sequences.map((seq) =>
            seq.id === id ? { ...seq, name } : seq
          ),
        }));
      },

      deleteSequence: (id: string) => {
        set((state) => ({
          sequences: state.sequences.filter((seq) => seq.id !== id),
        }));
      },

      updateSequenceLastPracticed: (id: string) => {
        set((state) => ({
          sequences: state.sequences.map((seq) =>
            seq.id === id ? { ...seq, lastPracticedAt: new Date().toISOString() } : seq
          ),
        }));
      },

      getSequence: (id: string) => {
        return get().sequences.find((seq) => seq.id === id);
      },
    }),
    {
      name: 'devtype-storage',
      migrate: (persisted: any) => {
        if (persisted.snippets) {
          persisted.snippets = persisted.snippets.map((s: any) => {
            const { categoryId, ...rest } = s;
            return { ...rest, lang: s.lang || 'other' };
          });
        }
        if (!persisted.customLanguages) {
          persisted.customLanguages = [];
        }
        if (!persisted.sequences) {
          persisted.sequences = [];
        }
        delete persisted.categories;
        return persisted;
      },
    }
  )
);

export const getLanguageColor = (langId: string, customLanguages: CustomLanguage[]): string => {
  const customLang = customLanguages.find(l => l.id === langId);
  if (customLang) {
    return customLang.color;
  }
  
  const PREDEFINED_COLORS: Record<string, string> = {
    js: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    ts: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    py: 'bg-green-500/20 text-green-400 border-green-500/30',
    rust: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    go: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    cpp: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    java: 'bg-red-500/20 text-red-400 border-red-500/30',
    other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  
  return PREDEFINED_COLORS[langId] || PREDEFINED_COLORS.other;
};

export const getLanguageName = (langId: string, customLanguages: CustomLanguage[]): string => {
  const customLang = customLanguages.find(l => l.id === langId);
  if (customLang) {
    return customLang.name;
  }
  
  const PREDEFINED_NAMES: Record<string, string> = {
    js: 'JS',
    ts: 'TS',
    py: 'PY',
    rust: 'Rust',
    go: 'Go',
    cpp: 'C++',
    java: 'Java',
    other: 'Other',
  };
  
  return PREDEFINED_NAMES[langId] || langId.toUpperCase();
};

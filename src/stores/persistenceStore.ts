import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedSnippet, ExerciseResult, Category } from '@/types';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

const generateSnippetName = (): string => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
    style: 'capital',
  });
};

interface PersistenceStore {
  snippets: SavedSnippet[];
  categories: Category[];
  
  addSnippet: (name: string, code: string, lang: string, categoryId?: string | null) => string;
  findOrCreateSnippet: (code: string, lang: string) => string;
  updateSnippet: (id: string, name: string, code: string, lang: string) => void;
  renameSnippet: (id: string, name: string) => void;
  moveSnippetToCategory: (id: string, categoryId: string | null) => void;
  deleteSnippet: (id: string) => void;
  addResult: (snippetId: string, result: Omit<ExerciseResult, 'id' | 'date'>) => void;
  getSnippet: (id: string) => SavedSnippet | undefined;
  getSnippetByCode: (code: string) => SavedSnippet | undefined;
  clearHistory: (snippetId: string) => void;
  
  addCategory: (name: string, lang: string) => string;
  renameCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  getCategory: (id: string) => Category | undefined;
  getCategoriesByLang: (lang: string) => Category[];
}

export const usePersistenceStore = create<PersistenceStore>()(
  persist(
    (set, get) => ({
      snippets: [],
      categories: [],

      addSnippet: (name: string, code: string, lang: string, categoryId?: string | null) => {
        const id = `snippet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSnippet: SavedSnippet = {
          id,
          name,
          code,
          lang,
          categoryId: categoryId || null,
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

      moveSnippetToCategory: (id: string, categoryId: string | null) => {
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === id ? { ...s, categoryId } : s
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

      addCategory: (name: string, lang: string) => {
        const id = `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newCategory: Category = {
          id,
          name,
          lang,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
        return id;
      },

      renameCategory: (id: string, name: string) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        }));
      },

      deleteCategory: (id: string) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          snippets: state.snippets.map((s) =>
            s.categoryId === id ? { ...s, categoryId: null } : s
          ),
        }));
      },

      getCategory: (id: string) => {
        return get().categories.find((c) => c.id === id);
      },

      getCategoriesByLang: (lang: string) => {
        return get().categories.filter((c) => c.lang === lang);
      },
    }),
    {
      name: 'devtype-storage',
      migrate: (persisted: any) => {
        if (persisted.snippets) {
          persisted.snippets = persisted.snippets.map((s: any) => ({
            ...s,
            categoryId: s.categoryId || null,
          }));
        }
        if (!persisted.categories) {
          persisted.categories = [];
        }
        return persisted;
      },
    }
  )
);

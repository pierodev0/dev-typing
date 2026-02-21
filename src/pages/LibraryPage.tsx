import { useState } from 'react';
import { usePersistenceStore } from '@/stores/persistenceStore';
import type { SavedSnippet, ExerciseResult } from '@/types';

interface LibraryPageProps {
  onBack: () => void;
  onStartGame: (code: string, lang: string) => void;
}

const PREDEFINED_LANGS = [
  { id: 'js', label: 'JS', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { id: 'ts', label: 'TS', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'py', label: 'PY', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 'rust', label: 'Rust', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'go', label: 'Go', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 'cpp', label: 'C++', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { id: 'java', label: 'Java', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

const LANG_COLORS: Record<string, string> = {
  js: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ts: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  py: 'bg-green-500/20 text-green-400 border-green-500/30',
  rust: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  go: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  cpp: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  java: 'bg-red-500/20 text-red-400 border-red-500/30',
  auto: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

const getBestResult = (results: ExerciseResult[]): ExerciseResult | null => {
  if (results.length === 0) return null;
  return results.reduce((best, curr) => 
    (curr.wpm > best.wpm || (curr.wpm === best.wpm && curr.acc > best.acc)) ? curr : best
  );
};

const getProgress = (results: ExerciseResult[]): { improved: boolean; diff: number } | null => {
  if (results.length < 2) return null;
  const last = results[results.length - 1];
  const prev = results[results.length - 2];
  const diff = last.wpm - prev.wpm;
  return { improved: diff > 0, diff };
};

export const LibraryPage = ({ onBack, onStartGame }: LibraryPageProps) => {
  const snippets = usePersistenceStore((state) => state.snippets);
  const categories = usePersistenceStore((state) => state.categories);
  const deleteSnippet = usePersistenceStore((state) => state.deleteSnippet);
  const clearHistory = usePersistenceStore((state) => state.clearHistory);
  const renameSnippet = usePersistenceStore((state) => state.renameSnippet);
  const moveSnippetToCategory = usePersistenceStore((state) => state.moveSnippetToCategory);
  const addCategory = usePersistenceStore((state) => state.addCategory);
  
  const [selectedSnippet, setSelectedSnippet] = useState<SavedSnippet | null>(null);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLang, setNewCategoryLang] = useState<string | null>(null);
  const [movingSnippet, setMovingSnippet] = useState<SavedSnippet | null>(null);

  const handlePlay = (snippet: SavedSnippet) => {
    onStartGame(snippet.code, snippet.lang);
  };

  const handleStartRename = (snippet: SavedSnippet) => {
    setRenamingId(snippet.id);
    setRenameValue(snippet.name);
  };

  const handleRename = (id: string) => {
    if (renameValue.trim()) {
      renameSnippet(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleCancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim() && newCategoryLang) {
      addCategory(newCategoryName.trim(), newCategoryLang);
      setNewCategoryName('');
      setNewCategoryLang(null);
      setShowNewCategory(false);
    }
  };

  const handleMoveToCategory = (snippetId: string, categoryId: string | null) => {
    moveSnippetToCategory(snippetId, categoryId);
    setMovingSnippet(null);
  };

  const filteredSnippets = snippets.filter(s => {
    if (selectedCategoryId) {
      return s.categoryId === selectedCategoryId;
    }
    if (selectedLang) {
      return s.lang === selectedLang && !s.categoryId;
    }
    if (selectedLang === null && !selectedCategoryId) {
      return true;
    }
    return false;
  });

  const getCategoriesForLang = (lang: string) => {
    return categories.filter(c => c.lang === lang);
  };

  const getLangCount = (langId: string) => {
    return snippets.filter(s => s.lang === langId).length;
  };

  const MoveCategoryModal = ({ snippet }: { snippet: SavedSnippet }) => {
    const [newCatName, setNewCatName] = useState('');
    const [showNewCat, setShowNewCat] = useState(false);
    const langCategories = getCategoriesForLang(snippet.lang);
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-tokyo-bg-dark border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-1">Move to Category</h3>
          <p className="text-sm text-gray-500 mb-4">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${LANG_COLORS[snippet.lang] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
              {snippet.lang.toUpperCase()}
            </span>
            <span className="ml-2">{snippet.name}</span>
          </p>
          
          <div className="space-y-2 mb-4">
            <button
              onClick={() => handleMoveToCategory(snippet.id, null)}
              className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <i className="fa-solid fa-inbox mr-2 text-gray-500"></i>
              No category
            </button>
            
            {langCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleMoveToCategory(snippet.id, cat.id)}
                className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <i className="fa-solid fa-folder mr-2 text-tokyo-purple"></i>
                {cat.name}
                {snippet.categoryId === cat.id && (
                  <span className="ml-2 text-xs text-tokyo-green">(current)</span>
                )}
              </button>
            ))}
          </div>
          
          {showNewCat ? (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCatName.trim()) {
                    const catId = addCategory(newCatName.trim(), snippet.lang);
                    handleMoveToCategory(snippet.id, catId);
                  }
                }}
                placeholder="New category name..."
                className="input input-sm bg-tokyo-bg-darkest border-white/10 text-white flex-1"
                autoFocus
              />
              <button 
                onClick={() => {
                  if (newCatName.trim()) {
                    const catId = addCategory(newCatName.trim(), snippet.lang);
                    handleMoveToCategory(snippet.id, catId);
                  }
                }}
                className="btn btn-primary btn-sm"
              >
                Create
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewCat(true)}
              className="w-full px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-gray-400 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              New Category
            </button>
          )}
          
          <button 
            onClick={() => setMovingSnippet(null)} 
            className="btn btn-ghost btn-sm w-full mt-2 text-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  if (selectedSnippet) {
    const currentSnippet = snippets.find(s => s.id === selectedSnippet.id) || selectedSnippet;
    const best = getBestResult(currentSnippet.results);
    const progress = getProgress(currentSnippet.results);
    const snippetCategory = currentSnippet.categoryId 
      ? categories.find(c => c.id === currentSnippet.categoryId) 
      : null;
    
    return (
      <div className="min-h-screen bg-tokyo-bg-darkest text-tokyo-text p-4 md:p-8">
        {movingSnippet && <MoveCategoryModal snippet={movingSnippet} />}
        
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setSelectedSnippet(null)} 
              className="btn btn-ghost btn-sm text-gray-400"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i> Back
            </button>
          </div>

          <div className="bg-tokyo-bg-dark border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {renamingId === currentSnippet.id ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(currentSnippet.id);
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      className="input input-sm bg-tokyo-bg-darkest border-white/10 text-white text-xl font-bold"
                      autoFocus
                    />
                    <button 
                      onClick={() => handleRename(currentSnippet.id)} 
                      className="btn btn-primary btn-sm"
                    >
                      <i className="fa-solid fa-check"></i>
                    </button>
                    <button 
                      onClick={handleCancelRename} 
                      className="btn btn-ghost btn-sm text-gray-400"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white">{currentSnippet.name}</h1>
                    <button 
                      onClick={() => handleStartRename(currentSnippet)} 
                      className="btn btn-ghost btn-xs text-gray-500 hover:text-white"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${LANG_COLORS[currentSnippet.lang] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                    {currentSnippet.lang.toUpperCase()}
                  </span>
                  {snippetCategory && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-tokyo-purple/20 text-tokyo-purple border border-tokyo-purple/30">
                      {snippetCategory.name}
                    </span>
                  )}
                  <span className="text-gray-500 text-xs">
                    Created {formatDate(currentSnippet.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setMovingSnippet(currentSnippet)} 
                  className="btn btn-ghost btn-sm text-gray-400"
                >
                  <i className="fa-solid fa-folder mr-1"></i> Move
                </button>
                <button 
                  onClick={() => handlePlay(currentSnippet)} 
                  className="btn btn-primary btn-sm"
                >
                  <i className="fa-solid fa-play mr-1"></i> Play
                </button>
                <button 
                  onClick={() => clearHistory(currentSnippet.id)} 
                  className="btn btn-ghost btn-sm text-gray-400"
                >
                  Clear History
                </button>
              </div>
            </div>

            {best && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 uppercase mb-1">Best WPM</div>
                  <div className="text-xl font-bold text-tokyo-green">{best.wpm}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 uppercase mb-1">Best Accuracy</div>
                  <div className="text-xl font-bold text-tokyo-blue">{best.acc}%</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 uppercase mb-1">Total Attempts</div>
                  <div className="text-xl font-bold text-white">{currentSnippet.results.length}</div>
                </div>
              </div>
            )}

            <div className="bg-tokyo-bg-darkest rounded-xl p-4 max-h-48 overflow-auto">
              <pre className="text-sm text-gray-400 font-mono whitespace-pre-wrap">{currentSnippet.code}</pre>
            </div>
          </div>

          <h2 className="text-lg font-bold text-white mb-4">History</h2>
          
          {currentSnippet.results.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No attempts yet. Play this snippet to track your progress!
            </div>
          ) : (
            <div className="space-y-2">
              {[...currentSnippet.results].reverse().map((result, index) => (
                <div 
                  key={result.id} 
                  className="bg-tokyo-bg-dark border border-white/10 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-gray-500 text-sm w-8">#{currentSnippet.results.length - index}</div>
                    <div>
                      <div className="text-white font-medium">{formatDate(result.date)}</div>
                      <div className="text-gray-500 text-sm">{formatTime(result.time)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase">WPM</div>
                      <div className="text-lg font-bold text-white">{result.wpm}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase">Acc</div>
                      <div className="text-lg font-bold text-white">{result.acc}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase">Errors</div>
                      <div className="text-lg font-bold text-red-400">{result.errors}</div>
                    </div>
                    {index === 0 && progress && (
                      <div className={`text-sm font-medium ${progress.improved ? 'text-green-400' : 'text-red-400'}`}>
                        {progress.improved ? '+' : ''}{progress.diff} WPM
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tokyo-bg-darkest text-tokyo-text p-4 md:p-8">
      {movingSnippet && <MoveCategoryModal snippet={movingSnippet} />}
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            <i className="fa-solid fa-bookmark text-tokyo-purple mr-3"></i>
            My Library
          </h1>
          <button onClick={onBack} className="btn btn-ghost text-gray-400">
            <i className="fa-solid fa-home mr-2"></i> Home
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setSelectedLang(null); setSelectedCategoryId(null); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              !selectedLang && !selectedCategoryId 
                ? 'bg-tokyo-blue text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All ({snippets.length})
          </button>
          
          {PREDEFINED_LANGS.map(lang => {
            const count = getLangCount(lang.id);
            return (
              <button
                key={lang.id}
                onClick={() => { setSelectedLang(lang.id); setSelectedCategoryId(null); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedLang === lang.id && !selectedCategoryId
                    ? `${lang.color} ring-2 ring-white/20` 
                    : `${lang.color} opacity-60 hover:opacity-100`
                }`}
              >
                {lang.label} ({count})
              </button>
            );
          })}
          
          {categories.length > 0 && (
            <>
              <div className="w-full h-px bg-white/10 my-2"></div>
              {categories.map(cat => {
                const catSnippets = snippets.filter(s => s.categoryId === cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedLang(cat.lang); setSelectedCategoryId(cat.id); }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedCategoryId === cat.id
                        ? 'bg-tokyo-purple/30 text-tokyo-purple ring-2 ring-tokyo-purple/30' 
                        : 'bg-tokyo-purple/10 text-tokyo-purple/70 hover:bg-tokyo-purple/20'
                    }`}
                  >
                    <i className="fa-solid fa-folder mr-1"></i>
                    {cat.name} ({catSnippets.length})
                  </button>
                );
              })}
            </>
          )}
          
          {showNewCategory ? (
            <div className="flex items-center gap-2 w-full mt-2">
              <select
                value={newCategoryLang || ''}
                onChange={(e) => setNewCategoryLang(e.target.value)}
                className="select select-sm bg-tokyo-bg-dark border-white/10 text-white"
              >
                <option value="">Select lang...</option>
                {PREDEFINED_LANGS.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCategory();
                  if (e.key === 'Escape') { setShowNewCategory(false); setNewCategoryName(''); setNewCategoryLang(null); }
                }}
                placeholder="Category name..."
                className="input input-sm bg-tokyo-bg-dark border-white/10 text-white flex-1"
                autoFocus
              />
              <button 
                onClick={handleCreateCategory}
                className="btn btn-primary btn-sm"
              >
                Add
              </button>
              <button 
                onClick={() => { setShowNewCategory(false); setNewCategoryName(''); setNewCategoryLang(null); }} 
                className="btn btn-ghost btn-sm text-gray-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewCategory(true)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-white/20 text-gray-500 hover:text-white hover:border-white/40 transition-colors"
            >
              <i className="fa-solid fa-plus mr-1"></i>
              New Category
            </button>
          )}
        </div>

        {snippets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-20">
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-400 mb-2">No snippets saved</h2>
            <p className="text-gray-500">Play any snippet to auto-save it to your library</p>
          </div>
        ) : filteredSnippets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No snippets in this category
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSnippets.map((snippet) => {
              const best = getBestResult(snippet.results);
              const snippetCategory = snippet.categoryId 
                ? categories.find(c => c.id === snippet.categoryId) 
                : null;
              
              return (
                <div 
                  key={snippet.id} 
                  className="bg-tokyo-bg-dark border border-white/10 rounded-2xl p-4 md:p-6 hover:border-white/20 transition-colors"
                >
                  {showDeleteConfirm === snippet.id ? (
                    <div className="flex items-center justify-between">
                      <span className="text-red-400">Delete "{snippet.name}"?</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowDeleteConfirm(null)} 
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => deleteSnippet(snippet.id)} 
                          className="btn btn-error btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : renamingId === snippet.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(snippet.id);
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        className="input input-sm bg-tokyo-bg-darkest border-white/10 text-white flex-1"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleRename(snippet.id)} 
                        className="btn btn-primary btn-sm"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelRename} 
                        className="btn btn-ghost btn-sm text-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedSnippet(snippet)}
                      >
                        <h3 className="text-lg font-bold text-white mb-1">{snippet.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${LANG_COLORS[snippet.lang] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                            {snippet.lang.toUpperCase()}
                          </span>
                          {snippetCategory && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-tokyo-purple/20 text-tokyo-purple border border-tokyo-purple/30">
                              {snippetCategory.name}
                            </span>
                          )}
                          <span>{snippet.results.length} attempts</span>
                          {best && (
                            <>
                              <span className="text-tokyo-green">Best: {best.wpm} WPM</span>
                              <span className="text-tokyo-blue">{best.acc}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setMovingSnippet(snippet)} 
                          className="btn btn-ghost btn-sm text-gray-400 hover:text-white"
                          title="Move to category"
                        >
                          <i className="fa-solid fa-folder"></i>
                        </button>
                        <button 
                          onClick={() => handleStartRename(snippet)} 
                          className="btn btn-ghost btn-sm text-gray-400 hover:text-white"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button 
                          onClick={() => setSelectedSnippet(snippet)} 
                          className="btn btn-ghost btn-sm text-gray-400"
                        >
                          <i className="fa-solid fa-chart-line mr-1"></i> Stats
                        </button>
                        <button 
                          onClick={() => handlePlay(snippet)} 
                          className="btn btn-primary btn-sm"
                        >
                          <i className="fa-solid fa-play mr-1"></i> Play
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(snippet.id)} 
                          className="btn btn-ghost btn-sm text-gray-400 hover:text-red-400"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

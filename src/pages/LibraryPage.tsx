import { useState } from 'react';
import { usePersistenceStore, getLanguageColor, getLanguageName } from '@/stores/persistenceStore';
import type { SavedSnippet, ExerciseResult } from '@/types';

interface LibraryPageProps {
  onBack: () => void;
  onStartGame: (code: string, lang: string) => void;
  onStartSequence?: (snippets: SavedSnippet[]) => void;
  isInSequence?: boolean;
  sequenceResults?: SequenceResult[];
  onFinishSequence?: () => void;
}

interface SequenceResult {
  snippetId: string;
  snippetName: string;
  result: ExerciseResult;
}

const PREDEFINED_LANGS = [
  { id: 'js', label: 'JS' },
  { id: 'ts', label: 'TS' },
  { id: 'py', label: 'PY' },
  { id: 'rust', label: 'Rust' },
  { id: 'go', label: 'Go' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
];

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

export const LibraryPage = ({ onBack, onStartGame, onStartSequence }: LibraryPageProps) => {
  const snippets = usePersistenceStore((state) => state.snippets);
  const customLanguages = usePersistenceStore((state) => state.customLanguages);
  const sequences = usePersistenceStore((state) => state.sequences);
  const deleteSnippet = usePersistenceStore((state) => state.deleteSnippet);
  const clearHistory = usePersistenceStore((state) => state.clearHistory);
  const renameSnippet = usePersistenceStore((state) => state.renameSnippet);
  const changeSnippetLanguage = usePersistenceStore((state) => state.changeSnippetLanguage);
  const addCustomLanguage = usePersistenceStore((state) => state.addCustomLanguage);
  const renameCustomLanguage = usePersistenceStore((state) => state.renameCustomLanguage);
  const deleteCustomLanguage = usePersistenceStore((state) => state.deleteCustomLanguage);
  const addSequence = usePersistenceStore((state) => state.addSequence);
  const renameSequence = usePersistenceStore((state) => state.renameSequence);
  const deleteSequence = usePersistenceStore((state) => state.deleteSequence);
  const addSnippet = usePersistenceStore((state) => state.addSnippet);
  
  const [selectedSnippet, setSelectedSnippet] = useState<SavedSnippet | null>(null);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showNewLanguage, setShowNewLanguage] = useState(false);
  const [newLanguageName, setNewLanguageName] = useState('');
  const [movingSnippet, setMovingSnippet] = useState<SavedSnippet | null>(null);
  const [editingLangId, setEditingLangId] = useState<string | null>(null);
  const [editLangValue, setEditLangValue] = useState('');
  
  const [sequenceMode, setSequenceMode] = useState(false);
  const [selectedForSequence, setSelectedForSequence] = useState<Set<string>>(new Set());
  const [newSequenceName, setNewSequenceName] = useState('');
  const [showNewSequence, setShowNewSequence] = useState(false);
  const [renamingSequenceId, setRenamingSequenceId] = useState<string | null>(null);
  const [renameSequenceValue, setRenameSequenceValue] = useState('');

  const [showNewSnippet, setShowNewSnippet] = useState(false);
  const [newSnippetName, setNewSnippetName] = useState('');
  const [newSnippetCode, setNewSnippetCode] = useState('');
  const [newSnippetLang, setNewSnippetLang] = useState('js');

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

  const handleCreateLanguage = () => {
    if (newLanguageName.trim()) {
      addCustomLanguage(newLanguageName.trim());
      setNewLanguageName('');
      setShowNewLanguage(false);
    }
  };

  const handleChangeLanguage = (snippetId: string, langId: string) => {
    changeSnippetLanguage(snippetId, langId);
    setMovingSnippet(null);
  };

  const handleStartEditLang = (langId: string, currentName: string) => {
    setEditingLangId(langId);
    setEditLangValue(currentName);
  };

  const handleEditLang = (id: string) => {
    if (editLangValue.trim()) {
      renameCustomLanguage(id, editLangValue.trim());
    }
    setEditingLangId(null);
    setEditLangValue('');
  };

  const toggleSnippetSelection = (snippetId: string) => {
    setSelectedForSequence(prev => {
      const newSet = new Set(prev);
      if (newSet.has(snippetId)) {
        newSet.delete(snippetId);
      } else {
        newSet.add(snippetId);
      }
      return newSet;
    });
  };

  const handleSaveSequence = () => {
    if (selectedForSequence.size > 0 && newSequenceName.trim()) {
      addSequence(newSequenceName.trim(), Array.from(selectedForSequence));
      setSelectedForSequence(new Set());
      setNewSequenceName('');
      setShowNewSequence(false);
      setSequenceMode(false);
    }
  };

  const handleStartSavedSequence = (sequenceIds: string[]) => {
    const sequenceSnippets = sequenceIds
      .map(id => snippets.find(s => s.id === id))
      .filter((s): s is SavedSnippet => s !== undefined);
    
    if (sequenceSnippets.length > 0 && onStartSequence) {
      onStartSequence(sequenceSnippets);
    }
  };

  const handleRenameSequence = (id: string) => {
    if (renameSequenceValue.trim()) {
      renameSequence(id, renameSequenceValue.trim());
    }
    setRenamingSequenceId(null);
    setRenameSequenceValue('');
  };

  const handleCreateSnippet = () => {
    if (newSnippetName.trim() && newSnippetCode.trim()) {
      addSnippet(newSnippetName.trim(), newSnippetCode, newSnippetLang);
      setNewSnippetName('');
      setNewSnippetCode('');
      setNewSnippetLang('js');
      setShowNewSnippet(false);
    }
  };

  const getLangCount = (langId: string) => {
    return snippets.filter(s => s.lang === langId).length;
  };

  const filteredSnippets = selectedLang 
    ? snippets.filter(s => s.lang === selectedLang)
    : snippets;

  const MoveLanguageModal = ({ snippet }: { snippet: SavedSnippet }) => {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-tokyo-bg-dark border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-1">Move to Language</h3>
          <p className="text-sm text-gray-500 mb-4">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getLanguageColor(snippet.lang, customLanguages)}`}>
              {getLanguageName(snippet.lang, customLanguages)}
            </span>
            <span className="ml-2">{snippet.name}</span>
          </p>
          
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
            {PREDEFINED_LANGS.map(lang => (
              <button
                key={lang.id}
                onClick={() => handleChangeLanguage(snippet.id, lang.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  snippet.lang === lang.id 
                    ? 'bg-tokyo-blue/20 text-white' 
                    : 'bg-white/5 hover:bg-white/10 text-white'
                }`}
              >
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getLanguageColor(lang.id, customLanguages)}`}>
                  {lang.label}
                </span>
                {snippet.lang === lang.id && (
                  <span className="ml-2 text-xs text-tokyo-green">(current)</span>
                )}
              </button>
            ))}
            
            {customLanguages.length > 0 && (
              <div className="border-t border-white/10 pt-2 mt-2">
                {customLanguages.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => handleChangeLanguage(snippet.id, lang.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      snippet.lang === lang.id 
                        ? 'bg-tokyo-blue/20 text-white' 
                        : 'bg-white/5 hover:bg-white/10 text-white'
                    }`}
                  >
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${lang.color}`}>
                      {lang.name}
                    </span>
                    {snippet.lang === lang.id && (
                      <span className="ml-2 text-xs text-tokyo-green">(current)</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setMovingSnippet(null)} 
            className="btn btn-ghost btn-sm w-full text-gray-400"
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
    
    return (
      <div className="min-h-screen bg-tokyo-bg-darkest text-tokyo-text p-4 md:p-8">
        {movingSnippet && <MoveLanguageModal snippet={movingSnippet} />}
        
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
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getLanguageColor(currentSnippet.lang, customLanguages)}`}>
                    {getLanguageName(currentSnippet.lang, customLanguages)}
                  </span>
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
      {movingSnippet && <MoveLanguageModal snippet={movingSnippet} />}
      
      {showNewSnippet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-tokyo-bg-dark border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add New Snippet</h3>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Name</label>
                <input
                  type="text"
                  value={newSnippetName}
                  onChange={(e) => setNewSnippetName(e.target.value)}
                  placeholder="My snippet name..."
                  className="input input-bordered w-full bg-tokyo-bg-darkest border-white/10 text-white"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Language</label>
                <select
                  value={newSnippetLang}
                  onChange={(e) => setNewSnippetLang(e.target.value)}
                  className="select select-bordered w-full bg-tokyo-bg-darkest border-white/10 text-white"
                >
                  {PREDEFINED_LANGS.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.label}</option>
                  ))}
                  {customLanguages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Code</label>
                <textarea
                  value={newSnippetCode}
                  onChange={(e) => setNewSnippetCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="textarea textarea-bordered w-full h-48 bg-tokyo-bg-darkest border-white/10 text-white font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => { setShowNewSnippet(false); setNewSnippetName(''); setNewSnippetCode(''); setNewSnippetLang('js'); }} 
                className="btn btn-ghost text-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateSnippet}
                disabled={!newSnippetName.trim() || !newSnippetCode.trim()}
                className="btn btn-primary"
              >
                Add Snippet
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            <i className="fa-solid fa-bookmark text-tokyo-purple mr-3"></i>
            My Library
          </h1>
          <div className="flex gap-2">
            {!sequenceMode && (
              <>
                <button 
                  onClick={() => setShowNewSnippet(true)} 
                  className="btn btn-primary btn-sm"
                >
                  <i className="fa-solid fa-plus mr-2"></i> Add Snippet
                </button>
                {snippets.length > 0 && (
                  <button 
                    onClick={() => setSequenceMode(true)} 
                    className="btn btn-ghost text-gray-400"
                  >
                    <i className="fa-solid fa-list-ol mr-2"></i> Create Sequence
                  </button>
                )}
              </>
            )}
            {sequenceMode && (
              <button 
                onClick={() => { setSequenceMode(false); setSelectedForSequence(new Set()); }} 
                className="btn btn-ghost text-gray-400"
              >
                Cancel
              </button>
            )}
            <button onClick={onBack} className="btn btn-ghost text-gray-400">
              <i className="fa-solid fa-home mr-2"></i> Home
            </button>
          </div>
        </div>

        {sequences.length > 0 && !sequenceMode && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-3">
              <i className="fa-solid fa-list-ol text-tokyo-blue mr-2"></i>
              My Sequences
            </h2>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {sequences.map(seq => {
                const seqSnippets = seq.snippetIds
                  .map(id => snippets.find(s => s.id === id))
                  .filter((s): s is SavedSnippet => s !== undefined);
                
                return (
                  <div 
                    key={seq.id} 
                    className="bg-tokyo-bg-dark border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                  >
                    {renamingSequenceId === seq.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={renameSequenceValue}
                          onChange={(e) => setRenameSequenceValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSequence(seq.id);
                            if (e.key === 'Escape') setRenamingSequenceId(null);
                          }}
                          className="input input-sm bg-tokyo-bg-darkest border-white/10 text-white flex-1"
                          autoFocus
                        />
                        <button onClick={() => handleRenameSequence(seq.id)} className="btn btn-primary btn-sm">
                          <i className="fa-solid fa-check"></i>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-white truncate flex-1">{seq.name}</h3>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => { setRenamingSequenceId(seq.id); setRenameSequenceValue(seq.name); }}
                              className="btn btn-ghost btn-xs text-gray-500 hover:text-white"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button 
                              onClick={() => deleteSequence(seq.id)}
                              className="btn btn-ghost btn-xs text-gray-500 hover:text-red-400"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mb-3">
                          {seqSnippets.length} snippets
                        </div>
                        <button 
                          onClick={() => handleStartSavedSequence(seq.snippetIds)}
                          className="btn btn-primary btn-sm w-full"
                        >
                          <i className="fa-solid fa-play mr-2"></i> Practice
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sequenceMode && (
          <div className="bg-tokyo-bg-dark border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Select Snippets</h2>
                <p className="text-gray-500 text-sm">{selectedForSequence.size} selected</p>
              </div>
              <div className="flex gap-2">
                {selectedForSequence.size > 0 && !showNewSequence && (
                  <button 
                    onClick={() => setShowNewSequence(true)}
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fa-solid fa-save mr-2"></i> Save Sequence
                  </button>
                )}
                {selectedForSequence.size > 0 && onStartSequence && (
                  <button 
                    onClick={() => {
                      const selectedSnippets = snippets.filter(s => selectedForSequence.has(s.id));
                      onStartSequence(selectedSnippets);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fa-solid fa-play mr-2"></i> Practice Now
                  </button>
                )}
              </div>
            </div>
            
            {showNewSequence && (
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <input
                  type="text"
                  value={newSequenceName}
                  onChange={(e) => setNewSequenceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSequence();
                    if (e.key === 'Escape') setShowNewSequence(false);
                  }}
                  placeholder="Sequence name..."
                  className="input input-sm bg-tokyo-bg-darkest border-white/10 text-white flex-1"
                  autoFocus
                />
                <button onClick={handleSaveSequence} className="btn btn-primary btn-sm">
                  <i className="fa-solid fa-check"></i>
                </button>
                <button onClick={() => setShowNewSequence(false)} className="btn btn-ghost btn-sm text-gray-400">
                  Cancel
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredSnippets.map(snippet => (
                <div 
                  key={snippet.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedForSequence.has(snippet.id) 
                      ? 'bg-tokyo-blue/20 border border-tokyo-blue/30' 
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                  onClick={() => toggleSnippetSelection(snippet.id)}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedForSequence.has(snippet.id)}
                    onChange={() => toggleSnippetSelection(snippet.id)}
                    className="checkbox checkbox-sm"
                  />
                  <span className="text-white truncate flex-1">{snippet.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getLanguageColor(snippet.lang, customLanguages)}`}>
                    {getLanguageName(snippet.lang, customLanguages)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setSelectedLang(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              !selectedLang
                ? 'bg-tokyo-blue text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All ({snippets.length})
          </button>
          
          {PREDEFINED_LANGS.map(lang => {
            const count = getLangCount(lang.id);
            if (count === 0 && snippets.length > 0) return null;
            return (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedLang === lang.id
                    ? `${getLanguageColor(lang.id, customLanguages)} ring-2 ring-white/20` 
                    : `${getLanguageColor(lang.id, customLanguages)} opacity-60 hover:opacity-100`
                }`}
              >
                {lang.label} ({count})
              </button>
            );
          })}
          
          {customLanguages.map(lang => {
            const count = getLangCount(lang.id);
            return (
              <div key={lang.id} className="flex items-center gap-1">
                {editingLangId === lang.id ? (
                  <>
                    <input
                      type="text"
                      value={editLangValue}
                      onChange={(e) => setEditLangValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditLang(lang.id);
                        if (e.key === 'Escape') setEditingLangId(null);
                      }}
                      className="input input-xs bg-tokyo-bg-dark border-white/10 text-white w-20"
                      autoFocus
                    />
                    <button onClick={() => handleEditLang(lang.id)} className="text-xs text-tokyo-green">
                      <i className="fa-solid fa-check"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedLang(lang.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        selectedLang === lang.id
                          ? `${lang.color} ring-2 ring-white/20` 
                          : `${lang.color} opacity-60 hover:opacity-100`
                      }`}
                    >
                      {lang.name} ({count})
                    </button>
                    <button 
                      onClick={() => handleStartEditLang(lang.id, lang.name)}
                      className="text-gray-600 hover:text-white text-xs"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                      onClick={() => deleteCustomLanguage(lang.id)}
                      className="text-gray-600 hover:text-red-400 text-xs"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </>
                )}
              </div>
            );
          })}
          
          {showNewLanguage ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newLanguageName}
                onChange={(e) => setNewLanguageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateLanguage();
                  if (e.key === 'Escape') { setShowNewLanguage(false); setNewLanguageName(''); }
                }}
                placeholder="Language name..."
                className="input input-sm bg-tokyo-bg-dark border-white/10 text-white"
                autoFocus
              />
              <button onClick={handleCreateLanguage} className="btn btn-primary btn-sm">
                Add
              </button>
              <button onClick={() => { setShowNewLanguage(false); setNewLanguageName(''); }} className="btn btn-ghost btn-sm text-gray-400">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewLanguage(true)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-white/20 text-gray-500 hover:text-white hover:border-white/40 transition-colors"
            >
              <i className="fa-solid fa-plus mr-1"></i>
              New Language
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
            No snippets in this language
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSnippets.map((snippet) => {
              const best = getBestResult(snippet.results);
              
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
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getLanguageColor(snippet.lang, customLanguages)}`}>
                            {getLanguageName(snippet.lang, customLanguages)}
                          </span>
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
                          title="Move to language"
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

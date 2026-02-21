import { useState } from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { CodePreview } from '@/components/home/CodePreview';
import { CustomBuffer } from '@/components/home/CustomBuffer';
import { LanguageSelector } from '@/components/home/LanguageSelector';
import { REPO_DATA } from '@/data/codeSnippets';
import { usePersistenceStore } from '@/stores/persistenceStore';
import type { GameOptions } from '@/types';

const TIME_OPTIONS = [
  { label: 'None', value: null },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
  { label: '5m', value: 300 },
];

const REPETITION_OPTIONS = [1, 3, 5, 7, 10];

interface HomePageProps {
  onStartGame: (code: string, lang: string, options: GameOptions) => void;
  onGoToLibrary: () => void;
}

export const HomePage = ({ onStartGame, onGoToLibrary }: HomePageProps) => {
  const [selectedLang, setSelectedLang] = useState('js');
  const [options, setOptions] = useState<GameOptions>({
    stopOnError: false,
    timeLimit: null,
    practiceMode: false,
    practiceRepetitions: 5,
  });
  
  const findOrCreateSnippet = usePersistenceStore((state) => state.findOrCreateSnippet);

  const handleCustomCode = (code: string) => {
    findOrCreateSnippet(code, 'auto');
    onStartGame(code, 'auto', options);
  };

  const handleStartSnippet = () => {
    const code = REPO_DATA[selectedLang].code;
    findOrCreateSnippet(code, selectedLang);
    onStartGame(code, selectedLang, options);
  };

  const toggleStopOnError = () => {
    setOptions(prev => ({ ...prev, stopOnError: !prev.stopOnError }));
  };

  const setTimeLimit = (value: number | null) => {
    setOptions(prev => ({ ...prev, timeLimit: value }));
  };

  const togglePracticeMode = () => {
    setOptions(prev => ({ ...prev, practiceMode: !prev.practiceMode }));
  };

  const setPracticeRepetitions = (value: number) => {
    setOptions(prev => ({ ...prev, practiceRepetitions: value }));
  };

  return (
    <div className="min-h-screen bg-tokyo-bg-darkest flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-6xl w-full space-y-6 md:space-y-8 relative z-10">
        <div className="text-center mb-6 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[10px] font-mono text-gray-400 mb-3 md:mb-4 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            SYSTEM ONLINE
          </div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              DEV<span className="text-tokyo-blue">TYPE</span>
            </h1>
          </div>
          <p className="text-gray-500 font-mono text-xs md:text-sm tracking-widest uppercase mb-4">Master Your Coding Speed</p>
          <button 
            onClick={onGoToLibrary} 
            className="btn btn-sm btn-ghost text-gray-400 border border-white/10 hover:text-white"
          >
            <i className="fa-solid fa-bookmark mr-2"></i> My Library
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold">Stack Library</h2>
              <i className="fa-solid fa-layer-group text-tokyo-blue"></i>
            </div>

            <LanguageSelector
              snippets={REPO_DATA}
              selected={selectedLang}
              onSelect={setSelectedLang}
            />

            <CodePreview
              code={REPO_DATA[selectedLang].code}
              filename={`index.${selectedLang}`}
            />

            <div className="flex items-center gap-3 mt-4 mb-2 px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.stopOnError}
                  onChange={toggleStopOnError}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <span className="text-xs text-gray-400">Stop on error</span>
              </label>
            </div>

            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-xs text-gray-400">Time limit:</span>
              <div className="flex gap-1">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setTimeLimit(opt.value)}
                    className={`px-2 py-1 text-[10px] rounded transition-all ${
                      options.timeLimit === opt.value
                        ? 'bg-tokyo-blue text-tokyo-bg font-bold'
                        : 'bg-white/5 text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2 px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.practiceMode}
                  onChange={togglePracticeMode}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <span className="text-xs text-gray-400">Practice mode</span>
              </label>
              {options.practiceMode && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-600">x</span>
                  <div className="flex gap-1">
                    {REPETITION_OPTIONS.map((num) => (
                      <button
                        key={num}
                        onClick={() => setPracticeRepetitions(num)}
                        className={`w-6 h-6 text-[10px] rounded transition-all ${
                          options.practiceRepetitions === num
                            ? 'bg-tokyo-magenta text-white font-bold'
                            : 'bg-white/5 text-gray-500 hover:bg-white/10'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn w-full mt-4 bg-tokyo-blue hover:bg-tokyo-blue/80 text-tokyo-bg border-none font-bold py-3 shadow-lg shadow-tokyo-blue/20"
              onClick={handleStartSnippet}
            >
              <i className="fa-solid fa-bolt mr-2"></i> Initialize Session
            </button>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold">Custom Buffer</h2>
              <i className="fa-solid fa-terminal text-tokyo-blue"></i>
            </div>

            <div className="flex items-center gap-3 mb-2 px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.stopOnError}
                  onChange={toggleStopOnError}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <span className="text-xs text-gray-400">Stop on error</span>
              </label>
            </div>

            <div className="flex items-center gap-2 mb-4 px-1">
              <span className="text-xs text-gray-400">Time limit:</span>
              <div className="flex gap-1">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setTimeLimit(opt.value)}
                    className={`px-2 py-1 text-[10px] rounded transition-all ${
                      options.timeLimit === opt.value
                        ? 'bg-tokyo-blue text-tokyo-bg font-bold'
                        : 'bg-white/5 text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4 px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.practiceMode}
                  onChange={togglePracticeMode}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <span className="text-xs text-gray-400">Practice mode</span>
              </label>
              {options.practiceMode && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-600">x</span>
                  <div className="flex gap-1">
                    {REPETITION_OPTIONS.map((num) => (
                      <button
                        key={num}
                        onClick={() => setPracticeRepetitions(num)}
                        className={`w-6 h-6 text-[10px] rounded transition-all ${
                          options.practiceRepetitions === num
                            ? 'bg-tokyo-magenta text-white font-bold'
                            : 'bg-white/5 text-gray-500 hover:bg-white/10'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <CustomBuffer onSubmit={handleCustomCode} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useRef } from 'react';
import type { GameStats, ExerciseResult } from '@/types';
import { getGrade } from '@/lib/grades';
import { usePersistenceStore } from '@/stores/persistenceStore';

interface ResultsModalProps {
  stats: GameStats;
  code: string;
  lang?: string;
  onRetry: () => void;
  onBack: () => void;
  onFinish?: (result: ExerciseResult) => void;
  sequenceButtonText?: string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

export const ResultsModal = ({ stats, code, lang = 'other', onRetry, onBack, onFinish, sequenceButtonText }: ResultsModalProps) => {
  const grade = getGrade(stats.wpm, stats.acc);
  const hasSavedRef = useRef(false);
  const onFinishCalledRef = useRef(false);
  
  const snippets = usePersistenceStore((state) => state.snippets);
  const addResult = usePersistenceStore((state) => state.addResult);
  const findOrCreateSnippet = usePersistenceStore((state) => state.findOrCreateSnippet);
  
  const matchingSnippet = snippets.find(s => s.code === code);

  useEffect(() => {
    if (!hasSavedRef.current) {
      hasSavedRef.current = true;
      
      const snippetId = matchingSnippet?.id || findOrCreateSnippet(code, lang);
      addResult(snippetId, {
        wpm: stats.wpm,
        acc: stats.acc,
        time: stats.time,
        errors: stats.errors,
      });
    }
  }, [matchingSnippet?.id, stats.wpm, stats.acc, stats.time, stats.errors, addResult, findOrCreateSnippet, code, lang]);

  const handleBack = () => {
    if (onFinish && !onFinishCalledRef.current) {
      onFinishCalledRef.current = true;
      onFinish({
        id: '',
        date: new Date().toISOString(),
        wpm: stats.wpm,
        acc: stats.acc,
        time: stats.time,
        errors: stats.errors,
      });
      return;
    }
    onBack();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
      <div className="bg-tokyo-bg-dark border border-white/10 p-6 md:p-10 rounded-2xl md:rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-purple-500/20 to-transparent blur-2xl"></div>

        <div className="text-center mb-6 md:mb-8 relative z-10">
          <div className={`text-5xl md:text-6xl font-black ${grade.color} mb-1 md:mb-2`}>{grade.label}</div>
          <h2 className="text-lg md:text-xl font-bold text-white">{grade.desc}</h2>
          <p className="text-gray-500 text-[10px] md:text-xs mt-1 md:mt-2 font-mono">SESSION COMPLETE</p>
        </div>

        <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6 md:mb-8 relative z-10">
          <div className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/5">
            <div className="text-[10px] md:text-xs text-gray-500 uppercase font-bold mb-1">WPM</div>
            <div className="text-xl md:text-2xl font-black text-white">{stats.wpm}</div>
          </div>
          <div className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/5">
            <div className="text-[10px] md:text-xs text-gray-500 uppercase font-bold mb-1">Accuracy</div>
            <div className="text-xl md:text-2xl font-black text-white">{stats.acc}%</div>
          </div>
          <div className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/5">
            <div className="text-[10px] md:text-xs text-gray-500 uppercase font-bold mb-1">Time</div>
            <div className="text-xl md:text-2xl font-black text-tokyo-cyan">{formatTime(stats.time)}</div>
          </div>
          <div className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/5">
            <div className="text-[10px] md:text-xs text-gray-500 uppercase font-bold mb-1">Errors</div>
            <div className="text-xl md:text-2xl font-black text-red-400">{stats.errors}</div>
          </div>
        </div>

        {hasSavedRef.current && (
          <div className="mb-4 text-center relative z-10">
            <span className="text-green-400 text-sm">
              <i className="fa-solid fa-check mr-1"></i>
              Result saved to "{matchingSnippet?.name || 'snippet'}"
            </span>
          </div>
        )}

        <div className="flex gap-2 md:gap-3 relative z-10">
          <button onClick={handleBack} className="btn btn-ghost flex-1 text-gray-400 hover:text-white border border-white/10 text-sm md:text-base">
            {onFinish && sequenceButtonText ? (
              <>
                <i className="fa-solid fa-check mr-1 md:mr-2"></i> {sequenceButtonText}
              </>
            ) : (
              <>
                <i className="fa-solid fa-home mr-1 md:mr-2"></i> Home
              </>
            )}
          </button>
          <button onClick={onRetry} className="btn btn-primary flex-1 bg-tokyo-blue border-none text-tokyo-bg hover:opacity-90 text-sm md:text-base">
            <i className="fa-solid fa-rotate-right mr-1 md:mr-2"></i> Retry
          </button>
        </div>
      </div>
    </div>
  );
};

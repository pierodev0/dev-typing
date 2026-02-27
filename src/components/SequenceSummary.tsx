import type { ExerciseResult } from '@/types';
import { usePersistenceStore } from '@/stores/persistenceStore';

interface SequenceResult {
  snippetId: string;
  snippetName: string;
  result: ExerciseResult;
}

interface SequenceSummaryProps {
  results: SequenceResult[];
  onBack: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

export const SequenceSummary = ({ results, onBack }: SequenceSummaryProps) => {
  const snippets = usePersistenceStore((state) => state.snippets);

  const totalWpm = results.reduce((acc, r) => acc + r.result.wpm, 0);
  const avgWpm = results.length > 0 ? Math.round(totalWpm / results.length) : 0;
  
  const totalAcc = results.reduce((acc, r) => acc + r.result.acc, 0);
  const avgAcc = results.length > 0 ? Math.round(totalAcc / results.length) : 0;
  
  const totalErrors = results.reduce((acc, r) => acc + r.result.errors, 0);
  const totalTime = results.reduce((acc, r) => acc + r.result.time, 0);

  return (
    <div className="min-h-screen bg-tokyo-bg-darkest text-tokyo-text p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-lg w-full">
        <div className="bg-tokyo-bg-dark border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">
              <i className="fa-solid fa-trophy text-yellow-400"></i>
            </div>
            <h1 className="text-2xl font-bold text-white">Sequence Complete!</h1>
            <p className="text-gray-500">You practiced {results.length} snippets</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 uppercase mb-1">Average WPM</div>
              <div className="text-2xl font-bold text-tokyo-green">{avgWpm}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 uppercase mb-1">Average Accuracy</div>
              <div className="text-2xl font-bold text-tokyo-blue">{avgAcc}%</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 uppercase mb-1">Total Time</div>
              <div className="text-2xl font-bold text-tokyo-cyan">{formatTime(totalTime)}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 uppercase mb-1">Total Errors</div>
              <div className="text-2xl font-bold text-red-400">{totalErrors}</div>
            </div>
          </div>

          <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
            {results.map((r, index) => {
              const snippet = snippets.find(s => s.id === r.snippetId);
              return (
                <div 
                  key={r.snippetId} 
                  className="bg-white/5 rounded-lg p-3 flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">#{index + 1}</span>
                    <span className="text-white font-medium truncate max-w-[150px]">
                      {snippet?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-tokyo-green">{r.result.wpm} WPM</span>
                    <span className="text-tokyo-blue">{r.result.acc}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={onBack} className="btn btn-primary w-full">
            <i className="fa-solid fa-bookmark mr-2"></i> Back to Library
          </button>
        </div>
      </div>
    </div>
  );
};

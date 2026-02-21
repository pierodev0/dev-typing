import type { GameStats } from '@/types';
import { getGrade } from '@/lib/grades';

interface ResultsModalProps {
  stats: GameStats;
  onRetry: () => void;
  onBack: () => void;
}

export const ResultsModal = ({ stats, onRetry, onBack }: ResultsModalProps) => {
  const grade = getGrade(stats.wpm, stats.acc);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-tokyo-bg-dark border border-white/10 p-10 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent blur-2xl"></div>

        <div className="text-center mb-8 relative z-10">
          <div className={`text-6xl font-black ${grade.color} mb-2`}>{grade.label}</div>
          <h2 className="text-xl font-bold text-white">{grade.desc}</h2>
          <p className="text-gray-500 text-xs mt-2 font-mono">SESSION COMPLETE</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">WPM</div>
            <div className="text-2xl font-black text-white">{stats.wpm}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Accuracy</div>
            <div className="text-2xl font-black text-white">{stats.acc}%</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Errors</div>
            <div className="text-2xl font-black text-red-400">{stats.errors}</div>
          </div>
        </div>

        <div className="flex gap-3 relative z-10">
          <button onClick={onBack} className="btn btn-ghost flex-1 text-gray-400 hover:text-white border border-white/10">
            <i className="fa-solid fa-home mr-2"></i> Home
          </button>
          <button onClick={onRetry} className="btn btn-primary flex-1 bg-tokyo-blue border-none text-tokyo-bg hover:opacity-90">
            <i className="fa-solid fa-rotate-right mr-2"></i> Retry
          </button>
        </div>
      </div>
    </div>
  );
};

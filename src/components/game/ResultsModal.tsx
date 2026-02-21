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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
      <div className="bg-tokyo-bg-dark border border-white/10 p-6 md:p-10 rounded-2xl md:rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-purple-500/20 to-transparent blur-2xl"></div>

        <div className="text-center mb-6 md:mb-8 relative z-10">
          <div className={`text-5xl md:text-6xl font-black ${grade.color} mb-1 md:mb-2`}>{grade.label}</div>
          <h2 className="text-lg md:text-xl font-bold text-white">{grade.desc}</h2>
          <p className="text-gray-500 text-[10px] md:text-xs mt-1 md:mt-2 font-mono">SESSION COMPLETE</p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8 relative z-10">
          <div className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/5">
            <div className="text-[10px] md:text-xs text-gray-500 uppercase font-bold mb-1">WPM</div>
            <div className="text-xl md:text-2xl font-black text-white">{stats.wpm}</div>
          </div>
          <div className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/5">
            <div className="text-[10px] md:text-xs text-gray-500 uppercase font-bold mb-1">Accuracy</div>
            <div className="text-xl md:text-2xl font-black text-white">{stats.acc}%</div>
          </div>
          <div className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/5">
            <div className="text-[10px] md:text-xs text-gray-500 uppercase font-bold mb-1">Errors</div>
            <div className="text-xl md:text-2xl font-black text-red-400">{stats.errors}</div>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3 relative z-10">
          <button onClick={onBack} className="btn btn-ghost flex-1 text-gray-400 hover:text-white border border-white/10 text-sm md:text-base">
            <i className="fa-solid fa-home mr-1 md:mr-2"></i> Home
          </button>
          <button onClick={onRetry} className="btn btn-primary flex-1 bg-tokyo-blue border-none text-tokyo-bg hover:opacity-90 text-sm md:text-base">
            <i className="fa-solid fa-rotate-right mr-1 md:mr-2"></i> Retry
          </button>
        </div>
      </div>
    </div>
  );
};

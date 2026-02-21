interface TopBarProps {
  langName: string;
  time: number;
  wpm: number;
  acc: number;
  timeRemaining?: number | null;
  onBack: () => void;
  onFinish: () => void;
}

export const TopBar = ({ langName, time, wpm, acc, timeRemaining, onBack, onFinish }: TopBarProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining !== null && timeRemaining !== undefined && timeRemaining <= 10 && timeRemaining > 0;

  return (
    <div className="h-12 bg-tokyo-bg-dark border-b border-white/5 flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack} 
          className="btn btn-ghost btn-xs text-xs opacity-50 hover:opacity-100 text-gray-400"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Exit
        </button>
        <div className="h-4 w-px bg-white/10"></div>
        <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-1 rounded tracking-wide">
          {langName.toUpperCase()}
        </span>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-6">
        <div className="text-center w-16">
          <div className="text-[9px] text-gray-500 uppercase font-bold">WPM</div>
          <div className="text-lg font-black text-white leading-none">{wpm}</div>
        </div>
        <div className="text-center w-16">
          <div className="text-[9px] text-gray-500 uppercase font-bold">ACC</div>
          <div className="text-lg font-black text-white leading-none">{acc}%</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {timeRemaining !== null && timeRemaining !== undefined ? (
          <div className={`font-mono text-xs font-bold ${isLowTime ? 'text-red-400 animate-pulse' : 'text-tokyo-yellow'}`}>
            <i className="fa-solid fa-clock mr-1"></i>
            {formatTime(timeRemaining)}
          </div>
        ) : (
          <div className="font-mono text-xs text-gray-500">{formatTime(time)}</div>
        )}
        <button 
          onClick={onFinish} 
          className="btn btn-ghost btn-xs text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
        >
          <i className="fa-solid fa-flag-checkered mr-1"></i> Finish
        </button>
      </div>
    </div>
  );
};

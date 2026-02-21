interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div className="h-0.5 bg-white/5 w-full">
      <div 
        className="h-full bg-tokyo-blue shadow-[0_0_10px_#7aa2f7] transition-all duration-150" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

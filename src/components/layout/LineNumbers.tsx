interface LineNumbersProps {
  lines: number;
  scrollTransform?: string;
}

export const LineNumbers = ({ lines, scrollTransform = 'translateY(0px)' }: LineNumbersProps) => {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-10 md:w-16 bg-tokyo-bg-dark/50 border-r border-white/5 z-0 overflow-hidden pointer-events-none">
      <div 
        className="p-2 md:p-4 pt-0 text-right font-code text-[10px] md:text-xs leading-loose text-gray-600"
        style={{ transform: scrollTransform }}
      >
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="h-[28px]">{i + 1}</div>
        ))}
      </div>
    </div>
  );
};

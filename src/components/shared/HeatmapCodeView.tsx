import { useMemo } from 'react';

interface HeatmapCodeViewProps {
  code: string;
  errorPositions?: Record<number, number>;
}

const getHeatmapColor = (errorCount: number, maxErrors: number): string => {
  if (errorCount === 0) return 'text-gray-400';
  
  const intensity = errorCount / maxErrors;
  
  if (intensity < 0.25) return 'text-red-300 bg-red-500/20';
  if (intensity < 0.5) return 'text-red-400 bg-red-500/30';
  if (intensity < 0.75) return 'text-red-500 bg-red-500/40';
  return 'text-red-600 bg-red-500/50';
};

export const HeatmapCodeView = ({ code, errorPositions = {} }: HeatmapCodeViewProps) => {
  const { chars, maxErrors } = useMemo(() => {
    const chars: { char: string; errorCount: number }[] = [];
    let maxErrors = 0;
    
    for (let i = 0; i < code.length; i++) {
      const errorCount = errorPositions[i] || 0;
      if (errorCount > maxErrors) maxErrors = errorCount;
      chars.push({ char: code[i], errorCount });
    }
    
    return { chars, maxErrors };
  }, [code, errorPositions]);

  if (maxErrors === 0) {
    return (
      <pre className="text-sm text-gray-400 font-mono whitespace-pre-wrap">
        {code}
      </pre>
    );
  }

  return (
    <pre className="text-sm font-mono whitespace-pre-wrap break-all">
      {chars.map((item, index) => {
        const colorClass = getHeatmapColor(item.errorCount, maxErrors);
        const isError = item.errorCount > 0;
        
        if (isError) {
          return (
            <span
              key={index}
              className={`${colorClass} px-0.5 rounded`}
              title={`Errors: ${item.errorCount}`}
            >
              {item.char === '\n' ? '↵\n' : item.char}
            </span>
          );
        }
        
        return (
          <span key={index} className="text-gray-400">
            {item.char === '\n' ? '↵\n' : item.char}
          </span>
        );
      })}
    </pre>
  );
};

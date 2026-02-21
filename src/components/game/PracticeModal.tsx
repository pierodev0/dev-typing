import { useRef, useEffect, useState } from 'react';

interface PracticeModalProps {
  targetWord: string;
  currentInput: string;
  repetitionCount: number;
  requiredRepetitions: number;
  onInputChange: (input: string) => void;
  onComplete: () => void;
  onError: () => void;
  onExit: () => void;
}

export const PracticeModal = ({
  targetWord,
  currentInput,
  repetitionCount,
  requiredRepetitions,
  onInputChange,
  onComplete,
  onError,
  onExit,
}: PracticeModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (repetitionCount >= requiredRepetitions) {
      onComplete();
    }
  }, [repetitionCount, requiredRepetitions, onComplete]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onExit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onInputChange(value);
    setHasError(false);

    if (value.length === targetWord.length) {
      if (value === targetWord) {
        onComplete();
      } else {
        setHasError(true);
        onError();
      }
    } else if (value.length > 0) {
      const partialMatch = targetWord.startsWith(value);
      if (!partialMatch) {
        setHasError(true);
        onError();
      }
    }
  };

  const progress = (repetitionCount / requiredRepetitions) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
      <div className="bg-tokyo-bg-dark border border-white/10 p-6 md:p-10 rounded-2xl md:rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-red-500/20 to-transparent blur-2xl"></div>

        <div className="text-center mb-4 md:mb-6 relative z-10">
          <div className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-1 md:mb-2 font-mono">
            Practice Mode
          </div>
          <div className="text-[9px] md:text-[10px] text-tokyo-yellow mb-3 md:mb-4">
            Type the word correctly {requiredRepetitions} times
          </div>
          
          <div className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4 font-code tracking-wider break-all px-2">
            {targetWord.split('').map((char, i) => {
              const inputChar = currentInput[i];
              let colorClass = 'text-gray-600';
              
              if (inputChar !== undefined) {
                colorClass = inputChar === char ? 'text-tokyo-green' : 'text-tokyo-red';
              }
              
              return (
                <span key={i} className={colorClass}>
                  {char}
                </span>
              );
            })}
          </div>

          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3 md:mb-4">
            <div 
              className="h-full bg-tokyo-blue transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-center gap-1 mb-3 md:mb-6">
            {Array.from({ length: requiredRepetitions }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                  i < repetitionCount ? 'bg-tokyo-green' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <div className="text-xs md:text-sm text-gray-400">
            {repetitionCount} / {requiredRepetitions} completed
          </div>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={`w-full bg-tokyo-bg border rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-center text-lg md:text-xl font-code text-white focus:outline-none focus:ring-2 transition-all ${
            hasError ? 'border-tokyo-red focus:ring-tokyo-red/50' : 'border-white/10 focus:ring-tokyo-blue/50'
          }`}
          placeholder="Type the word..."
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {hasError && (
          <div className="text-center mt-2 md:mt-3 text-tokyo-red text-xs md:text-sm animate-pulse">
            Incorrect! Try again from the beginning
          </div>
        )}

        <div className="flex items-center justify-between mt-3 md:mt-4">
          <span className="text-[9px] md:text-[10px] text-gray-600 hidden sm:block">
            Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-gray-400">Esc</kbd> to skip
          </span>
          <button
            onClick={onExit}
            className="text-[10px] md:text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 mx-auto sm:mx-0"
          >
            <i className="fa-solid fa-xmark"></i> Skip practice
          </button>
        </div>
      </div>
    </div>
  );
};

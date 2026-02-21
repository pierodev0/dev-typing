import { useRef, useEffect, useState } from 'react';

interface PracticeModalProps {
  targetWord: string;
  currentInput: string;
  repetitionCount: number;
  requiredRepetitions: number;
  onInputChange: (input: string) => void;
  onComplete: () => void;
  onError: () => void;
}

export const PracticeModal = ({
  targetWord,
  currentInput,
  repetitionCount,
  requiredRepetitions,
  onInputChange,
  onComplete,
  onError,
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
      return;
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-tokyo-bg-dark border border-white/10 p-10 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent blur-2xl"></div>

        <div className="text-center mb-6 relative z-10">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-mono">
            Practice Mode
          </div>
          <div className="text-[10px] text-tokyo-yellow mb-4">
            Type the word correctly {requiredRepetitions} times
          </div>
          
          <div className="text-5xl font-black text-white mb-4 font-code tracking-wider">
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

          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-tokyo-blue transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: requiredRepetitions }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < repetitionCount ? 'bg-tokyo-green' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <div className="text-sm text-gray-400">
            {repetitionCount} / {requiredRepetitions} completed
          </div>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={`w-full bg-tokyo-bg border rounded-xl px-4 py-3 text-center text-xl font-code text-white focus:outline-none focus:ring-2 transition-all ${
            hasError ? 'border-tokyo-red focus:ring-tokyo-red/50' : 'border-white/10 focus:ring-tokyo-blue/50'
          }`}
          placeholder="Type the word..."
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {hasError && (
          <div className="text-center mt-3 text-tokyo-red text-sm animate-pulse">
            Incorrect! Try again from the beginning
          </div>
        )}
      </div>
    </div>
  );
};

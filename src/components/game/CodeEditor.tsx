import { useGameStore } from '@/stores/gameStore';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useTyping } from '@/hooks/useTyping';
import { useTimer } from '@/hooks/useTimer';
import { CharComponent } from './Char';
import { TopBar } from '@/components/layout/TopBar';
import { ProgressBar } from '@/components/layout/ProgressBar';
import { LineNumbers } from '@/components/layout/LineNumbers';
import { ResultsModal } from './ResultsModal';
import { useMemo } from 'react';

interface CodeEditorProps {
  onBack: () => void;
}

export const CodeEditor = ({ onBack }: CodeEditorProps) => {
  const { chars, cursor, isFinished, langName, resetGame, finishGame } = useGameStore();
  const { handleKeyDown, inputRef, shake, focusInput } = useTyping();
  const { scrollRef, containerRef } = useAutoScroll();
  const { time, wpm, timeRemaining } = useTimer();
  
  const stats = useGameStore((state) => state.stats);

  const lines = useMemo(() => {
    return chars.filter(c => c.char === '\n').length + 1;
  }, [chars]);

  const progress = useMemo(() => {
    return chars.length > 0 ? Math.round((cursor / chars.length) * 100) : 0;
  }, [chars.length, cursor]);

  const handleRetry = () => {
    resetGame();
    focusInput();
  };

  const scrollTransform = scrollRef.current?.style.transform || 'translateY(0px)';

  return (
    <div 
      className={`h-screen flex flex-col bg-tokyo-bg-darkest text-tokyo-text ${shake ? 'screen-shake' : ''}`}
      onClick={focusInput}
    >
      <TopBar
        langName={langName}
        time={time}
        wpm={wpm}
        acc={stats.acc}
        timeRemaining={timeRemaining}
        onBack={onBack}
        onFinish={finishGame}
      />

      <ProgressBar progress={progress} />

      <div ref={containerRef} className="flex-1 relative overflow-hidden cursor-text">
        <LineNumbers lines={lines} scrollTransform={scrollTransform} />

        <div
          ref={scrollRef}
          className="code-scroll-container absolute top-0 left-0 right-0 pl-20 pr-20 pt-8 font-code text-base leading-loose whitespace-pre-wrap break-all transition-transform duration-100"
        >
          {chars.map((char, i) => (
            <CharComponent
              key={i}
              char={char}
              isCursor={i === cursor}
            />
          ))}
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute top-[-9999px]"
        autoFocus
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      {isFinished && (
        <ResultsModal
          stats={stats}
          onRetry={handleRetry}
          onBack={onBack}
        />
      )}
    </div>
  );
};

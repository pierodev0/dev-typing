import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { CodeEditor } from '@/components/game/CodeEditor';
import type { GameOptions, ExerciseResult } from '@/types';

interface GamePageProps {
  code: string;
  lang: string;
  options: GameOptions;
  onBack: () => void;
  onFinish?: (result: ExerciseResult) => void;
  sequenceButtonText?: string;
}

export const GamePage = ({ code, lang, options, onBack, onFinish, sequenceButtonText }: GamePageProps) => {
  const initGame = useGameStore((state) => state.initGame);
  const currentCodeRef = useRef<string>('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current && code) {
      isFirstRender.current = false;
      currentCodeRef.current = code;
      initGame(code, lang, options);
    } else if (code && code !== currentCodeRef.current) {
      currentCodeRef.current = code;
      initGame(code, lang, options);
    }
  }, [code, lang, options, initGame]);

  return <CodeEditor onBack={onBack} onFinish={onFinish} sequenceButtonText={sequenceButtonText} />;
};

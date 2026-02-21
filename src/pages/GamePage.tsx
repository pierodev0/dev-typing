import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { CodeEditor } from '@/components/game/CodeEditor';
import type { GameOptions } from '@/types';

interface GamePageProps {
  code: string;
  lang: string;
  options: GameOptions;
  onBack: () => void;
}

export const GamePage = ({ code, lang, options, onBack }: GamePageProps) => {
  const initGame = useGameStore((state) => state.initGame);

  useEffect(() => {
    initGame(code, lang, options);
  }, [code, lang, options, initGame]);

  return <CodeEditor onBack={onBack} />;
};

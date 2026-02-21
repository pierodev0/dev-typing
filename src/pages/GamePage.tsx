import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { CodeEditor } from '@/components/game/CodeEditor';

interface GamePageProps {
  code: string;
  lang: string;
  onBack: () => void;
}

export const GamePage = ({ code, lang, onBack }: GamePageProps) => {
  const initGame = useGameStore((state) => state.initGame);

  useEffect(() => {
    initGame(code, lang);
  }, [code, lang, initGame]);

  return <CodeEditor onBack={onBack} />;
};

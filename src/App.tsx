import { useState } from 'react';
import { HomePage } from '@/pages/HomePage';
import { GamePage } from '@/pages/GamePage';
import type { GameOptions } from '@/types';

type View = 'home' | 'game';

interface GameConfig {
  code: string;
  lang: string;
  options: GameOptions;
}

export const App = () => {
  const [view, setView] = useState<View>('home');
  const [config, setConfig] = useState<GameConfig>({ 
    code: '', 
    lang: '', 
    options: { stopOnError: false, timeLimit: null } 
  });

  const handleStartGame = (code: string, lang: string, options: GameOptions) => {
    setConfig({ code, lang, options });
    setView('game');
  };

  const handleBack = () => {
    setView('home');
  };

  return (
    <div className="text-base-content antialiased">
      {view === 'home' ? (
        <HomePage onStartGame={handleStartGame} />
      ) : (
        <GamePage code={config.code} lang={config.lang} options={config.options} onBack={handleBack} />
      )}
    </div>
  );
};

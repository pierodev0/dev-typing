import { useState } from 'react';
import { HomePage } from '@/pages/HomePage';
import { GamePage } from '@/pages/GamePage';

type View = 'home' | 'game';

interface GameConfig {
  code: string;
  lang: string;
}

export const App = () => {
  const [view, setView] = useState<View>('home');
  const [config, setConfig] = useState<GameConfig>({ code: '', lang: '' });

  const handleStartGame = (code: string, lang: string) => {
    setConfig({ code, lang });
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
        <GamePage code={config.code} lang={config.lang} onBack={handleBack} />
      )}
    </div>
  );
};

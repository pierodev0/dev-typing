import { useState } from 'react';
import { HomePage } from '@/pages/HomePage';
import { GamePage } from '@/pages/GamePage';
import { LibraryPage } from '@/pages/LibraryPage';
import type { GameOptions } from '@/types';

type View = 'home' | 'game' | 'library';

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
    options: { 
      stopOnError: false, 
      timeLimit: null,
      practiceMode: false,
      practiceRepetitions: 5,
    } 
  });

  const handleStartGame = (code: string, lang: string, options?: GameOptions) => {
    setConfig({ code, lang, options: options || config.options });
    setView('game');
  };

  const handleBack = () => {
    setView('home');
  };

  const handleGoToLibrary = () => {
    setView('library');
  };

  return (
    <div className="text-base-content antialiased">
      {view === 'home' && (
        <HomePage onStartGame={handleStartGame} onGoToLibrary={handleGoToLibrary} />
      )}
      {view === 'game' && (
        <GamePage code={config.code} lang={config.lang} options={config.options} onBack={handleBack} />
      )}
      {view === 'library' && (
        <LibraryPage onBack={handleBack} onStartGame={handleStartGame} />
      )}
    </div>
  );
};

import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { HomePage } from '@/pages/HomePage';
import { GamePage } from '@/pages/GamePage';
import { LibraryPage } from '@/pages/LibraryPage';
import { SequenceSummary } from '@/components/SequenceSummary';
import type { GameOptions, SavedSnippet, ExerciseResult } from '@/types';
import { usePersistenceStore } from '@/stores/persistenceStore';

interface SequenceResult {
  snippetId: string;
  snippetName: string;
  result: ExerciseResult;
}

export const App = () => {
  const navigate = useNavigate();
  const snippets = usePersistenceStore((state) => state.snippets);
  
  const [sequenceQueue, setSequenceQueue] = useState<string[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [sequenceResults, setSequenceResults] = useState<SequenceResult[]>([]);
  const [showSequenceSummary, setShowSequenceSummary] = useState(false);

  const handleStartGame = useCallback((code: string, lang: string, options?: GameOptions) => {
    const queryParams = new URLSearchParams();
    queryParams.set('code', btoa(code));
    queryParams.set('lang', lang);
    if (options) {
      queryParams.set('options', btoa(JSON.stringify(options)));
    }
    navigate(`/game?${queryParams.toString()}`);
  }, [navigate]);

  const handleStartSequence = (selectedSnippets: SavedSnippet[]) => {
    if (selectedSnippets.length === 0) return;
    
    const snippetIds = selectedSnippets.map(s => s.id);
    setSequenceQueue(snippetIds);
    setSequenceIndex(0);
    setSequenceResults([]);
    
    const firstSnippet = selectedSnippets[0];
    handleStartGame(firstSnippet.code, firstSnippet.lang);
  };

  const handleSequenceResult = (result: ExerciseResult) => {
    const currentQueue = sequenceQueue;
    if (currentQueue.length === 0) return;

    const currentSnippetId = currentQueue[sequenceIndex];
    const newResults = [...sequenceResults, { snippetId: currentSnippetId, snippetName: '', result }];
    setSequenceResults(newResults);

    const nextIndex = sequenceIndex + 1;
    if (nextIndex < currentQueue.length) {
      setSequenceIndex(nextIndex);
      const nextSnippetId = currentQueue[nextIndex];
      const nextSnippet = snippets.find(s => s.id === nextSnippetId);
      if (nextSnippet) {
        handleStartGame(nextSnippet.code, nextSnippet.lang);
      }
    } else {
      setShowSequenceSummary(true);
    }
  };

  const getSequenceButtonText = () => {
    const nextIndex = sequenceIndex + 1;
    if (nextIndex >= sequenceQueue.length) {
      return 'Finish';
    }
    return 'Next';
  };

  const handleFinishSequence = () => {
    setSequenceQueue([]);
    setSequenceIndex(0);
    setSequenceResults([]);
    setShowSequenceSummary(false);
    navigate('/library');
  };

  const isInSequence = sequenceQueue.length > 0;

  const handleBack = () => {
    if (sequenceQueue.length > 0) {
      setSequenceQueue([]);
      setSequenceIndex(0);
      setSequenceResults([]);
    }
    navigate('/library');
  };

  const handleGoToLibrary = () => {
    navigate('/library');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="text-base-content antialiased">
      <Routes>
        <Route path="/" element={<HomePage onStartGame={handleStartGame} onGoToLibrary={handleGoToLibrary} />} />
        <Route 
          path="/game" 
          element={
            <GamePageWrapper 
              sequenceButtonText={isInSequence ? getSequenceButtonText() : undefined}
              onSequenceResult={isInSequence ? handleSequenceResult : undefined} 
              onBack={isInSequence ? handleBack : handleGoHome}
            />
          } 
        />
        <Route 
          path="/library" 
          element={
            <LibraryPage 
              onBack={handleGoHome}
              onStartGame={handleStartGame}
              onStartSequence={handleStartSequence}
              isInSequence={isInSequence}
              sequenceResults={sequenceResults}
              onFinishSequence={handleFinishSequence}
            />
          } 
        />
      </Routes>
      {showSequenceSummary && (
        <SequenceSummary 
          results={sequenceResults}
          onBack={handleFinishSequence}
        />
      )}
    </div>
  );
};

const GamePageWrapper = ({ 
  sequenceButtonText, 
  onSequenceResult, 
  onBack 
}: { 
  sequenceButtonText?: string;
  onSequenceResult?: (result: ExerciseResult) => void; 
  onBack: () => void 
}) => {
  const searchParams = new URLSearchParams(window.location.search);
  
  const codeParam = searchParams.get('code');
  const langParam = searchParams.get('lang') || 'auto';
  const optionsParam = searchParams.get('options');
  
  const code = codeParam ? atob(codeParam) : '';
  const options = optionsParam ? JSON.parse(atob(optionsParam)) as GameOptions : {
    stopOnError: false,
    timeLimit: null,
    practiceMode: false,
    practiceRepetitions: 5,
  };

  return <GamePage code={code} lang={langParam} options={options} onBack={onBack} onFinish={onSequenceResult} sequenceButtonText={sequenceButtonText} />;
};

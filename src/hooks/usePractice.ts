import { useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';

export const usePractice = () => {
  const {
    chars,
    options,
    practiceState,
    startPractice,
    updatePracticeInput,
    incrementPracticeCount,
    resetPracticeCount,
    exitPractice,
    pauseTimer,
    resumeTimer,
  } = useGameStore();

  const extractWord = useCallback((charIndex: number): string => {
    const charsArray = chars;
    let start = charIndex;
    let end = charIndex;

    while (start > 0 && charsArray[start - 1].char !== ' ' && charsArray[start - 1].char !== '\n') {
      start--;
    }

    while (end < charsArray.length && charsArray[end].char !== ' ' && charsArray[end].char !== '\n') {
      end++;
    }

    return charsArray.slice(start, end).map(c => c.char).join('');
  }, [chars]);

  const handleError = useCallback((errorIndex: number) => {
    if (options.practiceMode && !practiceState.isActive) {
      const word = extractWord(errorIndex);
      if (word.trim()) {
        pauseTimer();
        startPractice(word, errorIndex);
      }
    }
  }, [options.practiceMode, practiceState.isActive, extractWord, pauseTimer, startPractice]);

  const handlePracticeComplete = useCallback(() => {
    incrementPracticeCount();
  }, [incrementPracticeCount]);

  const handlePracticeError = useCallback(() => {
    resetPracticeCount();
  }, [resetPracticeCount]);

  const handlePracticeExit = useCallback(() => {
    exitPractice();
    resumeTimer();
  }, [exitPractice, resumeTimer]);

  const handleInputChange = useCallback((input: string) => {
    updatePracticeInput(input);
  }, [updatePracticeInput]);

  return {
    practiceState,
    handleError,
    handlePracticeComplete,
    handlePracticeError,
    handlePracticeExit,
    handleInputChange,
    isPracticeActive: practiceState.isActive,
  };
};

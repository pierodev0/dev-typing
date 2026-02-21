import { useCallback, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

export const useTyping = (onError?: (errorIndex: number) => void) => {
  const { 
    chars, 
    cursor, 
    isFinished, 
    stats,
    options,
    practiceState,
    setCursor, 
    updateChar, 
    incrementErrors,
    startTimer,
    finishGame,
  } = useGameStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [shake, setShake] = useState(false);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 200);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished || practiceState.isActive) return;

    if (e.key === 'Escape') {
      finishGame();
      return;
    }

    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;

    if (inputRef.current) {
      inputRef.current.focus();
    }

    if (!stats.started) {
      startTimer();
    }

    if (e.key === 'Backspace') {
      if (options.stopOnError && chars[cursor]?.status === 'incorrect') {
        updateChar(cursor, { status: 'waiting', typed: null });
        return;
      }
      
      if (cursor > 0) {
        let newCur = cursor - 1;
        while (newCur > 0 && chars[newCur].status === 'auto') {
          updateChar(newCur, { status: 'waiting' });
          newCur--;
        }
        updateChar(newCur, { status: 'waiting', typed: null });
        setCursor(newCur);
        
        const attempted = newCur;
        const currentErrors = useGameStore.getState().stats.errors;
        const acc = attempted > 0 
          ? Math.round(((attempted - currentErrors) / attempted) * 100) 
          : 100;
        useGameStore.getState().setStats({ acc: Math.max(0, acc) });
      }
      return;
    }

    const char = e.key === 'Enter' ? '\n' : e.key;
    if (char.length > 1) return;

    const target = chars[cursor];
    if (!target) return;

    let newCur = cursor;

    if (char === target.char) {
      updateChar(cursor, { status: 'correct', typed: char });
      newCur++;
      
      if (char === '\n') {
        while (newCur < chars.length && chars[newCur].isIndent) {
          updateChar(newCur, { status: 'auto' });
          newCur++;
        }
      }
    } else {
      updateChar(cursor, { status: 'incorrect', typed: char });
      if (target.status !== 'incorrect') {
        incrementErrors();
      }
      triggerShake();
      
      if (options.practiceMode && onError) {
        onError(cursor);
        return;
      }
      
      if (options.stopOnError) {
        return;
      }
      newCur++;
    }

    const attempted = newCur;
    const currentErrors = useGameStore.getState().stats.errors;
    const acc = attempted > 0 
      ? Math.round(((attempted - currentErrors) / attempted) * 100) 
      : 100;

    setCursor(newCur);
    useGameStore.getState().setStats({ acc: Math.max(0, acc) });

    if (newCur >= chars.length) {
      finishGame();
    }
  }, [chars, cursor, isFinished, stats.started, options.stopOnError, options.practiceMode, practiceState.isActive, setCursor, updateChar, incrementErrors, startTimer, finishGame, triggerShake, onError]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return {
    handleKeyDown,
    inputRef,
    shake,
    focusInput,
  };
};

import { useCallback, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

const processCharacter = (
  char: string,
  cursor: number,
  chars: ReturnType<typeof useGameStore.getState>['chars'],
  options: ReturnType<typeof useGameStore.getState>['options'],
  updateChar: (index: number, updates: Partial<ReturnType<typeof useGameStore.getState>['chars'][0]>) => void,
  incrementErrors: () => void,
  setCursor: (cursor: number) => void,
  triggerShake: () => void,
  onError?: (errorIndex: number) => void,
  finishGame?: () => void,
) => {
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

  if (newCur >= chars.length && finishGame) {
    finishGame();
  }
};

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
  const lastProcessedRef = useRef<string>('');

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

    e.preventDefault();

    lastProcessedRef.current = char;
    processCharacter(char, cursor, chars, options, updateChar, incrementErrors, setCursor, triggerShake, onError, finishGame);
  }, [chars, cursor, isFinished, stats.started, options, practiceState.isActive, setCursor, updateChar, incrementErrors, startTimer, finishGame, triggerShake, onError]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
    if (isFinished || practiceState.isActive) return;
    
    const input = e.currentTarget.value;
    
    if (input.length === 0) return;

    const lastChar = input[input.length - 1];
    
    if (lastChar === lastProcessedRef.current) {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    if (!stats.started) {
      startTimer();
    }

    lastProcessedRef.current = lastChar;
    processCharacter(lastChar, cursor, chars, options, updateChar, incrementErrors, setCursor, triggerShake, onError, finishGame);
    
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [isFinished, practiceState.isActive, stats.started, cursor, chars, options, updateChar, incrementErrors, setCursor, startTimer, triggerShake, onError, finishGame]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return {
    handleKeyDown,
    handleInput,
    inputRef,
    shake,
    focusInput,
  };
};

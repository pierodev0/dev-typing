import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';

export const useTimer = () => {
  const { stats, isFinished, startTime, options } = useGameStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateStats = useCallback(() => {
    if (!startTime) return;
    
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const mins = (now - startTime) / 60000;
    const chars = useGameStore.getState().chars;
    const cursor = useGameStore.getState().cursor;
    const correctChars = chars.slice(0, cursor).filter((c) => c.status === 'correct').length;
    const wpm = mins > 0 ? Math.round((correctChars / 5) / mins) : 0;
    
    useGameStore.getState().setStats({
      wpm,
      time: elapsed,
    });

    if (options.timeLimit && elapsed >= options.timeLimit) {
      useGameStore.getState().finishGame();
    }
  }, [startTime, options.timeLimit]);

  useEffect(() => {
    if (stats.started && !isFinished) {
      timerRef.current = setInterval(updateStats, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stats.started, isFinished, updateStats]);

  const timeRemaining = options.timeLimit && stats.started
    ? Math.max(0, options.timeLimit - stats.time)
    : null;

  return {
    time: stats.time,
    wpm: stats.wpm,
    timeRemaining,
    timeLimit: options.timeLimit,
  };
};

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';

export const useAutoScroll = () => {
  const cursor = useGameStore((state) => state.cursor);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursorEl = document.getElementById('cursor-el');
    if (cursorEl && scrollRef.current && containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const offset = cursorEl.offsetTop;
      const currentTransform = scrollRef.current.style.transform || 'translateY(0px)';
      const currentScroll = parseFloat(currentTransform.replace(/[^-\d.]/g, '') || '0');
      
      if (offset + currentScroll > containerHeight / 2) {
        const newScroll = containerHeight / 2 - offset;
        scrollRef.current.style.transform = `translateY(${newScroll}px)`;
      } else if (offset < 100) {
        scrollRef.current.style.transform = 'translateY(0px)';
      }
    }
  }, [cursor]);

  return { scrollRef, containerRef };
};

import type { Grade } from '@/types';

export const getGrade = (wpm: number, acc: number): Grade => {
  if (wpm > 80 && acc > 98) return { label: 'S', color: 'text-yellow-400', desc: 'Legendary' };
  if (wpm > 60 && acc > 95) return { label: 'A', color: 'text-green-400', desc: 'Professional' };
  if (wpm > 40 && acc > 90) return { label: 'B', color: 'text-blue-400', desc: 'Competent' };
  if (wpm > 20 && acc > 80) return { label: 'C', color: 'text-orange-400', desc: 'Novice' };
  return { label: 'D', color: 'text-red-400', desc: 'Needs Practice' };
};

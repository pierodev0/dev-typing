import type { Char } from '@/types';

interface CharComponentProps {
  char: Char;
  isCursor: boolean;
}

export const CharComponent = ({ char, isCursor }: CharComponentProps) => {
  const getStatusClass = () => {
    switch (char.status) {
      case 'correct':
        return 'char-correct';
      case 'incorrect':
        return 'char-incorrect';
      case 'auto':
        return 'char-auto';
      default:
        return 'char-waiting';
    }
  };

  const syntaxClass = char.status === 'waiting' || char.status === 'correct' 
    ? char.className 
    : '';

  const displayChar = char.status === 'incorrect' && char.typed
    ? char.typed === '\n' ? '↵' : char.typed
    : char.char;

  return (
    <span
      id={isCursor ? 'cursor-el' : undefined}
      className={`${getStatusClass()} ${syntaxClass} ${isCursor ? 'cursor-block' : ''} transition-colors duration-100`}
    >
      {displayChar}
    </span>
  );
};

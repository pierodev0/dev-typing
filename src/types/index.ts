export type CharStatus = 'waiting' | 'correct' | 'incorrect' | 'auto';

export interface Char {
  char: string;
  className: string;
  status: CharStatus;
  typed: string | null;
  isIndent?: boolean;
}

export interface GameStats {
  wpm: number;
  acc: number;
  time: number;
  errors: number;
  started: boolean;
}

export interface GameState {
  chars: Char[];
  cursor: number;
  stats: GameStats;
  isFinished: boolean;
  code: string;
  lang: string;
}

export interface Grade {
  label: string;
  color: string;
  desc: string;
}

export interface CodeSnippet {
  name: string;
  icon: string;
  color: string;
  code: string;
}

export interface GameOptions {
  stopOnError: boolean;
  timeLimit: number | null;
  practiceMode: boolean;
  practiceRepetitions: number;
}

export interface PracticeState {
  isActive: boolean;
  targetWord: string;
  currentInput: string;
  repetitionCount: number;
  requiredRepetitions: number;
  errorCharIndex: number;
  wordStartIndex: number;
}

export type SnippetsMap = Record<string, CodeSnippet>;

export interface ExerciseResult {
  id: string;
  date: string;
  wpm: number;
  acc: number;
  time: number;
  errors: number;
}

export interface SavedSnippet {
  id: string;
  name: string;
  code: string;
  lang: string;
  createdAt: string;
  results: ExerciseResult[];
}

export interface CustomLanguage {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface SavedSequence {
  id: string;
  name: string;
  snippetIds: string[];
  createdAt: string;
  lastPracticedAt: string | null;
}

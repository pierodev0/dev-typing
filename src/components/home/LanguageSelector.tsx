import type { SnippetsMap } from '@/types';

interface LanguageSelectorProps {
  snippets: SnippetsMap;
  selected: string;
  onSelect: (key: string) => void;
}

export const LanguageSelector = ({ snippets, selected, onSelect }: LanguageSelectorProps) => {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {Object.entries(snippets).map(([key, data]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border ${
            selected === key
              ? 'bg-white/10 border-tokyo-blue text-white shadow-lg'
              : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
          }`}
        >
          <i className={`fa-brands ${data.icon} ${data.color}`}></i> {data.name}
        </button>
      ))}
    </div>
  );
};

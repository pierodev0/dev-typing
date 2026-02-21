import type { SnippetsMap } from '@/types';

interface LanguageSelectorProps {
  snippets: SnippetsMap;
  selected: string;
  onSelect: (key: string) => void;
}

export const LanguageSelector = ({ snippets, selected, onSelect }: LanguageSelectorProps) => {
  const getIconClass = (icon: string) => {
    if (icon.startsWith('fa-') && !icon.startsWith('fa-solid') && !icon.startsWith('fa-brands')) {
      const brandIcons = ['fa-js', 'fa-python', 'fa-rust', 'fa-node', 'fa-react', 'fa-vue', 'fa-angular', 'fa-github'];
      if (brandIcons.includes(icon)) {
        return `fa-brands ${icon}`;
      }
      return `fa-solid ${icon}`;
    }
    return icon;
  };

  return (
    <div className="flex gap-1 md:gap-2 mb-4 md:mb-6 flex-wrap">
      {Object.entries(snippets).map(([key, data]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`py-1.5 px-2 md:py-2 md:px-3 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 md:gap-2 border ${
            selected === key
              ? 'bg-white/10 border-tokyo-blue text-white shadow-lg'
              : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
          }`}
        >
          <i className={`${getIconClass(data.icon)} ${data.color}`}></i>
          <span className="hidden sm:inline">{data.name}</span>
        </button>
      ))}
    </div>
  );
};

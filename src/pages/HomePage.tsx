import { useState } from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { CodePreview } from '@/components/home/CodePreview';
import { CustomBuffer } from '@/components/home/CustomBuffer';
import { LanguageSelector } from '@/components/home/LanguageSelector';
import { REPO_DATA } from '@/data/codeSnippets';

interface HomePageProps {
  onStartGame: (code: string, lang: string) => void;
}

export const HomePage = ({ onStartGame }: HomePageProps) => {
  const [selectedLang, setSelectedLang] = useState('js');

  const handleCustomCode = (code: string) => {
    onStartGame(code, 'auto');
  };

  return (
    <div className="min-h-screen bg-tokyo-bg-darkest flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-6xl w-full space-y-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[10px] font-mono text-gray-400 mb-4 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            SYSTEM ONLINE
          </div>
          <h1 className="text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-3">
            DEV<span className="text-tokyo-blue">TYPE</span>
          </h1>
          <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">Master Your Coding Speed</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold">Stack Library</h2>
              <i className="fa-solid fa-layer-group text-tokyo-blue"></i>
            </div>

            <LanguageSelector
              snippets={REPO_DATA}
              selected={selectedLang}
              onSelect={setSelectedLang}
            />

            <CodePreview
              code={REPO_DATA[selectedLang].code}
              filename={`index.${selectedLang}`}
            />

            <button
              className="btn w-full mt-6 bg-tokyo-blue hover:bg-tokyo-blue/80 text-tokyo-bg border-none font-bold py-3 shadow-lg shadow-tokyo-blue/20"
              onClick={() => onStartGame(REPO_DATA[selectedLang].code, selectedLang)}
            >
              <i className="fa-solid fa-bolt mr-2"></i> Initialize Session
            </button>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold">Custom Buffer</h2>
              <i className="fa-solid fa-terminal text-tokyo-blue"></i>
            </div>

            <CustomBuffer onSubmit={handleCustomCode} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

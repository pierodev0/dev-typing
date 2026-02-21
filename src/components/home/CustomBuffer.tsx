import { useState } from 'react';

interface CustomBufferProps {
  onSubmit: (code: string) => void;
}

export const CustomBuffer = ({ onSubmit }: CustomBufferProps) => {
  const [customCode, setCustomCode] = useState('');

  return (
    <div>
      <div className="bg-tokyo-bg rounded-xl h-64 relative border border-white/5">
        <div className="absolute top-0 left-0 right-0 h-8 bg-tokyo-bg-dark flex items-center px-4 border-b border-white/5 text-[10px] text-gray-500 font-mono">
          buffer.input
        </div>
        <textarea
          className="w-full h-full bg-transparent p-4 pt-10 font-code text-xs text-gray-300 resize-none focus:outline-none focus:ring-0"
          placeholder="// Paste your own code snippet here..."
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          spellCheck="false"
        ></textarea>
      </div>

      <button
        className="btn w-full mt-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3"
        disabled={!customCode.trim()}
        onClick={() => onSubmit(customCode)}
      >
        <i className="fa-solid fa-wand-magic-sparkles mr-2 text-tokyo-blue"></i> Analyze & Run
      </button>
    </div>
  );
};

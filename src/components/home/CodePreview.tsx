import type { ReactNode } from 'react';

interface CodePreviewProps {
  code: string;
  filename: string;
  children?: ReactNode;
}

export const CodePreview = ({ code, filename, children }: CodePreviewProps) => {
  return (
    <div className="bg-tokyo-bg rounded-xl h-52 overflow-hidden border border-white/5 shadow-inner relative">
      <div className="absolute top-0 left-0 right-0 h-8 bg-tokyo-bg-dark flex items-center px-4 gap-2 border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-tokyo-red/50"></span>
        <span className="w-3 h-3 rounded-full bg-tokyo-yellow/50"></span>
        <span className="w-3 h-3 rounded-full bg-tokyo-green/50"></span>
        <span className="text-[10px] text-gray-500 ml-2 font-mono">{filename}</span>
      </div>
      <pre className="p-4 pt-12 text-xs font-code text-gray-400 overflow-auto h-full">
        <code>{code}</code>
      </pre>
      {children}
    </div>
  );
};

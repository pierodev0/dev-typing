import hljs from 'highlight.js';
import type { Char } from '@/types';

export const parseCodeToChars = (codeString: string, lang: string): { chars: Char[]; detectedLang: string } => {
  const hlResult = lang === 'auto' 
    ? hljs.highlightAuto(codeString) 
    : hljs.highlight(codeString, { language: lang });
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = hlResult.value;

  const chars: Char[] = [];

  const traverse = (node: Node, inheritedClass: string | null) => {
    if (node.nodeType === 3) {
      const text = node.nodeValue || '';
      for (const char of text) {
        chars.push({
          char,
          className: inheritedClass || '',
          status: 'waiting',
          typed: null,
        });
      }
    } else if (node.nodeType === 1) {
      const element = node as Element;
      const newClass = inheritedClass 
        ? `${inheritedClass} ${element.className}` 
        : element.className;
      node.childNodes.forEach((child) => traverse(child, newClass));
    }
  };

  tempDiv.childNodes.forEach((child) => traverse(child, null));

  let isStartOfLine = true;
  for (const c of chars) {
    if (c.char === '\n') {
      isStartOfLine = true;
      continue;
    }
    if (isStartOfLine) {
      if (c.char === ' ' || c.char === '\t') {
        c.isIndent = true;
      } else {
        isStartOfLine = false;
      }
    }
  }

  return { chars, detectedLang: hlResult.language || 'plaintext' };
};

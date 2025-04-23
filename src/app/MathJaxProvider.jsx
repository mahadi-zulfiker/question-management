"use client";

import { MathJaxContext } from 'better-react-mathjax';

const mathJaxConfig = {
  loader: { load: ['[tex]/ams', '[tex]/html'] },
  tex: {
    packages: { '[+]': ['base', 'ams', 'html'] },
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$']],
  },
  options: {
    skipHtmlTags: [], // Allow MathJax to process all tags
    processHtmlClass: 'math-tex',
  },
  startup: {
    typeset: false,
  },
  chtml: {
    fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2',
    scale: 1,
    minScale: 0.5,
    mtextInheritFont: true,
    matchFontHeight: true,
  },
};

export function MathJaxProvider({ children }) {
  return (
    <MathJaxContext version={3} config={mathJaxConfig}>
      {children}
    </MathJaxContext>
  );
}
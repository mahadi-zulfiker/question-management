"use client";

import { MathJaxContext } from 'better-react-mathjax';

const mathJaxConfig = {
  loader: { load: ['[tex]/ams'] },
  tex: {
    packages: ['base', 'ams'],
  },
};

export default function MathJaxProvider({ children }) {
  return (
    <MathJaxContext version={3} config={mathJaxConfig}>
      {children}
    </MathJaxContext>
  );
}

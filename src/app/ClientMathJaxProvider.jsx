"use client";

import { MathJaxProvider } from "./MathJaxProvider";

export default function ClientMathJaxProvider({ children }) {
  return <MathJaxProvider>{children}</MathJaxProvider>;
}
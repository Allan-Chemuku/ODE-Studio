import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathViewProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export default function MathView({ math, displayMode = false, className = "" }: MathViewProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Parse out double/single dollar signs if they were passed in
      let cleanMath = math.trim();
      if (cleanMath.startsWith("$$") && cleanMath.endsWith("$$")) {
        cleanMath = cleanMath.slice(2, -2).trim();
      } else if (cleanMath.startsWith("$") && cleanMath.endsWith("$")) {
        cleanMath = cleanMath.slice(1, -1).trim();
      }

      katex.render(cleanMath, containerRef.current, {
        displayMode: displayMode,
        throwOnError: false,
        trust: true,
      });
    } catch (err) {
      console.warn("KaTeX rendering error:", err);
      // Fallback to simple styled monospace text so the app never crashes
      containerRef.current.textContent = math;
    }
  }, [math, displayMode]);

  return (
    <span 
      ref={containerRef} 
      className={`inline-block math-container font-serif select-all ${className}`}
    />
  );
}

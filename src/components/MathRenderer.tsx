import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * Component for rendering LaTeX math expressions
 * Supports both inline ($...$) and display ($$...$$) math
 */
const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Parse and render LaTeX expressions
      const rendered = renderMath(content);
      containerRef.current.innerHTML = rendered;
    } catch (error) {
      console.error('Error rendering LaTeX:', error);
      // Fallback to plain text if LaTeX fails
      containerRef.current.textContent = content;
    }
  }, [content]);

  return <div ref={containerRef} className={className} />;
};

/**
 * Parse text and render LaTeX expressions
 * Supports:
 * - Inline math: $...$
 * - Display math: $$...$$
 * - Mixed text and math
 */
function renderMath(text: string): string {
  let result = text;
  
  // First, handle display math ($$...$$)
  result = result.replace(/\$\$(.*?)\$\$/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
      });
    } catch (error) {
      return `$$${latex}$$`;
    }
  });

  // Then, handle inline math ($...$)
  result = result.replace(/\$(.*?)\$/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch (error) {
      return `$${latex}$`;
    }
  });

  return result;
}

export default MathRenderer;

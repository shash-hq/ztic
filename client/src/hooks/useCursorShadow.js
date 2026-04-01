import { useEffect } from 'react';

// Attach to any container — cards inside it get cursor-reactive shadows
// Usage: useCursorShadow('.bento-card')
export const useCursorShadow = (selector) => {
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.querySelectorAll(selector).forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        const ox = Math.round(4 + dx * 3);
        const oy = Math.round(4 + dy * 3);
        // Only update non-hovered cards so hover CSS still wins
        if (!card.matches(':hover')) {
          card.style.boxShadow = `${ox}px ${oy}px 0px 0px #1A1C1A`;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [selector]);
};

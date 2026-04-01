import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Usage: const ref = useScrollReveal({ y: 40, duration: 0.8 });
// Attach ref to any container — all .gsap-reveal children animate in
export const useScrollReveal = (options = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.gsap-reveal').forEach((el, i) => {
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: options.y ?? 36,
            x: options.x ?? 0,
            scale: options.scale ?? 1,
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            duration: options.duration ?? 0.75,
            delay: i * (options.stagger ?? 0.07),
            ease: options.ease ?? 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
};

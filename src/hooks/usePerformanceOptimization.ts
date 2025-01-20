import { useEffect, useRef } from 'react';
import { debounce } from '../utils/performance/debounce';

export const usePerformanceOptimization = () => {
  const fpsRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const calculateFPS = () => {
      const now = performance.now();
      frameCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
    };

    const optimizeRendering = debounce(() => {
      if (fpsRef.current < 30) {
        // Reduce visual complexity
        document.body.classList.add('reduce-animations');
      } else {
        document.body.classList.remove('reduce-animations');
      }
    }, 1000);

    const frame = () => {
      calculateFPS();
      optimizeRendering();
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }, []);

  return { currentFPS: fpsRef.current };
};
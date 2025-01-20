interface PerformanceMetrics {
  fps: number;
  processingTime: number;
  memoryUsage: number;
}

let lastFrameTime = performance.now();
let frameCount = 0;
let lastFPS = 0;

export const measurePerformance = (): PerformanceMetrics => {
  const now = performance.now();
  frameCount++;

  if (now - lastFrameTime >= 1000) {
    lastFPS = frameCount;
    frameCount = 0;
    lastFrameTime = now;
  }

  return {
    fps: lastFPS,
    processingTime: performance.now() - now,
    memoryUsage: performance.memory?.usedJSHeapSize || 0
  };
};

export const optimizePerformance = (callback: () => void): void => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => callback());
  } else {
    setTimeout(callback, 0);
  }
};
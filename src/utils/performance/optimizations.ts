export const optimizeAudioProcessing = {
  // Batch processing for audio analysis
  batchSize: 4096, // Increased for better performance
  processingInterval: 50, // Reduced for lower latency
  
  // Memory management
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  cleanupInterval: 30000, // 30 seconds for more frequent cleanup
  
  // Performance thresholds
  fpsThreshold: 60,
  processingTimeThreshold: 8, // Reduced for better responsiveness
  
  // WebWorker configuration
  maxWorkers: navigator.hardwareConcurrency || 4,
  workerTimeout: 3000,

  // Mobile optimizations
  mobileConfig: {
    batchSize: 2048, // Smaller batch size for mobile
    fpsThreshold: 30, // Lower FPS target for mobile
    reducedVisualization: true // Simplified visuals for better performance
  }
};

export const performanceMetrics = {
  fps: 0,
  processingTime: 0,
  memoryUsage: 0,
  cacheSize: 0
};

export const monitorPerformance = () => {
  let frameCount = 0;
  let lastTime = performance.now();

  const update = () => {
    const now = performance.now();
    frameCount++;

    if (now - lastTime >= 1000) {
      performanceMetrics.fps = frameCount;
      frameCount = 0;
      lastTime = now;

      // Update memory usage if available
      if (performance.memory) {
        performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
      }
    }

    requestAnimationFrame(update);
  };

  update();
};

export const optimizeRendering = () => {
  if (performanceMetrics.fps < optimizeAudioProcessing.fpsThreshold) {
    // Reduce visual complexity
    document.body.classList.add('reduce-animations');
    return true;
  }
  
  document.body.classList.remove('reduce-animations');
  return false;
};
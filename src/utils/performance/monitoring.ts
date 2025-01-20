interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  processingTime: number;
  audioLatency: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    fps: 0,
    memoryUsage: 0,
    processingTime: 0,
    audioLatency: 0
  };
  private readonly PERFORMANCE_THRESHOLD = {
    MIN_FPS: 30,
    MAX_AUDIO_LATENCY: 100,
    MAX_PROCESSING_TIME: 16,
    MAX_MEMORY_USAGE: 100 * 1024 * 1024 // 100MB
  };

  private frameCount: number = 0;
  private lastFrameTime: number = performance.now();
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    this.monitorFrameRate();
    this.monitorMemory();
    this.monitorAudioLatency();
    this.setupPerformanceObserver();
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private monitorFrameRate(): void {
    const updateFPS = () => {
      const now = performance.now();
      this.frameCount++;

      if (now - this.lastFrameTime >= 1000) {
        this.metrics.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFrameTime = now;
        this.notifyObservers();
      }

      requestAnimationFrame(updateFPS);
    };

    requestAnimationFrame(updateFPS);
  }

  private monitorMemory(): void {
    const updateMemory = () => {
      if (performance.memory) {
        this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
        this.notifyObservers();
      }
    };

    setInterval(updateMemory, 5000);
  }

  private monitorAudioLatency(): void {
    const audioContext = new AudioContext();
    
    const measureLatency = () => {
      const startTime = performance.now();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      
      oscillator.connect(analyser);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      
      this.metrics.audioLatency = performance.now() - startTime;
      this.notifyObservers();
    };

    setInterval(measureLatency, 10000);
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.metrics.processingTime = entry.duration;
            this.checkPerformanceThresholds();
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure'] });
    }
  }

  private checkPerformanceThresholds(): void {
    if (this.metrics.fps < this.PERFORMANCE_THRESHOLD.MIN_FPS) {
      this.optimizeRendering();
    }
    if (this.metrics.audioLatency > this.PERFORMANCE_THRESHOLD.MAX_AUDIO_LATENCY) {
      this.optimizeAudioProcessing();
    }
    if (this.metrics.memoryUsage > this.PERFORMANCE_THRESHOLD.MAX_MEMORY_USAGE) {
      this.cleanupMemory();
    }
  }

  private cleanupMemory(): void {
    // Notify observers to clean up unused resources
    this.notifyObservers({ type: 'memory-pressure' });
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  private optimizeRendering(): void {
    document.body.classList.add('reduce-animations');
    // Reduce visualization complexity
    this.notifyObservers({ type: 'performance-degradation' });
  }

  private optimizeAudioProcessing(): void {
    // Increase buffer size or reduce processing
    this.notifyObservers({ type: 'audio-latency' });
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer({ ...this.metrics }));
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}
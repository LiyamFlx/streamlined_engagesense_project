export class AudioVisualizer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  public width: number;
  public height: number;
  private animationFrame: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    this.ctx = ctx;

    // Get the container dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set logical size
    this.width = rect.width / dpr;
    this.height = rect.height / dpr;

    // Set display size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Set actual size in memory
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.ctx.scale(dpr, dpr);
  }

  drawFrequencyBars(analyzerNode: AnalyserNode, options = {
    barWidth: 2,
    barGap: 1,
    minHeight: 2,
    maxHeight: this.height * 0.8, // Leave some padding
    minDecibels: -90,
    maxDecibels: -10
  }) {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    // Configure analyzer
    analyzerNode.minDecibels = options.minDecibels;
    analyzerNode.maxDecibels = options.maxDecibels;

    const frequencyData = new Uint8Array(analyzerNode.frequencyBinCount);
    
    const draw = () => {
      this.animationFrame = requestAnimationFrame(draw);
      analyzerNode.getByteFrequencyData(frequencyData);

      // Clear with background
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      const barCount = Math.floor(this.width / (options.barWidth + options.barGap));
      const dataStep = Math.floor(frequencyData.length / barCount);

      for (let i = 0; i < barCount; i++) {
        // Average a range of frequencies for smoother visualization
        const start = i * dataStep;
        const end = start + dataStep;
        let sum = 0;
        for (let j = start; j < end; j++) {
          sum += frequencyData[j];
        }
        const value = sum / dataStep;

        const percent = value / 255;
        const barHeight = Math.max(
          options.minHeight,
          Math.min(options.maxHeight * percent, options.maxHeight)
        );
        
        // Create gradient based on frequency
        const gradient = this.ctx.createLinearGradient(0, this.height, 0, this.height - barHeight);
        gradient.addColorStop(0, `hsla(${(i / barCount) * 360}, 80%, 60%, 0.8)`);
        gradient.addColorStop(1, `hsla(${(i / barCount) * 360}, 80%, 80%, 0.8)`);
        this.ctx.fillStyle = gradient;

        this.ctx.fillRect(
          i * (options.barWidth + options.barGap),
          this.height - barHeight,
          options.barWidth,
          barHeight
        );
      }
    };
    
    draw();
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
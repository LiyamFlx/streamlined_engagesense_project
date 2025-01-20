import { AudioMetrics } from '../../types/audio';

export const drawHeatmap = (
  ctx: CanvasRenderingContext2D,
  history: AudioMetrics[],
  width: number,
  height: number
) => {
  const metrics = ['physical', 'emotional', 'mental', 'spiritual'] as const;
  const cellWidth = Math.max(width / Math.max(history.length, 1), 1);
  const cellHeight = Math.max(height / metrics.length, 1);
  const padding = 60; // Space for labels

  ctx.clearRect(0, 0, width, height);

  // Draw background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(padding, 0, width - padding, height);

  // Draw heatmap cells
  history.forEach((data, timeIndex) => {
    metrics.forEach((metric, metricIndex) => {
      const value = data[metric];
      const x = padding + timeIndex * cellWidth;
      const y = metricIndex * cellHeight;

      // Create gradient color based on value
      const hue = ((1 - value / 100) * 240);
      ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.8)`;
      ctx.fillRect(x, y, cellWidth, cellHeight);

      if (cellWidth > 2) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.strokeRect(x, y, cellWidth, cellHeight);
      }
    });
  });

  // Draw labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  metrics.forEach((metric, i) => {
    const label = metric.charAt(0).toUpperCase() + metric.slice(1);
    const y = i * cellHeight + cellHeight / 2;
    ctx.fillText(label, padding - 10, y);
  });

  // Draw time labels if enough space
  if (cellWidth >= 30 && history.length > 0) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const step = Math.max(1, Math.floor(history.length / 5));
    
    for (let i = 0; i < history.length; i += step) {
      const x = padding + i * cellWidth + cellWidth / 2;
      const time = new Date(Date.now() - (history.length - i) * 1000)
        .toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
      ctx.fillText(time, x, height + 5);
    }
  }
};
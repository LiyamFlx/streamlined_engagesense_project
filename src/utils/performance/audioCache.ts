interface CacheEntry {
  buffer: AudioBuffer;
  timestamp: number;
}

export class AudioCache {
  private cache: Map<string, CacheEntry>;
  private readonly maxSize: number;
  private readonly ttl: number;

  constructor(maxSize = 50, ttl = 3600000) { // 1 hour TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  async get(url: string): Promise<AudioBuffer | null> {
    const entry = this.cache.get(url);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(url);
      return null;
    }
    
    return entry.buffer;
  }

  set(url: string, buffer: AudioBuffer): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(url, {
      buffer,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}
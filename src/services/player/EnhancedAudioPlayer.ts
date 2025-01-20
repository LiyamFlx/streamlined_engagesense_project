import { AudioCache } from '../cache/audioCache';
import { AudioData } from '../../types/audio';

interface PlayerConfig {
  crossfadeDuration: number;
  preloadCount: number;
  bufferSize: number;
  enableVisualization: boolean;
}

export class EnhancedAudioPlayer {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private nextSource: AudioBufferSourceNode | null = null;
  private cache: AudioCache;
  private config: PlayerConfig;
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;
  private preloadQueue: string[] = [];

  constructor(config: Partial<PlayerConfig> = {}) {
    this.config = {
      crossfadeDuration: 2000,
      preloadCount: 3,
      bufferSize: 2048,
      enableVisualization: true,
      ...config
    };

    this.cache = new AudioCache(50, 3600000); // 50 tracks, 1 hour TTL
  }

  async initialize(): Promise<void> {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    
    if (this.config.enableVisualization) {
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = this.config.bufferSize;
      this.analyserNode.smoothingTimeConstant = 0.8;
    }

    this.setupAudioGraph();
  }

  async play(url: string, trackId: string): Promise<void> {
    if (!this.audioContext) throw new Error('Player not initialized');

    try {
      const buffer = await this.getAudioBuffer(url);
      
      if (this.isPlaying) {
        await this.crossfade(buffer, trackId);
      } else {
        await this.startPlayback(buffer, trackId);
      }

      this.currentTrackId = trackId;
      this.isPlaying = true;

      // Preload next tracks
      this.preloadNextTracks();
    } catch (error) {
      console.error('Playback failed:', error);
      throw error;
    }
  }

  pause(): void {
    if (!this.isPlaying) return;
    
    const fadeOutDuration = 500; // ms
    this.fadeOut(fadeOutDuration);
    this.isPlaying = false;
  }

  resume(): void {
    if (this.isPlaying) return;
    
    const fadeInDuration = 500; // ms
    this.fadeIn(fadeInDuration);
    this.isPlaying = true;
  }

  stop(): void {
    this.currentSource?.stop();
    this.nextSource?.stop();
    this.currentSource = null;
    this.nextSource = null;
    this.isPlaying = false;
    this.currentTrackId = null;
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  setPreloadQueue(trackUrls: string[]): void {
    this.preloadQueue = trackUrls;
    this.preloadNextTracks();
  }

  private setupAudioGraph(): void {
    if (!this.audioContext || !this.gainNode) return;

    if (this.analyserNode) {
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
    } else {
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  private async getAudioBuffer(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    // Check cache first
    const cached = await this.cache.get(url);
    if (cached) return cached;

    // Fetch and decode
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // Cache for future use
    this.cache.set(url, audioBuffer);

    return audioBuffer;
  }

  private async startPlayback(buffer: AudioBuffer, trackId: string): Promise<void> {
    if (!this.audioContext || !this.gainNode) return;

    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = buffer;
    this.currentSource.connect(this.gainNode);

    this.currentSource.onended = () => {
      if (this.currentTrackId === trackId) {
        this.isPlaying = false;
        this.currentTrackId = null;
      }
    };

    this.currentSource.start();
  }

  private async crossfade(newBuffer: AudioBuffer, newTrackId: string): Promise<void> {
    if (!this.audioContext || !this.gainNode) return;

    // Create new source
    const newSource = this.audioContext.createBufferSource();
    const newGain = this.audioContext.createGain();
    newSource.buffer = newBuffer;
    newSource.connect(newGain);
    newGain.connect(this.gainNode);

    // Fade out current track
    if (this.currentSource && this.gainNode) {
      const currentGain = this.gainNode.gain.value;
      this.gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + this.config.crossfadeDuration / 1000
      );
    }

    // Fade in new track
    newGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    newGain.gain.linearRampToValueAtTime(
      1,
      this.audioContext.currentTime + this.config.crossfadeDuration / 1000
    );

    // Start new track
    newSource.start();
    this.nextSource = newSource;

    // Clean up after crossfade
    setTimeout(() => {
      this.currentSource?.stop();
      this.currentSource = this.nextSource;
      this.nextSource = null;
      this.gainNode!.gain.setValueAtTime(1, 0);
    }, this.config.crossfadeDuration);
  }

  private fadeOut(duration: number): void {
    if (!this.audioContext || !this.gainNode) return;

    this.gainNode.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + duration / 1000
    );
  }

  private fadeIn(duration: number): void {
    if (!this.audioContext || !this.gainNode) return;

    this.gainNode.gain.linearRampToValueAtTime(
      1,
      this.audioContext.currentTime + duration / 1000
    );
  }

  private async preloadNextTracks(): Promise<void> {
    const tracksToPreload = this.preloadQueue.slice(0, this.config.preloadCount);
    
    await Promise.all(
      tracksToPreload.map(url => this.getAudioBuffer(url))
    );
  }
}
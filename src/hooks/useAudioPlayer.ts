import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioCache } from './useAudioCache';

export const useAudioPlayer = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const { cache } = useAudioCache();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 2048;
    }

    return () => {
      sourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  const loadFile = useCallback(async (file: File) => {
    if (!audioContextRef.current) return;
    
    try {
      const buffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(buffer);
      setAudioBuffer(audioBuffer);
      setError(null);
    } catch (err) {
      console.error('Failed to load audio file:', err);
      setError(err instanceof Error ? err : new Error('Failed to load audio file'));
    }
  }, []);

  const analyze = useCallback(async () => {
    if (!audioContextRef.current || !audioBuffer || !analyzerRef.current) {
      setError(new Error('No audio loaded to analyze'));
      return;
    }

    try {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyzerRef.current);
      analyzerRef.current.connect(audioContextRef.current.destination);
      source.start();
      setIsPlaying(true);

      source.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };
    } catch (err) {
      console.error('Failed to analyze audio:', err);
      setError(err instanceof Error ? err : new Error('Failed to analyze audio'));
    }
  }, [audioBuffer]);

  const play = useCallback(async (url: string, trackId: string) => {
    if (!audioContextRef.current || !analyzerRef.current) return;

    setError(null);

    if (currentTrackId === trackId && isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    try {
      sourceRef.current?.stop();
      
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = 'anonymous';
      }
      
      audioRef.current.src = url;
      await audioRef.current.load();

      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      source.connect(analyzerRef.current);
      analyzerRef.current.connect(audioContextRef.current.destination);

      sourceRef.current = source;
      await audioRef.current.play();

      setCurrentTrackId(trackId);
      setIsPlaying(true);

      audioRef.current.onended = () => {
        sourceRef.current = null;
        setIsPlaying(false);
        setCurrentTrackId(null);
        setProgress(0);
        setError(null);
      };

      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };

    } catch (err) {
      console.error('Failed to play audio:', err);
      setError(err instanceof Error ? err : new Error('Failed to play audio'));
      setIsPlaying(false);
      setCurrentTrackId(null);
      sourceRef.current = null;
    }
  }, [currentTrackId, isPlaying]);

  const stop = useCallback(() => {
    setError(null);
    sourceRef.current?.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    sourceRef.current = null;
    setIsPlaying(false);
    setCurrentTrackId(null);
    setProgress(0);
  }, []);

  return {
    play,
    stop,
    loadFile,
    analyze,
    isPlaying,
    currentTrackId,
    progress,
    error,
    analyzerNode: analyzerRef.current,
    hasAudio: !!audioBuffer
  };
};
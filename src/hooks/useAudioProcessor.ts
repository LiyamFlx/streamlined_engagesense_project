import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AudioData } from '../types/audio';
import { AudioSettings } from '../types/settings';
import { createAudioContext, initializeAudioNodes, getMicrophoneStream } from '../utils/audio/context';

export const useAudioProcessor = (settings: AudioSettings) => {
  const [state, setState] = useState({
    audioData: null as AudioData | null,
    isRecording: false,
    isProcessing: false,
    error: null as Error | null,
  });

  // Use double buffering for smoother updates
  const bufferA = useRef<Float32Array | null>(null);
  const bufferB = useRef<Float32Array | null>(null);
  const activeBuffer = useRef<'A' | 'B'>('A');

  // Batch processing queue
  const processingQueue = useRef<AudioData[]>([]);
  const processingTimeout = useRef<number>();

  // Performance monitoring
  const lastProcessingTime = useRef<number>(0);
  const processingTimes = useRef<number[]>([]);

  const processAudioBatch = useCallback(() => {
    if (processingQueue.current.length === 0) return;

    const startTime = performance.now();
    const batch = processingQueue.current.splice(0, optimizeAudioProcessing.batchSize);

    // Process batch in current buffer while keeping previous buffer available
    const currentBuffer = activeBuffer.current === 'A' ? bufferA : bufferB;
    if (!currentBuffer.current) return;

    // Process audio data
    batch.forEach(data => {
      // Your audio processing logic here
    });

    // Track processing time
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    processingTimes.current.push(processingTime);

    // Keep only last 10 processing times for average
    if (processingTimes.current.length > 10) {
      processingTimes.current.shift();
    }

    // Swap buffers
    activeBuffer.current = activeBuffer.current === 'A' ? 'B' : 'A';

    // Schedule next batch if needed
    if (processingQueue.current.length > 0) {
      processingTimeout.current = window.setTimeout(
        processAudioBatch,
        optimizeAudioProcessing.processingInterval
      );
    }
  }, []);

  // Use SharedArrayBuffer for better performance when available
  const sharedBufferSupported = useMemo(() => {
    try {
      return !!window.SharedArrayBuffer;
    } catch {
      return false;
    }
  }, []);

  // Reuse buffers
  const frequencyBuffer = useRef<Float32Array | null>(null);
  const timeBuffer = useRef<Float32Array | null>(null);

  // Initialize refs with proper typing
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const processingTimeoutId = useRef<number | undefined>(undefined);
  const isCleanedUp = useRef(false);

  // Validate analyzer node before use
  const isValidAnalyzer = useCallback(() => {
    return analyserRef.current && !isCleanedUp.current;
  }, []);

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      isCleanedUp.current = true;
      cleanup();
    };
  }, []);

  const cleanup = useCallback(async () => {
    if (isCleanedUp.current) return;
    
    // Cancel any pending animation frames first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    // Clear any pending timeouts
    if (processingTimeoutId.current) {
      clearTimeout(processingTimeoutId.current);
      processingTimeoutId.current = undefined;
    }

    // Disconnect and cleanup audio nodes
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Suspend AudioContext instead of closing it
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      try {
        await audioContextRef.current.suspend();
      } catch (error) {
        console.warn('Failed to suspend AudioContext:', error);
      }
    }

    analyserRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      await cleanup(); // Clean up any existing audio context
      if (isCleanedUp.current) return;

      setState(prev => ({ ...prev, error: null, isProcessing: true }));
      
      // Initialize or reuse buffers
      if (!frequencyBuffer.current) {
        frequencyBuffer.current = sharedBufferSupported
          ? new Float32Array(new SharedArrayBuffer(analyserRef.current.frequencyBinCount * 4))
          : new Float32Array(analyserRef.current.frequencyBinCount);
      }
      if (!timeBuffer.current) {
        timeBuffer.current = sharedBufferSupported
          ? new Float32Array(new SharedArrayBuffer(analyserRef.current.frequencyBinCount * 4))
          : new Float32Array(analyserRef.current.frequencyBinCount);
      }

      // Create new AudioContext if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Ensure we have permission before proceeding
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      }).catch(error => {
        throw new Error('Microphone access denied');
      });

      if (!stream) throw new Error('Failed to get microphone stream');
      streamRef.current = stream;

      // Initialize audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(analyser);
      sourceNodeRef.current = source;
      analyserRef.current = analyser;
      
      if (isCleanedUp.current) {
        cleanup();
        return;
      }

      processingTimeoutId.current = window.setTimeout(() => {
        if (!isCleanedUp.current) {
          setState(prev => ({ ...prev, isProcessing: false, isRecording: true }));
        }
      }, 1000);

      const processAudio = () => {
        if (isCleanedUp.current || !analyserRef.current) return;

        // Initialize or reuse buffers
        if (!frequencyBuffer.current) {
          frequencyBuffer.current = sharedBufferSupported
            ? new Float32Array(new SharedArrayBuffer(analyserRef.current.frequencyBinCount * 4))
            : new Float32Array(analyserRef.current.frequencyBinCount);
        }
        if (!timeBuffer.current) {
          timeBuffer.current = sharedBufferSupported
            ? new Float32Array(new SharedArrayBuffer(analyserRef.current.frequencyBinCount * 4))
            : new Float32Array(analyserRef.current.frequencyBinCount);
        }

        analyserRef.current.getFloatFrequencyData(frequencyBuffer.current);
        analyserRef.current.getFloatTimeDomainData(timeBuffer.current);

        setState(prev => ({
          ...prev,
          audioData: {
            timeStamp: Date.now(),
            frequency: frequencyBuffer.current!,
            amplitude: timeBuffer.current!,
            metrics: {
              physical: 50,
              emotional: 50,
              mental: 50,
              spiritual: 50
            },
            analyzerNode: analyserRef.current,
          },
        }));

        animationFrameRef.current = requestAnimationFrame(processAudio);
      };

      processAudio();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to start recording'),
        isProcessing: false
      }));
    }
  }, [cleanup, sharedBufferSupported]);

  const stopRecording = useCallback(async () => {
    await cleanup();
    setState(prev => ({
      ...prev,
      isRecording: false,
      audioData: null,
      isProcessing: false
    }));
  }, [cleanup]);

  return {
    ...state,
    startRecording,
    stopRecording,
  };
};
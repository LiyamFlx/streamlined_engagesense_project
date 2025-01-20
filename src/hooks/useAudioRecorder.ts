import { useState, useRef, useCallback } from 'react';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  chunks: Blob[];
}

export const useAudioRecorder = () => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    chunks: []
  });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 2,
          sampleRate: 44100,
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      
      recorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();
      
      timerRef.current = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: Date.now() - startTimeRef.current
        }));
      }, 1000);

      mediaRecorder.current = recorder;
      setState(prev => ({ 
        ...prev, 
        isRecording: true,
        chunks 
      }));
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.pause();
      clearInterval(timerRef.current);
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'paused') {
      mediaRecorder.current.resume();
      timerRef.current = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: Date.now() - startTimeRef.current
        }));
      }, 1000);
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.onstop = () => {
          const blob = new Blob(state.chunks, { type: 'audio/webm' });
          resolve(blob);
        };
        mediaRecorder.current.stop();
        clearInterval(timerRef.current);
        setState(prev => ({ 
          ...prev, 
          isRecording: false,
          isPaused: false,
          duration: 0,
          chunks: []
        }));
      }
    });
  }, [state.chunks]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
};
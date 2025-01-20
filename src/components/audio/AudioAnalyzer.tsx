import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAudioWorker } from '../../hooks/useAudioWorker';
import { AudioData } from '../../types/audio';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../LoadingSpinner';

interface AudioAnalyzerProps {
  audioData: AudioData | null;
}

export const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ audioData }) => {
  const { processAudio, isProcessing, error } = useAudioWorker();
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Validate analyzer node
  const isValidAnalyzer = useCallback(() => {
    return analyzerRef.current && 
           analyzerRef.current.context.state !== 'closed' && 
           analyzerRef.current.context.state !== 'suspended';
  }, []);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (!audioData) return;

    const analyzeAudio = async () => {
      try {
        const [features, beats, spectrum] = await Promise.all([
          processAudio(audioData, 'ANALYZE_FEATURES'),
          processAudio(audioData, 'DETECT_BEATS'),
          processAudio(audioData, 'ANALYZE_SPECTRUM')
        ]);

        if (mounted) {
          setAnalysisResults({ features, beats, spectrum });
        }
      } catch (err) {
        console.error('Analysis failed:', err);
      }
    };

    analyzeAudio();

    return () => {
      mounted = false;
    };
  }, [audioData, processAudio]);

  useEffect(() => {
    if (!audioData?.analyzerNode) return;
    
    analyzerRef.current = audioData.analyzerNode;
    
    return () => {
      analyzerRef.current = null;
    };
  }, [audioData?.analyzerNode]);

  if (error) {
    return (
      <Card className="p-4 bg-red-500/20">
        <p className="text-white">{error}</p>
      </Card>
    );
  }

  if (isProcessing) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2 text-white">Processing audio...</span>
        </div>
      </Card>
    );
  }

  if (!analysisResults) return null;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Analysis Results</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-3">
          <h4 className="text-white/80 mb-2">Audio Features</h4>
          <div className="space-y-1">
            <p className="text-white">RMS: {analysisResults.features.rms.toFixed(3)}</p>
            <p className="text-white">Spectral Centroid: {analysisResults.features.spectralCentroid.toFixed(0)} Hz</p>
            <p className="text-white">Zero Crossings: {analysisResults.features.zeroCrossings}</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <h4 className="text-white/80 mb-2">Beat Detection</h4>
          <div className="space-y-1">
            <p className="text-white">Tempo: {analysisResults.beats.tempo} BPM</p>
            <p className="text-white">Beat Count: {analysisResults.beats.beats.length}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
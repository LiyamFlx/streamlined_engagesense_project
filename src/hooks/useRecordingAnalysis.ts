import { useState, useCallback } from 'react';
import { AudioData, AudioMetrics } from '../types/audio';
import { analyzeAudioFeatures } from '../utils/analysis/featureExtraction';
import { generateInsightsReport } from '../utils/analysis/insightsGenerator';
import { saveRecording } from '../utils/storage/recordingStorage';

interface AnalysisState {
  isAnalyzing: boolean;
  progress: number;
  error: string | null;
}

interface AnalysisResults {
  features: AudioFeatures;
  metrics: AudioMetrics;
  insights: AnalysisInsights;
}

export const useRecordingAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    error: null
  });

  const [results, setResults] = useState<AnalysisResults | null>(null);

  const analyzeRecording = useCallback(async (audioData: AudioData) => {
    setState({ isAnalyzing: true, progress: 0, error: null });
    
    try {
      // Extract features first
      const features = await analyzeAudioFeatures(audioData);
      setState(prev => ({ ...prev, progress: 30 }));

      // Generate insights
      const insights = await generateInsightsReport(features, audioData.metrics);
      setState(prev => ({ ...prev, progress: 60 }));

      // Save recording after analysis
      await saveRecording(audioData);
      setState(prev => ({ ...prev, progress: 100 }));

      setResults({ features, metrics: audioData.metrics, insights });
    } catch (error) {
      console.error('Analysis failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Analysis failed'
      }));
    } finally {
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, []);

  return {
    state,
    results,
    analyzeRecording
  };
};
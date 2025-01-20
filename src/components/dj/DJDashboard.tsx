import React, { useState, useCallback, useEffect, useMemo, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ControlPanel } from '../controls/ControlPanel';
import { VisualizationPanel } from '../visualizations/VisualizationPanel';
import { TrackRecommendationPanel } from '../recommendations/TrackRecommendationPanel';
import { AnalysisProgress } from '../analysis/AnalysisProgress';
import { AnalysisResults } from '../analysis/AnalysisResults';
import { CrowdSentimentIndicator } from '../engagement/CrowdSentimentIndicator';
import { EngagementHeatmap } from '../engagement/EngagementHeatmap';
import { useAudioProcessor } from '../../hooks/useAudioProcessor';
import { useEngagementVisualization } from '../../hooks/useEngagementVisualization';
import { LoadingSpinner } from '../LoadingSpinner';
import { useTrackRecommendations } from '../../hooks/useTrackRecommendations';
import { useRecordingAnalysis } from '../../hooks/useRecordingAnalysis';
import { useBeatDetection } from '../../hooks/useBeatDetection';
import { useEQProcessor } from '../../hooks/useEQProcessor';
import { Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { BeatGrid } from './BeatGrid';
import { EQControls } from './EQControls';
import { HotCues } from './HotCues';
import { ExportDialog } from '../export/ExportDialog';
import { Card } from '../ui/Card';

interface HotCue {
  id: string;
  position: number;
  color: string;
  label?: string;
}

export const DJDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const handleUploadClick = useCallback(() => {
    navigate('/analysis');
  }, [navigate]);

  // Group all useState hooks together at the top
  const [isInitialized, setIsInitialized] = useState(false);
  const [emotionalState, setEmotionalState] = useState({
    isAnalyzing: false,
    showExportDialog: false,
    energy: 0,
    mood: 'neutral',
    intensity: 0
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hotCues, setHotCues] = useState<HotCue[]>([]);

  // Refs after useState
  const audioContextRef = useRef<AudioContext | null>(null);

  // Memoized values
  const audioSettings = useMemo(() => ({
    sensitivity: 50,
    noiseThreshold: 30,
    updateInterval: 100
  }), []);

  // Custom hooks after basic hooks
  const {
    audioData,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    error
  } = useAudioProcessor(audioSettings);

  const { bpm, beatMarkers } = useBeatDetection(audioData);
  const { setEQ, setFilter } = useEQProcessor(audioData?.analyzerNode?.context ?? null);
  const { sentiment, trend, history } = useEngagementVisualization(audioData?.metrics ?? null);
  const { recommendations, currentTrack, isLoading, error: recError, playTrack } = useTrackRecommendations(
    audioData?.metrics ?? null,
    history,
    128
  );
  const { state: analysisState, results: analysisResults, analyzeRecording } = useRecordingAnalysis();

  // useEffect hooks after custom hooks
  useEffect(() => {
    const initializeComponents = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize DJ Dashboard:', error);
        throw error;
      }
    };

    initializeComponents();
  }, []);

  // useCallback definitions after useEffect
  const handleStartRecording = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      await startRecording();
      setEmotionalState(prev => ({
        ...prev,
        energy: 0,
        mood: 'neutral',
        intensity: 0
      }));
    } catch (error) {
      console.error('Failed to start recording:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [startRecording]);

  // Update emotional state based on audio analysis
  useEffect(() => {
    if (audioData?.metrics) {
      const { emotional, physical } = audioData.metrics;
      setEmotionalState({
        ...emotionalState,
        energy: physical,
        mood: emotional > 75 ? 'euphoric' : emotional > 50 ? 'positive' : 'neutral',
        intensity: emotional
      });
    }
  }, [audioData?.metrics, emotionalState]);
  const handleTrackSelect = useCallback((track) => {
    playTrack(track);
  }, [playTrack]);

  const handleStopRecording = useCallback(async () => {
    await stopRecording();
    if (audioData) {
      await analyzeRecording(audioData);
      setShowExportDialog(true); 
    }
  }, [stopRecording, audioData, analyzeRecording]);

  const handleNavigate = (direction: 'home' | 'prev' | 'next') => {
    switch (direction) {
      case 'home':
        navigate('/');
        break;
      case 'prev':
        navigate(-1);
        break;
      case 'next':
        navigate(1);
        break;
    }
  };

  const handleFileUpload = useCallback(() => {
  }, []);

  const handleExport = useCallback(() => {
    // Implement export logic
    console.log('Export clicked');
  }, []);

  const handleAnalyze = useCallback(() => {
    if (audioData) {
      analyzeRecording(audioData);
      setShowExportDialog(true);
    }
  }, [audioData, analyzeRecording]);

  // Prevent unnecessary re-renders
  const memoizedNavigate = useCallback((direction: 'home' | 'prev' | 'next') => {
    switch (direction) {
      case 'home':
        navigate('/');
        break;
      case 'prev':
        navigate(-1);
        break;
      case 'next':
        navigate(1);
        break;
    }
  }, [navigate]);
  // Initialize state
  useEffect(() => {
    const initializeComponents = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize DJ Dashboard:', error);
        throw error;
      }
    };

    initializeComponents();

    return () => {
      if (audioContextRef.current?.state === 'running') {
        audioContextRef.current.suspend().catch(console.error);
      }
    };
  }, []);

  // Early returns for loading and error states
  if (!isInitialized) return <LoadingSpinner />;

  if (error) {
    return (
      <Card className="p-4 bg-red-500/20">
        <p className="text-white">{error.message}</p>
      </Card>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Upload Button */}
      <div className="flex justify-end mb-6">
        <Button
          variant="primary"
          icon={Upload}
          onClick={handleUploadClick}
          className="hover:scale-105 transition-transform"
        >
          Upload & Analyze Audio
        </Button>
      </div>

      {/* Emotional State Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Energy Level</h3>
            <div className={`text-2xl font-bold ${
              emotionalState.energy > 75 ? 'text-green-400' :
              emotionalState.energy > 50 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {emotionalState.energy}%
            </div>
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
              style={{ width: `${emotionalState.energy}%` }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Mood</h3>
            <div className="text-xl font-semibold text-purple-400 capitalize">
              {emotionalState.mood}
            </div>
          </div>
          <div className="mt-2 flex justify-center">
            <div className={`text-4xl transition-all duration-300 ${
              emotionalState.mood === 'euphoric' ? 'animate-bounce' : ''
            }`}>
              {emotionalState.mood === 'euphoric' ? '🎉' :
               emotionalState.mood === 'positive' ? '😊' : '😐'}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Emotional Intensity</h3>
            <div className={`text-2xl font-bold ${
              emotionalState.intensity > 75 ? 'text-purple-400' :
              emotionalState.intensity > 50 ? 'text-blue-400' :
              'text-indigo-400'
            }`}>
              {emotionalState.intensity}%
            </div>
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${emotionalState.intensity}%` }}
            />
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <BeatGrid
          bpm={bpm}
          isPlaying={isRecording}
          beatMarkers={beatMarkers}
        />
        <HotCues
          cues={hotCues}
          onTriggerCue={(id) => {
            // Implement cue triggering
            console.log('Trigger cue:', id);
          }}
          onSetCue={(position) => {
            setHotCues(prev => [...prev, {
              id: Math.random().toString(36).substr(2, 9),
              position,
              color: 'bg-purple-500',
              label: String.fromCharCode(65 + position)
            }]);
          }}
          onDeleteCue={(id) => {
            setHotCues(prev => prev.filter(cue => cue.id !== id));
          }}
        />
      </div>

      <ControlPanel
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onNavigate={memoizedNavigate}
        onUpload={handleFileUpload}
        onExport={handleExport}
        onAnalyze={handleAnalyze}
        disabled={isProcessing || isAnalyzing}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <VisualizationPanel
            audioData={audioData}
            isActive={isRecording && !isProcessing}
          />
          
          {analysisState.isAnalyzing ? (
            <AnalysisProgress progress={analysisState.progress} />
          ) : analysisResults && (
            <AnalysisResults
              features={analysisResults.features}
              metrics={analysisResults.metrics}
              isActive={isRecording}
            />
          )}

          <EngagementHeatmap history={history} />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <CrowdSentimentIndicator
            sentiment={sentiment ?? 50}
            trend={trend}
          />
          <TrackRecommendationPanel
            recommendations={recommendations}
            isLoading={isLoading}
            error={recError}
            currentTrack={currentTrack}
            onSelectTrack={handleTrackSelect}
          />
        </div>
      </div>
    </div>
    <ExportDialog
      isOpen={showExportDialog}
      onClose={() => setShowExportDialog(false)}
      audioData={audioData}
      analysisResults={analysisResults}
    />
    </Suspense>
  );
};
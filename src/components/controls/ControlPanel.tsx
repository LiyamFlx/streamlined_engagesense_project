import React, { useRef, useState, useCallback } from 'react';
import { 
  Mic, Square,
  Upload, Download, Play, FileAudio,
  AlertCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { ExportDialog } from '../export/ExportDialog';

interface ControlPanelProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onExport: () => void;
  onAnalyze: () => void;
  disabled?: boolean;
  hasAudio?: boolean;
  audioData?: any;
  analysisResults?: any;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onExport,
  onAnalyze,
  disabled = false,
  hasAudio = false,
  audioData,
  analysisResults
}) => {
  const navigate = useNavigate();
  const [showExport, setShowExport] = useState(false);

  const handleUploadClick = useCallback(() => {
    navigate('/analysis');
  }, [navigate]);

  return (
  <Card className="p-6">
    <div className="space-y-6">
      {/* Primary Controls */}
      <div className="flex gap-4">
        <Button
          variant="primary"
          size="lg"
          icon={isRecording ? Square : Mic}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={disabled}
          className="flex-1"
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>

        <Button
          variant="secondary"
          icon={Upload}
          onClick={handleUploadClick}
          disabled={disabled}
          className="flex-1"
        >
          Upload & Analyze
        </Button>
      </div>
      
      {/* Analysis Button - Shows only after upload */}
      {hasAudio && !isRecording && (
        <div className="flex items-center gap-4">
          <Button
            variant="primary"
            size="lg"
            icon={FileAudio}
            onClick={onAnalyze}
            disabled={disabled}
            className="flex-1"
          >
            Analyze Audio
          </Button>
        </div>
      )}
      
      {/* Export Button - Shows after analysis/recording */}
      {(audioData || analysisResults) && (
        <div className="flex justify-end mt-4">
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => setShowExport(true)}
            disabled={disabled}
          >
            Export Results
          </Button>
        </div>
      )}
    </div>
    
    <ExportDialog
      isOpen={showExport}
      onClose={() => setShowExport(false)}
      audioData={audioData}
      analysisResults={analysisResults}
    />
  </Card>
  );
};
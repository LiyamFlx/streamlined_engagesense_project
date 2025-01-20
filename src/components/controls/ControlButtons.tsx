import React, { useCallback } from 'react';
import { Download, Upload, Play, Pause, Save, FileAudio } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { exportData } from '../../utils/export/dataExport';
import { AudioData } from '../../types/audio';

interface ControlButtonsProps {
  audioData: AudioData | null;
  isPlaying: boolean;
  onFileUpload: (file: File) => void;
  onAnalyze: () => void;
  onPlayPause: () => void;
  onSave: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  audioData,
  isPlaying,
  onFileUpload,
  onAnalyze,
  onPlayPause,
  onSave
}) => {
  const handleExport = useCallback(() => {
    if (!audioData) return;
    exportData(audioData, 'json');
  }, [audioData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Audio Control Group */}
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              icon={isPlaying ? Pause : Play}
              onClick={onPlayPause}
              disabled={!audioData}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>

            <Button
              variant="primary"
              icon={FileAudio}
              onClick={onAnalyze}
              disabled={!audioData}
            >
              Analyze Audio
            </Button>
          </div>

          <div className="h-8 w-px bg-white/10" />

          {/* File Operations Group */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload">
                <Button
                  variant="secondary"
                  icon={Upload}
                  className="cursor-pointer"
                  onClick={() => {}}
                >
                  Upload Audio
                </Button>
              </label>
            </div>

            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExport}
              disabled={!audioData}
            >
              Export Data
            </Button>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={Save}
            onClick={onSave}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
};
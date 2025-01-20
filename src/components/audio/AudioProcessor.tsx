import React, { useEffect } from 'react';
import { useInterval } from '../../hooks/useInterval';
import { AudioData } from '../../types/audio';

interface AudioProcessorProps {
  audioData: AudioData | null;
  onAnalysisComplete: (results: any) => void;
}

export const AudioProcessor: React.FC<AudioProcessorProps> = ({
  audioData,
  onAnalysisComplete
}) => {
  useInterval(() => {
    if (audioData) {
      onAnalysisComplete(audioData);
    }
  }, audioData ? 100 : null);

  return null; // This is a logic-only component
};
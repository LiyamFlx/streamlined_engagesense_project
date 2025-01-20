export interface TransitionGuidance {
  timing: number;
  type: 'cut' | 'blend' | 'echo_out' | 'filter_fade';
  tips: string[];
}

export const calculateTransitionTiming = (track: { bpm: number }): number => {
  // Calculate optimal transition timing based on track BPM
  const beatsPerBar = 4;
  const barsToTransition = 8;
  const secondsPerMinute = 60;
  
  return Math.round((beatsPerBar * barsToTransition * secondsPerMinute) / track.bpm);
};

export const determineTransitionType = (track: { energy: number }): TransitionGuidance['type'] => {
  if (track.energy > 80) return 'cut';
  if (track.energy > 60) return 'blend';
  if (track.energy > 40) return 'echo_out';
  return 'filter_fade';
};

export const generateTransitionTips = (
  track: { bpm: number; energy: number },
  type: TransitionGuidance['type']
): string[] => {
  const tips: string[] = [];
  
  switch (type) {
    case 'cut':
      tips.push('Use a sharp transition on the downbeat');
      tips.push(`Time the cut at ${track.bpm} BPM for maximum impact`);
      break;
    case 'blend':
      tips.push('Gradually blend tracks over 16-32 beats');
      tips.push('Match EQ points for smooth transition');
      break;
    case 'echo_out':
      tips.push('Apply echo effect before transition');
      tips.push('Fade out over 2-4 bars');
      break;
    case 'filter_fade':
      tips.push('Use low-pass filter sweep');
      tips.push('Extend transition over 4-8 bars');
      break;
  }

  return tips;
};
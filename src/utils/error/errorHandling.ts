export class AudioProcessingError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AudioProcessingError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const handleAudioError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  return new Error('An unknown error occurred during audio processing');
};

export const createErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    AUDIO_CONTEXT_FAILED: 'Failed to create audio context',
    MICROPHONE_ACCESS_DENIED: 'Microphone access was denied',
    INVALID_AUDIO_DATA: 'Invalid audio data format',
    PROCESSING_FAILED: 'Audio processing failed',
    INITIALIZATION_FAILED: 'Failed to initialize audio system'
  };

  return errorMessages[code] || 'An unknown error occurred';
};
export class AudioProcessingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AudioProcessingError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
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

export const createErrorMessage = (code: string, details?: any): string => {
  const errorMessages: Record<string, string> = {
    AUDIO_CONTEXT_FAILED: 'Failed to create audio context',
    MICROPHONE_ACCESS_DENIED: 'Microphone access was denied',
    INVALID_AUDIO_DATA: 'Invalid audio data format',
    PROCESSING_FAILED: 'Audio processing failed',
    INITIALIZATION_FAILED: 'Failed to initialize audio system',
    VALIDATION_ERROR: 'Data validation failed',
    CACHE_ERROR: 'Cache operation failed',
    NETWORK_ERROR: 'Network request failed'
  };

  const message = errorMessages[code] || 'An unknown error occurred';
  return details ? `${message}: ${JSON.stringify(details)}` : message;
};
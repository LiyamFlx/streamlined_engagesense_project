const ALLOWED_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'text/csv'
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

class FileValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

interface ValidationOptions {
  maxSize: number;
  accept: string[];
}

export const validateFile = (file: File, options: ValidationOptions): string | null => {
  try {
    // Sanitize file name
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    if (sanitizedName !== file.name) {
      throw new FileValidationError('Invalid file name', 'INVALID_FILENAME');
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new FileValidationError(
        `File size exceeds ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB limit`,
        'FILE_TOO_LARGE'
      );
    }

    // Check file type
    const fileType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(fileType)) {
      throw new FileValidationError(
        `File type ${fileType} not supported`,
        'INVALID_FILE_TYPE'
      );
    }

    return null;
  } catch (error) {
    if (error instanceof FileValidationError) {
      return error.message;
    }
    return 'File validation failed';
  }
};
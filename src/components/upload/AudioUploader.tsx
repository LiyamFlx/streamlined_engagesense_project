import React, { useCallback, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Card } from '../ui/Card';
import { compressAudioFile } from '../../utils/audio/compression';

interface AudioFile {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'compressing' | 'complete' | 'error';
  error?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm'];
const MAX_RETRIES = 3;

export const AudioUploader: React.FC<{
  onUploadComplete: (file: File) => void;
}> = ({ onUploadComplete }) => {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 50MB limit');
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Unsupported file format');
    }
  }, []);

  const processFile = useCallback(async (file: File, retryCount = 0): Promise<void> => {
    const fileId = Math.random().toString(36).substr(2, 9);
    
    try {
      validateFile(file);
      
      setFiles(prev => [...prev, {
        id: fileId,
        file,
        progress: 0,
        status: 'queued'
      }]);

      // Compress if file is large
      let processedFile = file;
      if (file.size > 10 * 1024 * 1024) {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'compressing' } : f
        ));
        processedFile = await compressAudioFile(file);
      }

      // Simulate upload with progress
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'uploading' } : f
      ));

      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, progress } : f
        ));
      }

      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'complete' } : f
      ));

      onUploadComplete(processedFile);
    } catch (error) {
      console.error('Upload failed:', error);
      
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return processFile(file, retryCount + 1);
      }

      setFiles(prev => prev.map(f =>
        f.id === fileId ? {
          ...f,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ));
    }
  }, [validateFile, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      setIsProcessing(true);
      await Promise.all(acceptedFiles.map(file => processFile(file)));
      setIsProcessing(false);
    },
    accept: {
      'audio/*': ALLOWED_TYPES
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true
  });

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg text-white mb-2">
          {isDragActive ? 'Drop files here...' : 'Drag & drop audio files or click to select'}
        </p>
        <p className="text-sm text-gray-400">
          Supported formats: WAV, MP3, WebM (up to 50MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          {files.map(file => (
            <div key={file.id} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">{file.file.name}</span>
                <span className="text-sm text-white/70">
                  {(file.file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>

              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`absolute h-full transition-all duration-300 rounded-full ${
                    file.status === 'error' ? 'bg-red-500' :
                    file.status === 'complete' ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${file.progress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className={`text-sm ${
                  file.status === 'error' ? 'text-red-400' :
                  file.status === 'complete' ? 'text-green-400' : 'text-white/70'
                }`}>
                  {file.status === 'compressing' ? 'Compressing...' :
                   file.status === 'uploading' ? 'Uploading...' :
                   file.status === 'complete' ? 'Complete' :
                   file.status === 'error' ? file.error : 'Queued'}
                </span>
                {file.status === 'error' && (
                  <button
                    onClick={() => processFile(file.file)}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
import React, { useCallback, useState } from 'react';
import { Upload, X, FileAudio, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Card } from '../ui/Card';
import { UploadProgress } from './UploadProgress';
import { validateFile } from '../../utils/validation/fileValidation';

interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  maxSize?: number;
  accept?: string[];
  isProcessing?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  maxSize = 50 * 1024 * 1024, // 50MB default
  accept = ['audio/*'],
  isProcessing = false
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileStatus, setFileStatus] = useState<('idle' | 'uploading' | 'complete' | 'error')[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrors([]);
    setUploading(true);
    
    const validationErrors: string[] = [];
    const validFiles = acceptedFiles.filter(file => {
      const error = validateFile(file, { maxSize, accept });
      if (error) {
        validationErrors.push(`${file.name}: ${error}`);
        return false;
      }
      return true;
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setFiles(validFiles);
    setProgress(validFiles.map(() => 0));
    setFileStatus(validFiles.map(() => 'idle'));
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => 
          prev.map(p => p < 100 ? Math.min(p + Math.random() * 10, 100) : p)
        );
        setFileStatus(prev => prev.map(s => s === 'idle' ? 'uploading' : s));
      }, 200);

      await onUpload(validFiles);
      
      clearInterval(progressInterval);
      setProgress(validFiles.map(() => 100));
      setFileStatus(validFiles.map(() => 'complete'));
      
      // Start analysis after upload
      setAnalyzing(true);
      await analyzeFiles(validFiles);
      setAnalyzing(false);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Upload failed']);
      setFileStatus(validFiles.map(() => 'error'));
    } finally {
      setUploading(false);
    }
  }, [maxSize, accept, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxSize,
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setProgress(prev => prev.filter((_, i) => i !== index));
    setFileStatus(prev => prev.filter((_, i) => i !== index));
  };
  const analyzeFiles = async (files: File[]) => {
    let audioContext: AudioContext | null = null;
    let source: AudioBufferSourceNode | null = null;

    try {
      for (const file of files) {
        setAnalyzing(true);
        
        // Create or resume AudioContext
        if (!audioContext || audioContext.state === 'closed') {
          audioContext = new AudioContext();
        } else if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Create and configure analyzer node
        const analyzerNode = audioContext.createAnalyser();
        analyzerNode.fftSize = 2048;
        analyzerNode.smoothingTimeConstant = 0.8;

        source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyzerNode);
        analyzerNode.connect(audioContext.destination);
        
        // Get frequency and time domain data
        const frequencyData = new Float32Array(analyzerNode.frequencyBinCount);
        const timeData = new Float32Array(analyzerNode.frequencyBinCount);
        
        analyzerNode.getFloatFrequencyData(frequencyData);
        analyzerNode.getFloatTimeDomainData(timeData);

        // Process audio data through analyzer
        source.start(0);
        await new Promise(resolve => setTimeout(resolve, 100)); // Allow time for analysis
        source.stop();
        
        // Clean up current source
        source.disconnect();
        source = null;
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setErrors(prev => [...prev, 'Audio analysis failed']);
    } finally {
      // Clean up audio context
      if (audioContext && audioContext.state === 'running') {
        try {
          await audioContext.suspend();
        } catch (error) {
          console.warn('Failed to suspend AudioContext:', error);
        }
      }
      if (source) {
        source.disconnect();
      }
      setAnalyzing(false);
    }
  };

  return (
    <Card className="p-6">
      {/* Dropzone */}
      <div className="relative">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors relative
            ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500'}
            ${errors.length > 0 ? 'border-red-500' : ''}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input {...getInputProps()} />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
            </div>
          )}
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-white mb-2">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop audio files here, or click to select'}
          </p>
          <p className="text-sm text-gray-400">
            Supported formats: MP3, WAV, AIFF (up to {(maxSize / 1024 / 1024).toFixed(0)}MB)
          </p>
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h4 className="font-medium text-white">Upload Errors</h4>
          </div>
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-200">{error}</p>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Files</h3>
            {analyzing && (
              <div className="flex items-center gap-2 text-purple-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent" />
                <span className="text-sm">Analyzing...</span>
              </div>
            )}
          </div>
          {files.map((file, index) => (
            <div key={file.name} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileAudio className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <UploadProgress
                progress={progress[index]}
                status={fileStatus[index]}
                error={errors[index]}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
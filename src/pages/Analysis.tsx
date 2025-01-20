import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileUp as FileUpload, Music, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { FileUploader } from '../components/upload/FileUploader';
import { AnalysisResults } from '../components/analysis/AnalysisResults';
import { FrequencyBars } from '../components/visualizations/FrequencyBars';
import { EngagementHeatmap } from '../components/visualizations/EngagementHeatmap';
import { Button } from '../components/ui/Button';
import { AnalysisReport } from '../components/reports/AnalysisReport';
import { exportData } from '../utils/export/dataExport';
import { debounce } from '../utils/performance/debounce';

interface AnalysisFile {
  id: string;
  file: File;
  type: 'audio' | 'csv';
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
  results?: any;
}

const Analysis: React.FC = () => {
  const processingQueue = useRef<AnalysisFile[]>([]);
  const objectUrlsRef = useRef('');
  
  const processNextInQueue = useCallback(debounce(async () => {
    if (processingQueue.current.length === 0) return;
    
    const fileData = processingQueue.current.shift();
    if (!fileData) return;
    
    try {
      await processFile(fileData);
    } catch (error) {
      console.error('File processing failed:', error);
      updateFileStatus(fileData.id, 'error', error instanceof Error ? error.message : 'Processing failed');
    } finally {
      processNextInQueue();
    }
  }, 100), []);

  const cleanupResources = useCallback(() => {
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    processingQueue.current = [];
    URL.revokeObjectURL(objectUrlsRef.current);
    objectUrlsRef.current = '';
  }, []);

  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  const [files, setFiles] = useState<AnalysisFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFileUpload = useCallback(async (uploadedFiles: File[]) => {
    const newFiles = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: file.type.includes('audio') ? 'audio' : 'csv',
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    processingQueue.current.push(...newFiles);
    processNextInQueue();
  }, []);

  const processFile = async (fileData: AnalysisFile) => {
    setIsProcessing(true);
    updateFileStatus(fileData.id, 'processing');

    try {
      // Simulate processing with progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateFileProgress(fileData.id, progress);
      }

      const results = await analyzeFile(fileData);
      updateFileStatus(fileData.id, 'complete', undefined, results);
      setActiveFileId(fileData.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeFile = async (fileData: AnalysisFile) => {
    if (fileData.type === 'audio') {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext();
      }
      
      try {
        const arrayBuffer = await fileData.file.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        
        return {
          duration: audioBuffer.duration,
          sampleRate: audioBuffer.sampleRate,
          numberOfChannels: audioBuffer.numberOfChannels
        };
      } catch (error) {
        console.error('Audio analysis failed:', error);
        throw new Error('Failed to analyze audio file');
      }
    }
  };

  const updateFileStatus = (
    id: string,
    status: AnalysisFile['status'],
    error?: string,
    results?: any
  ) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, status, error, results } : file
    ));
  };

  const updateFileProgress = (id: string, progress: number) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, progress } : file
    ));
  };

  const handleExport = useCallback((format: 'pdf' | 'csv' | 'excel') => {
    const activeFile = files.find(f => f.id === activeFileId);
    if (!activeFile?.results) return;

    exportData(activeFile.results, format);
  }, [activeFileId, files]);

  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Analysis</h1>
        <div className="flex gap-4">
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={() => handleExport('csv')}
            disabled={!activeFile?.results}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={() => handleExport('excel')}
            disabled={!activeFile?.results}
          >
            Export Excel
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <FileUploader
          onUpload={handleFileUpload}
          maxSize={50 * 1024 * 1024} // 50MB
          accept={[
            'audio/mpeg',
            'audio/wav',
            'audio/mp4',
            'text/csv'
          ]}
          isProcessing={isProcessing}
        />
      </Card>

      {files.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Uploaded Files</h2>
          <div className="space-y-4">
            {files.map(file => (
              <div
                key={file.id}
                className={`p-4 rounded-lg transition-colors cursor-pointer ${
                  file.id === activeFileId
                    ? 'bg-purple-500/20'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setActiveFileId(file.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {file.type === 'audio' ? (
                      <Music className="w-5 h-5 text-purple-400" />
                    ) : (
                      <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                    )}
                    <div>
                      <p className="font-medium text-white">{file.file.name}</p>
                      <p className="text-sm text-white/70">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-white/70">
                    {file.status === 'complete' ? (
                      <span className="text-green-400">Analysis Complete</span>
                    ) : file.status === 'error' ? (
                      <span className="text-red-400">Error</span>
                    ) : (
                      <span>{file.progress}%</span>
                    )}
                  </div>
                </div>

                {file.status === 'processing' && (
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {file.status === 'error' && (
                  <div className="flex items-center gap-2 mt-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{file.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeFile?.results && (
        <AnalysisReport
          file={{
            name: activeFile.file.name,
            type: activeFile.file.type,
            size: activeFile.file.size,
            uploadTime: new Date()
          }}
          analysis={activeFile.results}
          metrics={{
            physical: 85,
            emotional: 75,
            mental: 80,
            spiritual: 70
          }}
          processingTime={2000}
          onExport={handleExport}
    >
      {activeFile?.type === 'audio' && (
        <>
          <FrequencyBars
            analyzerNode={null}
            isActive={false}
            className="h-48"
          />
          <EngagementHeatmap history={[]} />
        </>
      )}
    </AnalysisReport>
      )}
    </div>
  );
};

export default Analysis;
import React from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { AudioData } from '../../types/audio';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  audioData: AudioData | null;
  analysisResults: any | null;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  audioData,
  analysisResults
}) => {
  if (!isOpen) return null;

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    const data = {
      audioData,
      analysis: analysisResults,
      timestamp: new Date().toISOString()
    };

    let content: string;
    let mimeType: string;
    let filename: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        filename = 'audio-analysis.json';
        break;
      case 'csv':
        content = convertToCSV(data);
        mimeType = 'text/csv';
        filename = 'audio-analysis.csv';
        break;
      case 'pdf':
        // PDF generation would typically use a library
        alert('PDF export coming soon!');
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Export Analysis Results</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <Button
            variant="primary"
            icon={Download}
            onClick={() => handleExport('json')}
            className="w-full"
          >
            Export as JSON
          </Button>

          <Button
            variant="primary"
            icon={Download}
            onClick={() => handleExport('csv')}
            className="w-full"
          >
            Export as CSV
          </Button>

          <Button
            variant="primary"
            icon={Download}
            onClick={() => handleExport('pdf')}
            className="w-full"
            disabled
          >
            Export as PDF (Coming Soon)
          </Button>
        </div>
      </Card>
    </div>
  );
};

function convertToCSV(data: any): string {
  const metrics = data.audioData?.metrics || {};
  const analysis = data.analysis || {};
  
  const headers = ['Timestamp', 'Metric', 'Value'];
  const rows = [
    headers.join(','),
    ...Object.entries(metrics).map(([key, value]) => 
      [data.timestamp, key, value].join(',')
    ),
    ...Object.entries(analysis).map(([key, value]) => 
      [data.timestamp, key, value].join(',')
    )
  ];

  return rows.join('\n');
}
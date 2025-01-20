import React from 'react';
import { FileText, Clock, Activity, BarChart, Download } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatDuration, formatFileSize } from '../../utils/formatting';

interface AnalysisReportProps {
  file: {
    name: string;
    type: string;
    size: number;
    uploadTime: Date;
  };
  analysis: {
    duration?: number;
    bitrate?: number;
    sampleRate?: number;
    channels?: number;
    frequency?: {
      min: number;
      max: number;
    };
    loudness?: number;
    key?: string;
    tempo?: number;
    rowCount?: number;
    columnCount?: number;
    dataTypes?: {
      text: number;
      numbers: number;
      dates: number;
    };
  };
  metrics: {
    physical: number;
    emotional: number;
    mental: number;
    spiritual: number;
  };
  processingTime: number;
  onExport: (format: 'pdf' | 'csv') => void;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  file,
  analysis,
  metrics,
  processingTime,
  onExport
}) => {
  const isAudioFile = file.type.startsWith('audio/');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="border-b border-white/10 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white">Analysis Report</h1>
              <p className="text-white/70 mt-1">Generated on {new Date().toLocaleString()}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                icon={Download}
                onClick={() => onExport('pdf')}
              >
                Export PDF
              </Button>
              <Button
                variant="secondary"
                icon={Download}
                onClick={() => onExport('csv')}
              >
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* File Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-white/70 mb-1">File Name</p>
            <p className="text-white font-medium">{file.name}</p>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">File Type</p>
            <p className="text-white font-medium">{file.type}</p>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">File Size</p>
            <p className="text-white font-medium">{formatFileSize(file.size)}</p>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">Upload Time</p>
            <p className="text-white font-medium">{file.uploadTime.toLocaleTimeString()}</p>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Key Metrics
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isAudioFile ? (
            <>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-1">Duration</p>
                <p className="text-xl font-semibold text-white">
                  {formatDuration(analysis.duration || 0)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-1">Bitrate</p>
                <p className="text-xl font-semibold text-white">
                  {analysis.bitrate ? `${analysis.bitrate} kbps` : 'N/A'}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-1">Sample Rate</p>
                <p className="text-xl font-semibold text-white">
                  {analysis.sampleRate ? `${analysis.sampleRate} Hz` : 'N/A'}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-1">Channels</p>
                <p className="text-xl font-semibold text-white">
                  {analysis.channels || 'N/A'}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-1">Rows</p>
                <p className="text-xl font-semibold text-white">
                  {analysis.rowCount?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-1">Columns</p>
                <p className="text-xl font-semibold text-white">
                  {analysis.columnCount?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-1">Processing Time</p>
                <p className="text-xl font-semibold text-white">
                  {(processingTime / 1000).toFixed(2)}s
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Analysis Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          Analysis Summary
        </h2>

        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-white/70 mb-2">Overall Score</p>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-white">
                {Math.round((metrics.physical + metrics.emotional + metrics.mental + metrics.spiritual) / 4)}%
              </div>
              <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{
                    width: `${(metrics.physical + metrics.emotional + metrics.mental + metrics.spiritual) / 4}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/70 mb-1">Physical</p>
              <p className="text-xl font-semibold text-white">{metrics.physical}%</p>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${metrics.physical}%` }}
                />
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/70 mb-1">Emotional</p>
              <p className="text-xl font-semibold text-white">{metrics.emotional}%</p>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${metrics.emotional}%` }}
                />
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/70 mb-1">Mental</p>
              <p className="text-xl font-semibold text-white">{metrics.mental}%</p>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${metrics.mental}%` }}
                />
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/70 mb-1">Spiritual</p>
              <p className="text-xl font-semibold text-white">{metrics.spiritual}%</p>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: `${metrics.spiritual}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-white/50 text-sm">
        <p>EngageSense Analysis Report © {new Date().getFullYear()}</p>
        <p className="mt-1">Generated in {(processingTime / 1000).toFixed(2)} seconds</p>
      </div>
    </div>
  );
};
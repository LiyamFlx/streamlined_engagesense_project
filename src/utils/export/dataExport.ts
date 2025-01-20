import { AudioData } from '../../types/audio';

type ExportFormat = 'json' | 'csv' | 'pdf' | 'excel';

export const exportData = (data: AudioData, format: ExportFormat = 'json') => {
  switch (format) {
    case 'json':
      exportJSON(data);
      break;
    case 'csv':
      exportCSV(data);
      break;
    case 'pdf':
      exportPDF(data);
      break;
    case 'excel':
      exportExcel(data);
      break;
  }
};

const exportJSON = (data: AudioData) => {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, 'audio-analysis.json', 'application/json');
};

const exportCSV = (data: AudioData) => {
  const metrics = data.metrics;
  const csvContent = Object.entries(metrics)
    .map(([key, value]) => `${key},${value}`)
    .join('\n');
  
  downloadFile(csvContent, 'audio-analysis.csv', 'text/csv');
};

const exportPDF = (data: AudioData) => {
  const content = generatePDFContent(data);
  const blob = new Blob([content], { type: 'application/pdf' });
  downloadFile(blob, 'audio-analysis.pdf', 'application/pdf');
};

const exportExcel = (data: AudioData) => {
  const content = generateExcelContent(data);
  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadFile(blob, 'audio-analysis.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};

const generatePDFContent = (data: any): string => {
  // Generate PDF content with sections
  const sections = [
    {
      title: 'Audio Analysis Report',
      content: `Generated on ${new Date().toLocaleString()}`
    },
    {
      title: 'Audio Features',
      content: JSON.stringify(data.audioFeatures, null, 2)
    },
    {
      title: 'Engagement Metrics',
      content: JSON.stringify(data.metrics, null, 2)
    },
    {
      title: 'Peak Moments',
      content: data.peakMoments.map((peak: any) => 
        `${peak.type}: ${peak.value}% at ${new Date(peak.timestamp).toLocaleTimeString()}`
      ).join('\n')
    }
  ];

  return sections.map(section => 
    `${section.title}\n${'-'.repeat(section.title.length)}\n\n${section.content}\n\n`
  ).join('\n');
};

const generateExcelContent = (data: any): string => {
  const sheets = [
    {
      name: 'Overview',
      headers: ['Timestamp', 'Duration', 'Sample Rate'],
      rows: [[
        data.timestamp,
        data.audioFeatures?.duration || 'N/A',
        data.audioFeatures?.sampleRate || 'N/A'
      ]]
    },
    {
      name: 'Metrics',
      headers: ['Metric', 'Value'],
      rows: Object.entries(data.metrics || {})
    },
    {
      name: 'Peak Moments',
      headers: ['Timestamp', 'Type', 'Value'],
      rows: data.peakMoments.map((peak: any) => [
        new Date(peak.timestamp).toLocaleString(),
        peak.type,
        peak.value
      ])
    }
  ];

  return sheets.map(sheet => 
    `${sheet.name}\n${sheet.headers.join(',')}\n${
      sheet.rows.map(row => row.join(',')).join('\n')
    }\n\n`
  ).join('\n');
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
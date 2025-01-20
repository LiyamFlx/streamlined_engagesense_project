import React, { useState } from 'react';
import { Grip } from 'lucide-react';
import { Card } from '../ui/Card';
import { EngagementHeatmap } from '../visualizations/EngagementHeatmap';
import { AudioAnalyzer } from '../audio/AudioAnalyzer';
import { TrackRecommendationPanel } from '../recommendations/TrackRecommendationPanel';
import { CrowdSentimentIndicator } from '../engagement/CrowdSentimentIndicator';

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ReactNode;
  width: 'full' | 'half' | 'third';
}

export const ModularDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: 'audio-analyzer',
      title: 'Audio Analysis',
      component: <AudioAnalyzer />,
      width: 'full'
    },
    {
      id: 'heatmap',
      title: 'Engagement Heatmap',
      component: <EngagementHeatmap history={[]} />,
      width: 'half'
    },
    {
      id: 'recommendations',
      title: 'Track Recommendations',
      component: <TrackRecommendationPanel />,
      width: 'half'
    },
    {
      id: 'sentiment',
      title: 'Crowd Sentiment',
      component: <CrowdSentimentIndicator sentiment={75} trend="rising" />,
      width: 'third'
    }
  ]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(sourceIndex, 1);
    newWidgets.splice(targetIndex, 0, removed);
    setWidgets(newWidgets);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((widget, index) => (
          <div
            key={widget.id}
            className={`
              ${widget.width === 'full' ? 'col-span-full' : ''}
              ${widget.width === 'half' ? 'md:col-span-1 lg:col-span-2' : ''}
              ${widget.width === 'third' ? 'lg:col-span-1' : ''}
            `}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
          >
            <Card className="h-full">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{widget.title}</h3>
                <Grip className="w-5 h-5 text-white/50 cursor-move" />
              </div>
              <div className="p-4">
                {widget.component}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
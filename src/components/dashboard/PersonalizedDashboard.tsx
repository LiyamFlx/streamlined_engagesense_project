import React, { useState } from 'react';
import { Settings, Layout, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { EngagementMetrics } from '../metrics/EngagementMetrics';
import { AudioVisualizer } from '../visualizer/AudioVisualizer';
import { TrackRecommendationPanel } from '../recommendations/TrackRecommendationPanel';
import { AIRecommendationEngine } from '../predictions/AIRecommendationEngine';
import { AdvancedAnalyticsDashboard } from '../analytics/AdvancedAnalyticsDashboard';

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ReactNode;
  enabled: boolean;
  order: number;
}

export const PersonalizedDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: 'metrics',
      title: 'Engagement Metrics',
      component: <EngagementMetrics />,
      enabled: true,
      order: 0
    },
    {
      id: 'visualizer',
      title: 'Audio Visualizer',
      component: <AudioVisualizer />,
      enabled: true,
      order: 1
    },
    {
      id: 'recommendations',
      title: 'Track Recommendations',
      component: <TrackRecommendationPanel />,
      enabled: true,
      order: 2
    },
    {
      id: 'ai-insights',
      title: 'AI Insights',
      component: <AIRecommendationEngine metrics={{} as any} history={[]} />,
      enabled: true,
      order: 3
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      component: <AdvancedAnalyticsDashboard metrics={[]} peakMoments={0} averageEngagement={0} crowdSize={0} />,
      enabled: true,
      order: 4
    }
  ]);

  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleWidgetToggle = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget
    ));
  };

  const handleWidgetReorder = (dragIndex: number, dropIndex: number) => {
    const newWidgets = [...widgets];
    const [draggedWidget] = newWidgets.splice(dragIndex, 1);
    newWidgets.splice(dropIndex, 0, draggedWidget);
    
    setWidgets(newWidgets.map((widget, index) => ({
      ...widget,
      order: index
    })));
  };

  const saveLayout = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(widgets));
    setIsCustomizing(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Customization Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Your Dashboard</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <Layout className="w-5 h-5" />
            {isCustomizing ? 'Done' : 'Customize'}
          </button>
          {isCustomizing && (
            <button
              onClick={saveLayout}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Layout
            </button>
          )}
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets
          .filter(widget => widget.enabled)
          .sort((a, b) => a.order - b.order)
          .map((widget, index) => (
            <div
              key={widget.id}
              className={`${
                widget.id === 'analytics' ? 'md:col-span-2 lg:col-span-3' : ''
              }`}
              draggable={isCustomizing}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                handleWidgetReorder(dragIndex, index);
              }}
            >
              <Card className="h-full">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{widget.title}</h3>
                  {isCustomizing && (
                    <button
                      onClick={() => handleWidgetToggle(widget.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5 text-white/50" />
                    </button>
                  )}
                </div>
                <div className="p-4">
                  {widget.component}
                </div>
              </Card>
            </div>
          ))}
      </div>

      {/* Widget Settings Panel */}
      {isCustomizing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Available Widgets</h3>
          <div className="space-y-3">
            {widgets.map(widget => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <span className="text-white">{widget.title}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={widget.enabled}
                    onChange={() => handleWidgetToggle(widget.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
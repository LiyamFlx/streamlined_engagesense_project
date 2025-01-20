import React from 'react';
import { Card } from '../ui/Card';

interface EQControlsProps {
  high: number;
  mid: number;
  low: number;
  onHighChange: (value: number) => void;
  onMidChange: (value: number) => void;
  onLowChange: (value: number) => void;
  filterFreq: number;
  onFilterChange: (value: number) => void;
}

export const EQControls: React.FC<EQControlsProps> = ({
  high,
  mid,
  low,
  onHighChange,
  onMidChange,
  onLowChange,
  filterFreq,
  onFilterChange
}) => (
  <Card className="p-4">
    <h3 className="text-lg font-semibold text-white mb-4">EQ Controls</h3>
    <div className="grid grid-cols-4 gap-4">
      <div className="space-y-2">
        <label className="text-white/70 text-sm">High</label>
        <input
          type="range"
          min="-12"
          max="12"
          value={high}
          onChange={(e) => onHighChange(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <span className="text-white text-center block">{high}dB</span>
      </div>
      <div className="space-y-2">
        <label className="text-white/70 text-sm">Mid</label>
        <input
          type="range"
          min="-12"
          max="12"
          value={mid}
          onChange={(e) => onMidChange(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <span className="text-white text-center block">{mid}dB</span>
      </div>
      <div className="space-y-2">
        <label className="text-white/70 text-sm">Low</label>
        <input
          type="range"
          min="-12"
          max="12"
          value={low}
          onChange={(e) => onLowChange(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <span className="text-white text-center block">{low}dB</span>
      </div>
      <div className="space-y-2">
        <label className="text-white/70 text-sm">Filter</label>
        <input
          type="range"
          min="20"
          max="20000"
          step="100"
          value={filterFreq}
          onChange={(e) => onFilterChange(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <span className="text-white text-center block">{filterFreq}Hz</span>
      </div>
    </div>
  </Card>
);
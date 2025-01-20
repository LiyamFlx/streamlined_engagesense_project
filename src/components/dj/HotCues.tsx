import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface HotCue {
  id: string;
  position: number;
  color: string;
  label?: string;
}

interface HotCuesProps {
  cues: HotCue[];
  onTriggerCue: (id: string) => void;
  onSetCue: (position: number) => void;
  onDeleteCue: (id: string) => void;
}

export const HotCues: React.FC<HotCuesProps> = ({
  cues,
  onTriggerCue,
  onSetCue,
  onDeleteCue
}) => (
  <Card className="p-4">
    <h3 className="text-lg font-semibold text-white mb-4">Hot Cues</h3>
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 8 }).map((_, index) => {
        const cue = cues.find(c => c.position === index);
        return (
          <Button
            key={index}
            variant={cue ? 'primary' : 'secondary'}
            className={`h-12 ${cue?.color}`}
            onClick={() => cue ? onTriggerCue(cue.id) : onSetCue(index)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (cue) onDeleteCue(cue.id);
            }}
          >
            {cue?.label || String.fromCharCode(65 + index)}
          </Button>
        );
      })}
    </div>
  </Card>
);
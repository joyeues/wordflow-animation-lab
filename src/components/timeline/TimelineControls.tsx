
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Play, Square, RotateCcw, Pause, RotateCw, Trash2 } from 'lucide-react';
import { formatTime } from './timelineUtils';

interface TimelineControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  isLooping: boolean;
  onLoopToggle: (isLooping: boolean) => void;
  selectedBlockId: string | null;
  onBlockDelete: (blockId: string) => void;
  currentTime: number;
  totalDuration: number;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  isPlaying,
  onPlay,
  onStop,
  isLooping,
  onLoopToggle,
  selectedBlockId,
  onBlockDelete,
  currentTime,
  totalDuration
}) => {
  const handleRestart = () => {
    onStop(); // Always stop first
  };

  return (
    <div className="h-12 border-b border-gray-700 flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium">Timeline</div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onPlay} className="flex items-center gap-1">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-xs">{isPlaying ? 'Pause' : 'Play'}</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRestart} className="flex items-center gap-1">
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs">Restart</span>
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <RotateCw className="w-4 h-4 text-gray-400" />
            <Switch
              checked={isLooping}
              onCheckedChange={onLoopToggle}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className="text-xs text-gray-400">Loop</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {selectedBlockId && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onBlockDelete(selectedBlockId)}
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-xs">Delete</span>
          </Button>
        )}
        <div className="text-xs text-gray-400">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>
      </div>
    </div>
  );
};

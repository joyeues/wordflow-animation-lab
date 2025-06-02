
import React from 'react';
import { formatTime } from './timelineUtils';

interface TimelineRulerProps {
  totalDuration: number;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({ totalDuration }) => {
  return (
    <div className="absolute top-0 left-0 right-0 h-6 border-b border-gray-700 bg-gray-800">
      {Array.from({ length: Math.ceil(totalDuration / 1000) }).map((_, i) => {
        const time = i * 1000;
        const x = (time / totalDuration) * 100;
        return (
          <div
            key={i}
            className="absolute top-0 h-full border-l border-gray-600"
            style={{ left: `${x}%` }}
          >
            <div className="text-xs text-gray-400 ml-1 mt-1">
              {formatTime(time)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

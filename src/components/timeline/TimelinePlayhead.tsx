
import React from 'react';

interface TimelinePlayheadProps {
  currentTime: number;
  totalDuration: number;
}

export const TimelinePlayhead: React.FC<TimelinePlayheadProps> = ({
  currentTime,
  totalDuration
}) => {
  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
      style={{ left: `${(currentTime / totalDuration) * 100}%` }}
    >
      <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
    </div>
  );
};

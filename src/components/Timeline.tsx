
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw, Pause } from 'lucide-react';
import type { ContentBlock } from '@/pages/Index';

interface TimelineProps {
  contentBlocks: ContentBlock[];
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  onBlockUpdate: (blockId: string, updates: Partial<ContentBlock>) => void;
  selectedBlockId: string | null;
  onBlockSelect: (blockId: string | null) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  contentBlocks,
  currentTime,
  totalDuration,
  onSeek,
  onBlockUpdate,
  selectedBlockId,
  onBlockSelect,
  isPlaying,
  onPlay,
  onStop
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'move' | 'resize-start' | 'resize-end' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const pixelsPerMs = (timelineRef.current?.clientWidth || 800) / totalDuration;

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || isDragging) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * totalDuration;
    onSeek(Math.max(0, Math.min(totalDuration, time)));
  };

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current || isDragging) return;
    
    setIsScrubbing(true);
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * totalDuration;
    onSeek(Math.max(0, Math.min(totalDuration, time)));
  };

  const handleBlockMouseDown = (e: React.MouseEvent, blockId: string, type: 'move' | 'resize-start' | 'resize-end') => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedBlock(blockId);
    setDragType(type);
    onBlockSelect(blockId);

    // Calculate offset for smoother dragging
    if (type === 'move' && timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const block = contentBlocks.find(b => b.id === blockId);
      if (block) {
        const blockStartX = (block.startTime / totalDuration) * rect.width;
        const clickX = e.clientX - rect.left;
        setDragOffset(clickX - blockStartX);
      }
    } else {
      setDragOffset(0);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * totalDuration;

    if (isScrubbing) {
      onSeek(Math.max(0, Math.min(totalDuration, time)));
      return;
    }

    if (!isDragging || !draggedBlock) return;

    const block = contentBlocks.find(b => b.id === draggedBlock);
    if (!block) return;

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      if (dragType === 'move') {
        const adjustedTime = time - (dragOffset / rect.width) * totalDuration;
        const newStartTime = Math.max(0, Math.min(totalDuration - block.duration, adjustedTime));
        onBlockUpdate(draggedBlock, { startTime: Math.round(newStartTime) });
      } else if (dragType === 'resize-start') {
        const newStartTime = Math.max(0, Math.min(block.startTime + block.duration - 100, time));
        const newDuration = block.duration + (block.startTime - newStartTime);
        onBlockUpdate(draggedBlock, { startTime: Math.round(newStartTime), duration: Math.round(newDuration) });
      } else if (dragType === 'resize-end') {
        const newDuration = Math.max(100, time - block.startTime);
        onBlockUpdate(draggedBlock, { duration: Math.round(newDuration) });
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsScrubbing(false);
    setDraggedBlock(null);
    setDragType(null);
    setDragOffset(0);
  };

  const handleRestart = () => {
    onStop(); // Always stop first
    onSeek(0); // Then reset to beginning
  };

  useEffect(() => {
    if (isDragging || isScrubbing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, isScrubbing, draggedBlock, dragType, dragOffset]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Timeline Header with Controls */}
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
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 relative">
        {/* Time rulers */}
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

        {/* Timeline track */}
        <div
          ref={timelineRef}
          className="absolute top-6 left-0 right-0 bottom-0 bg-gray-800 cursor-pointer select-none"
          onMouseDown={handleTimelineMouseDown}
        >
          {/* Content blocks */}
          <div className="absolute top-4 left-0 right-0 h-16">
            {contentBlocks.map((block) => {
              const left = (block.startTime / totalDuration) * 100;
              const width = (block.duration / totalDuration) * 100;
              const isSelected = selectedBlockId === block.id;

              return (
                <div
                  key={block.id}
                  className={`absolute h-12 rounded cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-blue-400 bg-blue-500' 
                      : block.type === 'paragraph' 
                        ? 'bg-green-500 hover:bg-green-400' 
                        : 'bg-purple-500 hover:bg-purple-400'
                  }`}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top: block.type === 'paragraph' ? '0px' : '16px'
                  }}
                  onMouseDown={(e) => handleBlockMouseDown(e, block.id, 'move')}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBlockSelect(block.id);
                  }}
                >
                  {/* Resize handles */}
                  <div
                    className="absolute left-0 top-0 w-2 h-full cursor-w-resize bg-black bg-opacity-20 opacity-0 hover:opacity-100"
                    onMouseDown={(e) => handleBlockMouseDown(e, block.id, 'resize-start')}
                  />
                  <div
                    className="absolute right-0 top-0 w-2 h-full cursor-e-resize bg-black bg-opacity-20 opacity-0 hover:opacity-100"
                    onMouseDown={(e) => handleBlockMouseDown(e, block.id, 'resize-end')}
                  />

                  {/* Block content */}
                  <div className="px-2 py-1 text-xs font-medium text-white truncate">
                    {block.type === 'paragraph' ? 'P' : 'BL'}: {
                      typeof block.content === 'string' 
                        ? block.content.slice(0, 20) 
                        : block.content.title
                    }...
                  </div>
                </div>
              );
            })}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
          >
            <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

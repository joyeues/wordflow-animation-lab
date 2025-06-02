
import React, { useRef, useEffect, useState } from 'react';
import type { ContentBlock } from '@/pages/Index';
import { TimelineControls } from './timeline/TimelineControls';
import { TimelineRuler } from './timeline/TimelineRuler';
import { TimelineBlocks } from './timeline/TimelineBlocks';
import { TimelinePlayhead } from './timeline/TimelinePlayhead';
import { snapToTen } from './timeline/timelineUtils';

interface TimelineProps {
  contentBlocks: ContentBlock[];
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  onBlockUpdate: (blockId: string, updates: Partial<ContentBlock>) => void;
  selectedBlockId: string | null;
  onBlockSelect: (blockId: string | null) => void;
  onBlockDelete: (blockId: string) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  isLooping: boolean;
  onLoopToggle: (isLooping: boolean) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  contentBlocks,
  currentTime,
  totalDuration,
  onSeek,
  onBlockUpdate,
  selectedBlockId,
  onBlockSelect,
  onBlockDelete,
  isPlaying,
  onPlay,
  onStop,
  isLooping,
  onLoopToggle
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'move' | 'resize-start' | 'resize-end' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || isDragging) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * totalDuration;
    onSeek(Math.max(0, Math.min(totalDuration, snapToTen(time))));
  };

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    // Check if we're clicking on a block
    const target = e.target as HTMLElement;
    if (target.closest('[data-block-id]')) {
      return; // Let block handling take precedence
    }
    
    // Deselect any selected blocks when clicking on empty timeline
    onBlockSelect(null);
    
    setIsScrubbing(true);
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * totalDuration;
    onSeek(Math.max(0, Math.min(totalDuration, snapToTen(time))));
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

    if (isScrubbing && !isDragging) {
      onSeek(Math.max(0, Math.min(totalDuration, snapToTen(time))));
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
        onBlockUpdate(draggedBlock, { startTime: snapToTen(newStartTime) });
      } else if (dragType === 'resize-start') {
        const newStartTime = Math.max(0, Math.min(block.startTime + block.duration - 100, time));
        const newDuration = block.duration + (block.startTime - newStartTime);
        onBlockUpdate(draggedBlock, { startTime: snapToTen(newStartTime), duration: snapToTen(newDuration) });
      } else if (dragType === 'resize-end') {
        const newDuration = Math.max(100, time - block.startTime);
        onBlockUpdate(draggedBlock, { duration: snapToTen(newDuration) });
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

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Timeline Header with Controls */}
      <TimelineControls
        isPlaying={isPlaying}
        onPlay={onPlay}
        onStop={onStop}
        isLooping={isLooping}
        onLoopToggle={onLoopToggle}
        selectedBlockId={selectedBlockId}
        onBlockDelete={onBlockDelete}
        currentTime={currentTime}
        totalDuration={totalDuration}
      />

      {/* Timeline Content */}
      <div className="flex-1 relative">
        {/* Time rulers */}
        <TimelineRuler totalDuration={totalDuration} />

        {/* Timeline track */}
        <div
          ref={timelineRef}
          className="absolute top-6 left-0 right-0 bottom-0 bg-gray-800 cursor-pointer select-none"
          onMouseDown={handleTimelineMouseDown}
        >
          {/* Content blocks */}
          <TimelineBlocks
            contentBlocks={contentBlocks}
            totalDuration={totalDuration}
            selectedBlockId={selectedBlockId}
            onBlockMouseDown={handleBlockMouseDown}
            onBlockSelect={onBlockSelect}
          />

          {/* Playhead */}
          <TimelinePlayhead currentTime={currentTime} totalDuration={totalDuration} />
        </div>
      </div>
    </div>
  );
};

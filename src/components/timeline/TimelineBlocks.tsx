
import React, { useState } from 'react';
import type { ContentBlock } from '@/pages/Index';
import { getBlockDisplayText } from './timelineUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimelineBlocksProps {
  contentBlocks: ContentBlock[];
  totalDuration: number;
  selectedBlockId: string | null;
  onBlockMouseDown: (e: React.MouseEvent, blockId: string, type: 'move' | 'resize-start' | 'resize-end') => void;
  onBlockSelect: (blockId: string | null) => void;
}

export const TimelineBlocks: React.FC<TimelineBlocksProps> = ({
  contentBlocks,
  totalDuration,
  selectedBlockId,
  onBlockMouseDown,
  onBlockSelect
}) => {
  const [resizingBlock, setResizingBlock] = useState<{
    blockId: string;
    type: 'resize-start' | 'resize-end';
    duration: number;
  } | null>(null);

  const handleResizeMouseDown = (e: React.MouseEvent, blockId: string, type: 'resize-start' | 'resize-end') => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block) {
      setResizingBlock({
        blockId,
        type,
        duration: block.duration
      });
    }
    onBlockMouseDown(e, blockId, type);
  };

  // Update duration when block changes during resize
  React.useEffect(() => {
    if (resizingBlock) {
      const block = contentBlocks.find(b => b.id === resizingBlock.blockId);
      if (block && block.duration !== resizingBlock.duration) {
        setResizingBlock(prev => prev ? {
          ...prev,
          duration: block.duration
        } : null);
      }
    }
  }, [contentBlocks, resizingBlock]);

  // Clear resizing state when mouse is released
  React.useEffect(() => {
    const handleMouseUp = () => {
      setResizingBlock(null);
    };

    if (resizingBlock) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [resizingBlock]);

  return (
    <div className="absolute top-4 left-0 right-0 h-16">
      {contentBlocks.map((block) => {
        const left = (block.startTime / totalDuration) * 100;
        const width = (block.duration / totalDuration) * 100;
        const isSelected = selectedBlockId === block.id;
        const isResizing = resizingBlock?.blockId === block.id;

        return (
          <div
            key={block.id}
            data-block-id={block.id}
            className={`absolute h-12 rounded cursor-pointer transition-all ${
              isSelected 
                ? 'ring-2 ring-blue-400 bg-blue-500' 
                : block.type === 'paragraph' 
                  ? 'bg-green-500 hover:bg-green-400' 
                  : block.type === 'bulletList'
                    ? 'bg-purple-500 hover:bg-purple-400'
                    : 'bg-orange-500 hover:bg-orange-400'
            }`}
            style={{
              left: `${left}%`,
              width: `${width}%`,
              top: block.type === 'paragraph' ? '0px' : block.type === 'bulletList' ? '16px' : '32px'
            }}
            onMouseDown={(e) => onBlockMouseDown(e, block.id, 'move')}
            onClick={(e) => {
              e.stopPropagation();
              onBlockSelect(block.id);
            }}
          >
            {/* Resize handles with tooltips */}
            <TooltipProvider>
              <Tooltip open={isResizing && resizingBlock?.type === 'resize-start'}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute left-0 top-0 w-2 h-full cursor-w-resize bg-black bg-opacity-20 opacity-0 hover:opacity-100"
                    onMouseDown={(e) => handleResizeMouseDown(e, block.id, 'resize-start')}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 text-white text-xs px-2 py-1">
                  {Math.round(resizingBlock?.duration || block.duration)}ms
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip open={isResizing && resizingBlock?.type === 'resize-end'}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute right-0 top-0 w-2 h-full cursor-e-resize bg-black bg-opacity-20 opacity-0 hover:opacity-100"
                    onMouseDown={(e) => handleResizeMouseDown(e, block.id, 'resize-end')}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 text-white text-xs px-2 py-1">
                  {Math.round(resizingBlock?.duration || block.duration)}ms
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Block content */}
            <div className="px-2 py-1 text-xs font-medium text-white truncate">
              {block.type === 'paragraph' ? 'P' : block.type === 'bulletList' ? 'BL' : 'CH'}: {getBlockDisplayText(block)}...
            </div>
          </div>
        );
      })}
    </div>
  );
};

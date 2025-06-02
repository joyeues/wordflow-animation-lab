
import React, { useRef, useEffect } from 'react';
import { ParagraphBlock } from '@/components/ParagraphBlock';
import { BulletListBlock } from '@/components/BulletListBlock';
import { ChartBlock } from '@/components/ChartBlock';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { ContentBlock, AnimationConfig } from '@/pages/Index';

interface ContentPreviewProps {
  contentBlocks: ContentBlock[];
  currentTime: number;
  globalConfig: AnimationConfig;
  onBlockSelect: (blockId: string | null, isShiftClick?: boolean) => void;
  selectedBlockIds: string[];
  onBlockDelete: (blockId: string) => void;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  contentBlocks,
  currentTime,
  globalConfig,
  onBlockSelect,
  selectedBlockIds,
  onBlockDelete
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastActiveBlockRef = useRef<string | null>(null);

  // Auto-scroll to the latest active block
  useEffect(() => {
    const activeBlocks = contentBlocks.filter(block => currentTime >= block.startTime && currentTime <= block.startTime + block.duration);
    if (activeBlocks.length > 0 && scrollContainerRef.current) {
      const latestActiveBlock = activeBlocks[activeBlocks.length - 1];
      if (latestActiveBlock.id !== lastActiveBlockRef.current) {
        const blockElement = document.getElementById(`block-${latestActiveBlock.id}`);
        if (blockElement) {
          blockElement.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
        lastActiveBlockRef.current = latestActiveBlock.id;
      }
    }
  }, [currentTime, contentBlocks]);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the background, not on child elements
    if (e.target === e.currentTarget) {
      onBlockSelect(null);
    }
  };

  const handleDeleteSelected = () => {
    selectedBlockIds.forEach(id => onBlockDelete(id));
  };
  
  return (
    <div className="h-full bg-gray-100 relative">
      {/* Multi-select delete button */}
      {selectedBlockIds.length > 1 && (
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            className="shadow-lg"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete {selectedBlockIds.length} blocks
          </Button>
        </div>
      )}

      <div 
        ref={scrollContainerRef} 
        className="h-full overflow-y-auto p-6"
        onClick={handleBackgroundClick}
      >
        <div className="max-w-4xl mx-auto space-y-1">
          {contentBlocks.sort((a, b) => a.startTime - b.startTime).map((block, index) => {
            // Calculate speed multiplier based on block duration vs default duration (3000ms)
            const baseDuration = 3000;
            const speedMultiplier = baseDuration / block.duration;
            const adjustedCurrentTime = Math.max(0, currentTime - block.startTime) / globalConfig.globalSpeed * speedMultiplier;
            const isActive = currentTime >= block.startTime && currentTime <= block.startTime + block.duration;
            const hasStarted = currentTime >= block.startTime;
            const isSelected = selectedBlockIds.includes(block.id);
            
            return (
              <div
                key={block.id}
                id={`block-${block.id}`}
                className={`relative cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBlockSelect(block.id, e.shiftKey);
                }}
              >
                <div className="mx-[115px]">
                  {block.type === 'paragraph' && (
                    <ParagraphBlock
                      content={block.content as string}
                      animationConfig={block.animationConfig}
                      currentTime={adjustedCurrentTime}
                      isActive={isActive}
                      hasStarted={hasStarted}
                    />
                  )}
                  {block.type === 'bulletList' && (
                    <BulletListBlock
                      content={block.content as { title: string; items: Array<{ bold: string; desc: string }> }}
                      animationConfig={block.animationConfig}
                      currentTime={adjustedCurrentTime}
                      isActive={isActive}
                      hasStarted={hasStarted}
                    />
                  )}
                  {block.type === 'chart' && (
                    <ChartBlock
                      content={block.content as {
                        chartType: 'bar' | 'line' | 'pie' | 'doughnut';
                        data: any;
                        options?: any;
                      }}
                      isVisible={isActive}
                      className="transition-opacity duration-500"
                    />
                  )}
                </div>
                
                {/* Block info overlay */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                  {block.type} • {block.startTime}ms - {block.startTime + block.duration}ms • {speedMultiplier.toFixed(1)}x speed
                </div>

                {/* Delete button - only show for single selection */}
                {isSelected && selectedBlockIds.length === 1 && (
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBlockDelete(block.id);
                      }}
                      className="h-8 w-8 p-0 shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Multi-selection indicator */}
                {isSelected && selectedBlockIds.length > 1 && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                    Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

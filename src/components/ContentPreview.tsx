
import React, { useRef, useEffect } from 'react';
import { ParagraphBlock } from '@/components/ParagraphBlock';
import { BulletListBlock } from '@/components/BulletListBlock';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { ContentBlock, AnimationConfig } from '@/pages/Index';

interface ContentPreviewProps {
  contentBlocks: ContentBlock[];
  currentTime: number;
  globalConfig: AnimationConfig;
  onBlockSelect: (blockId: string | null) => void;
  selectedBlockId: string | null;
  onBlockDelete: (blockId: string) => void;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  contentBlocks,
  currentTime,
  globalConfig,
  onBlockSelect,
  selectedBlockId,
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
  
  return (
    <div className="h-full bg-gray-100 relative">
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
            const isSelected = selectedBlockId === block.id;
            
            return (
              <div
                key={block.id}
                id={`block-${block.id}`}
                className="relative cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onBlockSelect(block.id);
                }}
              >
                <div className="mx-[115px]">
                  {block.type === 'paragraph' ? (
                    <ParagraphBlock
                      content={block.content as string}
                      animationConfig={block.animationConfig}
                      currentTime={adjustedCurrentTime}
                      isActive={isActive}
                      hasStarted={hasStarted}
                    />
                  ) : (
                    <BulletListBlock
                      content={block.content as { title: string; items: Array<{ bold: string; desc: string }> }}
                      animationConfig={block.animationConfig}
                      currentTime={adjustedCurrentTime}
                      isActive={isActive}
                      hasStarted={hasStarted}
                    />
                  )}
                </div>
                
                {/* Block info overlay */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                  {block.type} • {block.startTime}ms - {block.startTime + block.duration}ms • {speedMultiplier.toFixed(1)}x speed
                </div>

                {/* Delete flyout */}
                {isSelected && (
                  <div className="absolute top-2 left-2 z-10">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

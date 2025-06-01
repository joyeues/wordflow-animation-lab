
import React, { useRef, useEffect } from 'react';
import { ParagraphBlock } from '@/components/ParagraphBlock';
import { BulletListBlock } from '@/components/BulletListBlock';
import type { ContentBlock, AnimationConfig } from '@/pages/Index';

interface ContentPreviewProps {
  contentBlocks: ContentBlock[];
  currentTime: number;
  globalConfig: AnimationConfig;
  onBlockSelect: (blockId: string | null) => void;
  selectedBlockId: string | null;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  contentBlocks,
  currentTime,
  globalConfig,
  onBlockSelect,
  selectedBlockId
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
  
  return (
    <div className="h-full bg-gray-100 relative">
      <div ref={scrollContainerRef} className="h-full overflow-y-auto p-6">
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
                className={`relative transition-all duration-300 cursor-pointer ${
                  !hasStarted 
                    ? 'opacity-0 translate-y-4' 
                    : 'opacity-100 translate-y-0'
                }`}
                onClick={() => onBlockSelect(block.id)}
                style={{
                  transitionDelay: !hasStarted ? '0ms' : `${Math.max(0, block.startTime - currentTime)}ms`
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

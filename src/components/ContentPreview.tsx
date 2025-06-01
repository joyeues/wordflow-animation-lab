
import React from 'react';
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
  return (
    <div className="h-full bg-gray-50 relative overflow-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-2xl p-8 space-y-8">
          {contentBlocks.map((block) => {
            const adjustedCurrentTime = Math.max(0, currentTime - block.startTime) / globalConfig.globalSpeed;
            const isActive = currentTime >= block.startTime && currentTime <= block.startTime + block.duration;
            const isSelected = selectedBlockId === block.id;

            return (
              <div
                key={block.id}
                className={`relative transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                } ${!isActive ? 'opacity-30' : ''}`}
                onClick={() => onBlockSelect(block.id)}
              >
                {block.type === 'paragraph' ? (
                  <ParagraphBlock
                    content={block.content as string}
                    animationConfig={block.animationConfig}
                    currentTime={adjustedCurrentTime}
                    isActive={isActive}
                  />
                ) : (
                  <BulletListBlock
                    content={block.content as { title: string; items: Array<{ bold: string; desc: string }> }}
                    animationConfig={block.animationConfig}
                    currentTime={adjustedCurrentTime}
                    isActive={isActive}
                  />
                )}
                
                {/* Block info overlay */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                  {block.type} • {block.startTime}ms - {block.startTime + block.duration}ms
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

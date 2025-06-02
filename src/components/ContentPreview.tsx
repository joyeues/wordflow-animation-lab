
import React from 'react';
import { ParagraphBlock } from './ParagraphBlock';
import { BulletListBlock } from './BulletListBlock';
import { ChartBlock } from './ChartBlock';
import type { ContentBlock } from '@/pages/Index';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ContentPreviewProps {
  contentBlocks: ContentBlock[];
  currentTime: number;
  globalConfig: any;
  onBlockSelect: (blockId: string | null) => void;
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
  const handleBlockClick = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation(); // Prevent click from propagating to the background
    onBlockSelect(blockId);
  };

  const handleBackgroundClick = () => {
    onBlockSelect(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    onBlockDelete(blockId);
  };

  return (
    <div className="h-full bg-gray-50 p-8 overflow-auto relative" onClick={handleBackgroundClick}>
      {contentBlocks.map((block) => {
        const isVisible = currentTime >= block.startTime;
        const isActive = currentTime >= block.startTime && currentTime <= block.startTime + block.duration;
        const hasStarted = currentTime >= block.startTime;
        const isSelected = selectedBlockIds.includes(block.id);

        return (
          <div key={block.id} className="relative mb-8">
            {/* Selection overlay */}
            {isSelected && (
              <div className="absolute -inset-4 border-2 border-blue-400 rounded-lg bg-blue-50 bg-opacity-50 pointer-events-none" />
            )}

            {/* Delete button */}
            {isSelected && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full z-10"
                onClick={(e) => handleDeleteClick(e, block.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            )}

            {/* Content based on block type */}
            <div
              className="cursor-pointer"
              onClick={(e) => handleBlockClick(e, block.id)}
            >
              {block.type === 'paragraph' && (
                <ParagraphBlock
                  content={block.content as string}
                  currentTime={currentTime - block.startTime}
                  animationConfig={block.animationConfig}
                  globalConfig={globalConfig}
                  isActive={isActive}
                  hasStarted={hasStarted}
                />
              )}

              {block.type === 'bulletList' && (
                <BulletListBlock
                  content={block.content as { title: string; items: Array<{ bold: string; desc: string }> }}
                  currentTime={currentTime - block.startTime}
                  animationConfig={block.animationConfig}
                  globalConfig={globalConfig}
                  isActive={isActive}
                  hasStarted={hasStarted}
                />
              )}

              {block.type === 'chart' && (
                <ChartBlock
                  content={{
                    ...(block.content as any),
                    duration: block.duration // Pass the block's duration to the chart
                  }}
                  isVisible={isVisible}
                  currentTime={currentTime - block.startTime}
                  isActive={isActive}
                  hasStarted={hasStarted}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

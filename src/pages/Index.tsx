
import React, { useState, useRef, useEffect } from 'react';
import { AnimationControlPanel } from '@/components/AnimationControlPanel';
import { ContentPreview } from '@/components/ContentPreview';
import { Timeline } from '@/components/Timeline';
import { ExportPanel } from '@/components/ExportPanel';
import { Button } from '@/components/ui/button';
import { FileCode, Play, Square, Plus } from 'lucide-react';

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'bulletList';
  content: string | { title: string; items: Array<{ bold: string; desc: string }> };
  startTime: number;
  duration: number;
  animationConfig: {
    charFadeDelay: number;
    maskFadeDelay: number;
    maskFadeDuration: number;
    staggerDelay?: number;
    curve: string;
  };
}

export interface AnimationConfig {
  globalSpeed: number;
  curve: string;
  charFadeDelay: number;
  maskFadeDelay: number;
  maskFadeDuration: number;
  staggerDelay: number;
}

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(10000); // 10 seconds
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      id: '1',
      type: 'paragraph',
      content: 'Lorem ipsum dolor sit amet consectetur. Vitae pharetra sem feugiat viverra quis id. Vel sit id at et ullamcorper neque enim. Est sit lacus quisque faucibus nec elementum sed lobortis.',
      startTime: 0,
      duration: 3000,
      animationConfig: {
        charFadeDelay: 4,
        maskFadeDelay: 100,
        maskFadeDuration: 200,
        curve: 'cubic-bezier(0.45,0,0.58,1)'
      }
    },
    {
      id: '2',
      type: 'bulletList',
      content: {
        title: 'Skills to learn',
        items: [
          { bold: 'Video Editing', desc: 'For quickly creating shareable content.' },
          { bold: 'Storyboarding and Concepting', desc: 'For product design, branding, and pitches.' },
          { bold: 'AI Ethics and Responsible AI', desc: 'Increasingly essential as companies face regulation and reputation risk.' }
        ]
      },
      startTime: 4000,
      duration: 4000,
      animationConfig: {
        charFadeDelay: 0,
        maskFadeDelay: 200,
        maskFadeDuration: 400,
        staggerDelay: 100,
        curve: 'cubic-bezier(0.00,0.00,0.00,1.00)'
      }
    }
  ]);

  const [globalConfig, setGlobalConfig] = useState<AnimationConfig>({
    globalSpeed: 1,
    curve: 'cubic-bezier(0.45,0,0.58,1)',
    charFadeDelay: 4,
    maskFadeDelay: 100,
    maskFadeDuration: 200,
    staggerDelay: 100
  });

  const animationRef = useRef<number>();

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - currentTime;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= totalDuration) {
          setCurrentTime(totalDuration);
          setIsPlaying(false);
        } else {
          setCurrentTime(elapsed);
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, totalDuration]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTimelineSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<ContentBlock>) => {
    setContentBlocks(blocks => 
      blocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  };

  const handleAddBlock = (type: 'paragraph' | 'bulletList') => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'paragraph' 
        ? 'New paragraph content...' 
        : { title: 'New List', items: [{ bold: 'Item', desc: 'Description' }] },
      startTime: Math.max(...contentBlocks.map(b => b.startTime + b.duration), 0),
      duration: 3000,
      animationConfig: { ...globalConfig }
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">AI Animation Studio</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock('paragraph')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Paragraph
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock('bulletList')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Bullet List
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePlay}>
            {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleStop}>
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportPanel(!showExportPanel)}
          >
            <FileCode className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Control Panel */}
        <div className="w-80 border-r bg-white">
          <AnimationControlPanel
            globalConfig={globalConfig}
            onGlobalConfigChange={setGlobalConfig}
            selectedBlock={selectedBlockId ? contentBlocks.find(b => b.id === selectedBlockId) : null}
            onBlockUpdate={handleBlockUpdate}
          />
        </div>

        {/* Preview Area */}
        <div className="flex-1 relative">
          <ContentPreview
            contentBlocks={contentBlocks}
            currentTime={currentTime}
            globalConfig={globalConfig}
            onBlockSelect={setSelectedBlockId}
            selectedBlockId={selectedBlockId}
          />

          {/* Export Panel */}
          <ExportPanel
            isOpen={showExportPanel}
            onClose={() => setShowExportPanel(false)}
            contentBlocks={contentBlocks}
            globalConfig={globalConfig}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="h-32 border-t bg-white">
        <Timeline
          contentBlocks={contentBlocks}
          currentTime={currentTime}
          totalDuration={totalDuration}
          onSeek={handleTimelineSeek}
          onBlockUpdate={handleBlockUpdate}
          selectedBlockId={selectedBlockId}
          onBlockSelect={setSelectedBlockId}
        />
      </div>
    </div>
  );
};

export default Index;

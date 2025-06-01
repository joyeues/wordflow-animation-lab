
import React, { useState, useRef, useEffect } from 'react';
import { AnimationControlPanel } from '@/components/AnimationControlPanel';
import { ContentPreview } from '@/components/ContentPreview';
import { Timeline } from '@/components/Timeline';
import { ExportPanel } from '@/components/ExportPanel';
import { Button } from '@/components/ui/button';
import { FileCode, Plus } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

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
  const [isLooping, setIsLooping] = useState(true);
  
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      id: '1',
      type: 'paragraph',
      content: 'Lorem ipsum dolor sit amet consectetur. Vitae pharetra sem feugiat viverra quis id. Vel sit id at et ullamcorper neque enim. Est sit lacus quisque faucibus nec elementum sed lobortis.',
      startTime: 200,
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
        title: 'Bullet List',
        items: [
          { bold: 'Lorem Ipsum', desc: 'Dolor sit amet consectetur adipiscing elit sed.' },
          { bold: 'Vestibulum Consequat', desc: 'Mauris in aliquam sem fringilla ut morbi tincidunt augue interdum.' },
          { bold: 'Pellentesque Habitant', desc: 'Morbi tristique senectus et netus et malesuada fames ac turpis egestas.'  }
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
      const startTime = Date.now() - (currentTime / globalConfig.globalSpeed);
      
      const animate = () => {
        const elapsed = (Date.now() - startTime) * globalConfig.globalSpeed;
        if (elapsed >= totalDuration) {
          if (isLooping) {
            // Reset to beginning and continue playing
            setCurrentTime(0);
            const newStartTime = Date.now();
            const animateLoop = () => {
              const newElapsed = (Date.now() - newStartTime) * globalConfig.globalSpeed;
              if (newElapsed >= totalDuration) {
                if (isLooping && isPlaying) {
                  setCurrentTime(0);
                  // Recursively restart the loop
                  setTimeout(() => {
                    if (isPlaying && isLooping) {
                      const restartTime = Date.now();
                      const restartAnimate = () => {
                        const restartElapsed = (Date.now() - restartTime) * globalConfig.globalSpeed;
                        if (restartElapsed >= totalDuration) {
                          if (isLooping && isPlaying) {
                            setCurrentTime(0);
                            animationRef.current = requestAnimationFrame(() => restartAnimate());
                          } else {
                            setCurrentTime(totalDuration);
                            setIsPlaying(false);
                          }
                        } else {
                          setCurrentTime(restartElapsed);
                          animationRef.current = requestAnimationFrame(restartAnimate);
                        }
                      };
                      animationRef.current = requestAnimationFrame(restartAnimate);
                    }
                  }, 50);
                } else {
                  setCurrentTime(totalDuration);
                  setIsPlaying(false);
                }
              } else {
                setCurrentTime(newElapsed);
                animationRef.current = requestAnimationFrame(animateLoop);
              }
            };
            animationRef.current = requestAnimationFrame(animateLoop);
          } else {
            setCurrentTime(totalDuration);
            setIsPlaying(false);
          }
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
  }, [isPlaying, totalDuration, globalConfig.globalSpeed, isLooping]);

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

  const handleBlockDelete = (blockId: string) => {
    setContentBlocks(blocks => blocks.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
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
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={75} minSize={50}>
          <div className="h-full flex">
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
                onBlockDelete={handleBlockDelete}
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
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={25} minSize={15} maxSize={50}>
          <Timeline
            contentBlocks={contentBlocks}
            currentTime={currentTime}
            totalDuration={totalDuration}
            onSeek={handleTimelineSeek}
            onBlockUpdate={handleBlockUpdate}
            selectedBlockId={selectedBlockId}
            onBlockSelect={setSelectedBlockId}
            onBlockDelete={handleBlockDelete}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onStop={handleStop}
            isLooping={isLooping}
            onLoopToggle={setIsLooping}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;

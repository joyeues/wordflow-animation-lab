import React, { useState, useRef, useEffect } from 'react';
import { AnimationControlPanel } from '@/components/AnimationControlPanel';
import { ContentPreview } from '@/components/ContentPreview';
import { Timeline } from '@/components/Timeline';
import { ExportPanel } from '@/components/ExportPanel';
import { Button } from '@/components/ui/button';
import { FileCode, Plus, BarChart3 } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'bulletList' | 'chart';
  content: string | {
    title: string;
    items: Array<{
      bold: string;
      desc: string;
    }>;
  } | {
    chartType: 'bar' | 'line' | 'pie' | 'doughnut';
    data: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
      }>;
    };
    options?: any;
  };
  startTime: number;
  duration: number;
  animationConfig: {
    charFadeDelay: number;
    maskFadeDelay: number;
    maskFadeDuration: number;
    staggerDelay?: number;
    curve: string;
    textAnimationType?: 'character' | 'word' | 'gleam';
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
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [isLooping, setIsLooping] = useState(true);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([{
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
  }, {
    id: '2',
    type: 'bulletList',
    content: {
      title: 'Bullet List',
      items: [{
        bold: 'Lorem Ipsum',
        desc: 'Dolor sit amet consectetur adipiscing elit sed.'
      }, {
        bold: 'Vestibulum Consequat',
        desc: 'Mauris in aliquam sem fringilla ut morbi tincidunt augue interdum.'
      }, {
        bold: 'Pellentesque Habitant',
        desc: 'Morbi tristique senectus et netus et malesuada fames ac turpis egestas.'
      }]
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
  }]);
  const [globalConfig, setGlobalConfig] = useState<AnimationConfig>({
    globalSpeed: 1,
    curve: 'cubic-bezier(0,0,0,1)', // Changed default to cubic-bezier(0,0,0,1)
    charFadeDelay: 4,
    maskFadeDelay: 100,
    maskFadeDuration: 200,
    staggerDelay: 100
  });
  const animationRef = useRef<number>();

  // Add keyboard event listener for spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle spacebar if not typing in an input/textarea
      if (e.code === 'Space' && e.target instanceof HTMLElement && !['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !e.target.isContentEditable) {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - currentTime / globalConfig.globalSpeed;
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
    setContentBlocks(blocks => blocks.map(block => block.id === blockId ? {
      ...block,
      ...updates
    } : block));
  };
  const handleBlockDelete = (blockId: string) => {
    setContentBlocks(blocks => blocks.filter(block => block.id !== blockId));
    setSelectedBlockIds(ids => ids.filter(id => id !== blockId));
  };
  const handleBlockSelect = (blockId: string | null, isShiftClick: boolean = false) => {
    if (blockId === null) {
      setSelectedBlockIds([]);
      return;
    }
    if (isShiftClick) {
      setSelectedBlockIds(prev => {
        if (prev.includes(blockId)) {
          // Remove if already selected
          return prev.filter(id => id !== blockId);
        } else {
          // Add to selection
          return [...prev, blockId];
        }
      });
    } else {
      // Regular click - single selection
      setSelectedBlockIds([blockId]);
    }
  };
  const handleAddBlock = (type: 'paragraph' | 'bulletList' | 'chart') => {
    let newContent;
    
    if (type === 'paragraph') {
      newContent = 'Lorem ipsum dolor sit amet consectetur. Vitae pharetra sem feugiat viverra quis id. Vel sit id at et ullamcorper neque enim. Est sit lacus quisque faucibus nec elementum sed lobortis.';
    } else if (type === 'bulletList') {
      newContent = {
        title: 'Bullet List',
        items: [{
          bold: 'Lorem Ipsum',
          desc: 'Dolor sit amet consectetur adipiscing elit sed.'
        }, {
          bold: 'Vestibulum Consequat',
          desc: 'Mauris in aliquam sem fringilla ut morbi tincidunt augue interdum.'
        }, {
          bold: 'Pellentesque Habitant',
          desc: 'Morbi tristique senectus et netus et malesuada fames ac turpis egestas.'
        }]
      };
    } else if (type === 'chart') {
      newContent = {
        chartType: 'doughnut' as const,
        data: {
          labels: ['January', 'February', 'March', 'April', 'May'],
          datasets: [{
            label: 'Sales Data',
            data: [12, 19, 3, 5, 2],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: 'Sample Chart'
            }
          }
        }
      };
    }

    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: newContent,
      startTime: Math.max(...contentBlocks.map(b => b.startTime + b.duration), 0),
      duration: 3000,
      animationConfig: {
        ...globalConfig,
        curve: 'cubic-bezier(0,0,0,1)' // Set default curve for new blocks
      }
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  // Get the first selected block for the control panel
  const selectedBlock = selectedBlockIds.length > 0 ? contentBlocks.find(b => b.id === selectedBlockIds[0]) : null;
  return <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Streaming Studio</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleAddBlock('paragraph')}>
              <Plus className="w-4 h-4 mr-2" />
              Paragraph
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddBlock('bulletList')}>
              <Plus className="w-4 h-4 mr-2" />
              Bullet List
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddBlock('chart')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Chart
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExportPanel(!showExportPanel)}>
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
              <AnimationControlPanel globalConfig={globalConfig} onGlobalConfigChange={setGlobalConfig} selectedBlock={selectedBlock} onBlockUpdate={handleBlockUpdate} />
            </div>

            {/* Preview Area */}
            <div className="flex-1 relative">
              <ContentPreview contentBlocks={contentBlocks} currentTime={currentTime} globalConfig={globalConfig} onBlockSelect={handleBlockSelect} selectedBlockIds={selectedBlockIds} onBlockDelete={handleBlockDelete} />

              {/* Export Panel */}
              <ExportPanel isOpen={showExportPanel} onClose={() => setShowExportPanel(false)} contentBlocks={contentBlocks} globalConfig={globalConfig} selectedBlockId={selectedBlockIds[0] || null} />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={25} minSize={15} maxSize={50}>
          <Timeline contentBlocks={contentBlocks} currentTime={currentTime} totalDuration={totalDuration} onSeek={handleTimelineSeek} onBlockUpdate={handleBlockUpdate} selectedBlockId={selectedBlockIds[0] || null} onBlockSelect={blockId => handleBlockSelect(blockId)} onBlockDelete={handleBlockDelete} isPlaying={isPlaying} onPlay={handlePlay} onStop={handleStop} isLooping={isLooping} onLoopToggle={setIsLooping} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>;
};
export default Index;

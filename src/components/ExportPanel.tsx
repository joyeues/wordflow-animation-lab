
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Copy, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ContentBlock, AnimationConfig } from '@/pages/Index';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contentBlocks: ContentBlock[];
  globalConfig: AnimationConfig;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  isOpen,
  onClose,
  contentBlocks,
  globalConfig
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'component' | 'hooks' | 'config'>('component');
  const [animationOnly, setAnimationOnly] = useState(false);

  const generateAnimationData = () => {
    const animationBlocks = contentBlocks.map(block => ({
      id: block.id,
      type: block.type,
      startTime: block.startTime,
      duration: block.duration,
      animationConfig: block.animationConfig
    }));

    return {
      globalConfig,
      contentBlocks: animationBlocks,
      totalDuration: Math.max(...contentBlocks.map(b => b.startTime + b.duration), 0)
    };
  };

  const generateReactComponent = () => {
    if (animationOnly) {
      return `// Animation-only React Component
import React, { useState, useEffect } from 'react';

const AnimationController = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Animation configuration data
  const animationData = ${JSON.stringify(generateAnimationData(), null, 2)};

  useEffect(() => {
    let animationFrame: number;
    
    if (isPlaying) {
      const startTime = Date.now() - currentTime;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        setCurrentTime(elapsed);
        
        if (elapsed < animationData.totalDuration) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, animationData.totalDuration]);

  const getActiveBlocks = () => {
    return animationData.contentBlocks.filter(block => 
      currentTime >= block.startTime && 
      currentTime <= block.startTime + block.duration
    );
  };

  const getBlockProgress = (block: any) => {
    const adjustedTime = Math.max(0, currentTime - block.startTime);
    return Math.min(1, adjustedTime / block.duration);
  };

  return (
    <div className="animation-controller">
      <div className="controls mb-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <span className="ml-4">Time: {Math.round(currentTime)}ms</span>
      </div>
      
      <div className="active-animations">
        {getActiveBlocks().map((block) => (
          <div key={block.id} className="animation-block mb-2 p-2 border rounded">
            <div>Block ID: {block.id}</div>
            <div>Type: {block.type}</div>
            <div>Progress: {Math.round(getBlockProgress(block) * 100)}%</div>
            <div>Config: {JSON.stringify(block.animationConfig)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimationController;`;
    }

    return `import React, { useState, useEffect } from 'react';

// Animated text component
const AnimatedTextStudio = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const contentBlocks = ${JSON.stringify(contentBlocks, null, 2)};
  const globalConfig = ${JSON.stringify(globalConfig, null, 2)};

  useEffect(() => {
    let animationFrame: number;
    
    if (isPlaying) {
      const startTime = Date.now() - currentTime;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        setCurrentTime(elapsed);
        
        if (elapsed < 10000) { // 10 second duration
          animationFrame = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying]);

  const ParagraphBlock = ({ content, animationConfig, currentTime, isActive }) => {
    // Simplified paragraph animation logic
    const chars = content.split('').map((char, index) => {
      const charStartTime = index * animationConfig.charFadeDelay;
      const visible = isActive && currentTime >= charStartTime;
      
      return (
        <span
          key={index}
          className={\`inline-block transition-opacity duration-300 \${visible ? 'opacity-100' : 'opacity-0'}\`}
          style={{ transitionTimingFunction: animationConfig.curve }}
        >
          {char === ' ' ? ' ' : char}
        </span>
      );
    });

    return (
      <div className="bg-white rounded-xl p-6 max-w-2xl">
        <div className="text-gray-600 text-base leading-6">
          {chars}
        </div>
      </div>
    );
  };

  const BulletListBlock = ({ content, animationConfig, currentTime, isActive }) => {
    const headerVisible = isActive && currentTime >= 0;
    
    return (
      <div className="bg-white rounded-xl overflow-hidden max-w-2xl">
        <div className="px-6 pt-4 pb-2">
          <h3
            className={\`text-xl font-semibold text-gray-600 leading-8 transition-all duration-400 \${
              headerVisible ? 'opacity-100' : 'opacity-0 -translate-x-7'
            }\`}
          >
            {content.title}
          </h3>
        </div>
        <ul className="px-6 pb-4 space-y-2">
          {content.items.map((item, index) => {
            const itemStartTime = (animationConfig.maskFadeDelay || 200) + (index * (animationConfig.staggerDelay || 100));
            const itemVisible = isActive && currentTime >= itemStartTime;
            
            return (
              <li
                key={index}
                className={\`text-gray-600 leading-6 list-disc list-inside transition-all duration-400 \${
                  itemVisible ? 'opacity-100' : 'opacity-0 translate-y-10'
                }\`}
              >
                <span className="font-semibold">{item.bold} – </span>
                <span className="font-normal">{item.desc}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        {contentBlocks.map((block) => {
          const adjustedCurrentTime = Math.max(0, currentTime - block.startTime) / globalConfig.globalSpeed;
          const isActive = currentTime >= block.startTime && currentTime <= block.startTime + block.duration;

          return (
            <div key={block.id}>
              {block.type === 'paragraph' ? (
                <ParagraphBlock
                  content={block.content}
                  animationConfig={block.animationConfig}
                  currentTime={adjustedCurrentTime}
                  isActive={isActive}
                />
              ) : (
                <BulletListBlock
                  content={block.content}
                  animationConfig={block.animationConfig}
                  currentTime={adjustedCurrentTime}
                  isActive={isActive}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedTextStudio;`;
  };

  const generateHooks = () => {
    if (animationOnly) {
      return `// Animation-only Custom Hooks
import { useState, useEffect, useRef } from 'react';

// Animation configuration
const ANIMATION_CONFIG = ${JSON.stringify(generateAnimationData(), null, 2)};

// Custom hook for timeline animation control with precise timing
export const useAnimationTimeline = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - currentTime;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= ANIMATION_CONFIG.totalDuration) {
          setCurrentTime(ANIMATION_CONFIG.totalDuration);
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
  }, [isPlaying]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const stop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  const seek = (time: number) => setCurrentTime(Math.max(0, Math.min(ANIMATION_CONFIG.totalDuration, time)));

  return { currentTime, isPlaying, play, pause, stop, seek };
};

// Custom hook for character animation timing
export const useCharacterTiming = (blockId: string, currentTime: number) => {
  const block = ANIMATION_CONFIG.contentBlocks.find(b => b.id === blockId);
  if (!block) return { isActive: false, progress: 0, charDelay: 0 };

  const isActive = currentTime >= block.startTime && currentTime <= block.startTime + block.duration;
  const adjustedTime = Math.max(0, currentTime - block.startTime);
  const progress = Math.min(1, adjustedTime / block.duration);

  return {
    isActive,
    progress,
    charDelay: block.animationConfig.charFadeDelay,
    maskDelay: block.animationConfig.maskFadeDelay,
    maskDuration: block.animationConfig.maskFadeDuration,
    staggerDelay: block.animationConfig.staggerDelay || 0,
    curve: block.animationConfig.curve
  };
};

// Custom hook for staggered animation timing
export const useStaggerTiming = (blockId: string, itemCount: number, currentTime: number) => {
  const timing = useCharacterTiming(blockId, currentTime);
  
  const getItemVisibility = (index: number) => {
    if (!timing.isActive) return false;
    const itemStartTime = timing.maskDelay + (index * timing.staggerDelay);
    const adjustedTime = (currentTime - ANIMATION_CONFIG.contentBlocks.find(b => b.id === blockId)?.startTime!) || 0;
    return adjustedTime >= itemStartTime;
  };

  return { ...timing, getItemVisibility };
};`;
    }

    return `import { useState, useEffect, useRef } from 'react';

// Custom hook for character-by-character text animation
export const useCharacterAnimation = (text: string, config: any, currentTime: number, isActive: boolean) => {
  const [chars, setChars] = useState<Array<{ char: string; visible: boolean }>>([]);

  useEffect(() => {
    if (!isActive) {
      setChars(text.split('').map(char => ({ char, visible: false })));
      return;
    }

    const updatedChars = text.split('').map((char, index) => {
      const charStartTime = index * config.charFadeDelay;
      return {
        char,
        visible: currentTime >= charStartTime
      };
    });

    setChars(updatedChars);
  }, [text, currentTime, isActive, config.charFadeDelay]);

  return chars;
};

// Custom hook for staggered list animation
export const useStaggeredAnimation = (items: any[], config: any, currentTime: number, isActive: boolean) => {
  const [visibleItems, setVisibleItems] = useState<boolean[]>([]);

  useEffect(() => {
    if (!isActive) {
      setVisibleItems(items.map(() => false));
      return;
    }

    const newVisibleItems = items.map((_, index) => {
      const itemStartTime = (config.maskFadeDelay || 200) + (index * (config.staggerDelay || 100));
      return currentTime >= itemStartTime;
    });

    setVisibleItems(newVisibleItems);
  }, [items.length, currentTime, isActive, config]);

  return visibleItems;
};

// Custom hook for timeline animation control
export const useTimelineAnimation = (duration: number = 10000) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - currentTime;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
          setCurrentTime(duration);
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
  }, [isPlaying, duration]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const stop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  const seek = (time: number) => setCurrentTime(Math.max(0, Math.min(duration, time)));

  return {
    currentTime,
    isPlaying,
    play,
    pause,
    stop,
    seek
  };
};`;
  };

  const generateConfig = () => {
    if (animationOnly) {
      return `// Pure Animation Configuration & Timing Data
export const ANIMATION_CONFIG = ${JSON.stringify(generateAnimationData(), null, 2)};

// Animation timing utilities
export const AnimationUtils = {
  // Calculate character reveal timing
  getCharacterRevealTime: (charIndex: number, config: any) => {
    return charIndex * config.charFadeDelay;
  },

  // Calculate stagger timing for list items
  getStaggerTime: (itemIndex: number, config: any) => {
    return config.maskFadeDelay + (itemIndex * (config.staggerDelay || 100));
  },

  // Check if animation block is active at given time
  isBlockActive: (blockId: string, currentTime: number) => {
    const block = ANIMATION_CONFIG.contentBlocks.find(b => b.id === blockId);
    if (!block) return false;
    return currentTime >= block.startTime && currentTime <= block.startTime + block.duration;
  },

  // Get animation progress for a block (0-1)
  getBlockProgress: (blockId: string, currentTime: number) => {
    const block = ANIMATION_CONFIG.contentBlocks.find(b => b.id === blockId);
    if (!block) return 0;
    const adjustedTime = Math.max(0, currentTime - block.startTime);
    return Math.min(1, adjustedTime / block.duration);
  }
};

// CSS timing functions referenced in animations
export const TIMING_FUNCTIONS = {
  easeOut: 'cubic-bezier(0.45,0,0.58,1)',
  ease: 'cubic-bezier(0.25,0.46,0.45,0.94)',
  easeIn: 'cubic-bezier(0.55,0.05,0.68,0.19)',
  backOut: 'cubic-bezier(0.68,-0.55,0.265,1.55)',
  easeOutExpo: 'cubic-bezier(0.00,0.00,0.00,1.00)',
  linear: 'linear'
};

// Animation-specific CSS classes
export const ANIMATION_STYLES = \`
.char-fade {
  opacity: 0;
  display: inline-block;
  transition-property: opacity;
  transition-duration: 320ms;
  transition-timing-function: var(--curve, cubic-bezier(0.45,0,0.58,1));
}

.char-fade.visible {
  opacity: 1;
}

.stagger-item {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 100ms linear, transform 400ms var(--curve, cubic-bezier(0.00,0.00,0.00,1.00));
}

.stagger-item.visible {
  opacity: 1;
  transform: translateY(0);
}

.mask-reveal {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 100ms linear, transform 400ms var(--curve, cubic-bezier(0.00,0.00,0.00,1.00));
}

.mask-reveal.visible {
  opacity: 1;
  transform: translateX(0);
}
\`;`;
    }

    return `// Animation configuration
export const animationConfig = ${JSON.stringify({ contentBlocks, globalConfig }, null, 2)};

// CSS classes for animations
export const animationStyles = \`
.fade-char {
  opacity: 0;
  display: inline-block;
  transition: opacity 0.32s cubic-bezier(.45,0,.58,1);
}

.fade-char.visible {
  opacity: 1;
}

.slide-in {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.1s linear, transform 0.4s cubic-bezier(0.00, 0.00, 0.00, 1.00);
}

.slide-in.visible {
  opacity: 1;
  transform: translateY(0);
}

.slide-header {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 0.1s linear, transform 0.4s cubic-bezier(0.00, 0.00, 0.00, 1.00);
}

.slide-header.visible {
  opacity: 1;
  transform: translateX(0);
}
\`;

// Timing utilities
export const timingFunctions = {
  easeOut: 'cubic-bezier(0.45,0,0.58,1)',
  ease: 'cubic-bezier(0.25,0.46,0.45,0.94)',
  easeIn: 'cubic-bezier(0.55,0.05,0.68,0.19)',
  backOut: 'cubic-bezier(0.68,-0.55,0.265,1.55)',
  easeOutExpo: 'cubic-bezier(0.00,0.00,0.00,1.00)',
  linear: 'linear'
};`;
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard."
    });
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File downloaded",
      description: `${filename} has been downloaded.`
    });
  };

  const getContent = () => {
    switch (selectedFormat) {
      case 'component':
        return generateReactComponent();
      case 'hooks':
        return generateHooks();
      case 'config':
        return generateConfig();
      default:
        return '';
    }
  };

  const getFilename = () => {
    const prefix = animationOnly ? 'animation-' : '';
    switch (selectedFormat) {
      case 'component':
        return `${prefix}component.tsx`;
      case 'hooks':
        return `${prefix}hooks.ts`;
      case 'config':
        return `${prefix}config.ts`;
      default:
        return 'export.txt';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white border-l shadow-lg z-10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Export to React</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Animation Only Toggle */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Switch
            id="animation-only"
            checked={animationOnly}
            onCheckedChange={setAnimationOnly}
          />
          <Label htmlFor="animation-only" className="text-sm font-medium">
            Animation data only
          </Label>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Export only the timing and animation configuration without UI components
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as any)} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="component">
              {animationOnly ? 'Animation Controller' : 'Full Component'}
            </TabsTrigger>
            <TabsTrigger value="hooks">
              {animationOnly ? 'Timing Hooks' : 'Custom Hooks'}
            </TabsTrigger>
            <TabsTrigger value="config">
              {animationOnly ? 'Pure Config' : 'Config & CSS'}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 p-4 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>
                    {selectedFormat === 'component' && (animationOnly ? 'Animation Controller' : 'React Component')}
                    {selectedFormat === 'hooks' && (animationOnly ? 'Animation Timing Hooks' : 'Custom Hooks')}
                    {selectedFormat === 'config' && (animationOnly ? 'Animation Configuration' : 'Configuration & Styles')}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(getContent())}
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(getContent(), getFilename())}
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <Textarea
                  value={getContent()}
                  readOnly
                  className="h-full resize-none border-0 font-mono text-sm"
                  style={{ minHeight: '400px' }}
                />
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

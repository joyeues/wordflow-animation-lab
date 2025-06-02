import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Copy, Download, Github } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ContentBlock, AnimationConfig } from '@/pages/Index';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contentBlocks: ContentBlock[];
  globalConfig: AnimationConfig;
  selectedBlockId?: string | null;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  isOpen,
  onClose,
  contentBlocks,
  globalConfig,
  selectedBlockId
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'react' | 'vue' | 'angular' | 'svelte' | 'vanilla' | 'framer' | 'gsap' | 'github'>('react');
  const [animationOnly, setAnimationOnly] = useState(false);

  // Filter content blocks based on selection
  const getFilteredContentBlocks = () => {
    if (selectedBlockId) {
      const selectedBlock = contentBlocks.find(block => block.id === selectedBlockId);
      return selectedBlock ? [selectedBlock] : [];
    }
    return contentBlocks;
  };

  const generateAnimationData = () => {
    const filteredBlocks = getFilteredContentBlocks();
    const animationBlocks = filteredBlocks.map(block => ({
      id: block.id,
      type: block.type,
      startTime: block.startTime,
      duration: block.duration,
      animationConfig: block.animationConfig
    }));

    return {
      globalConfig,
      contentBlocks: animationBlocks,
      totalDuration: Math.max(...filteredBlocks.map(b => b.startTime + b.duration), 0)
    };
  };

  const generateReactComponent = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `import React, { useState, useEffect } from 'react';

const animationData = ${JSON.stringify(generateAnimationData(), null, 2)};

export const useAnimationTimeline = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
  }, [isPlaying]);

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

  return { currentTime, isPlaying, setIsPlaying, getActiveBlocks, getBlockProgress };
};`;
    }

    return `import React, { useState, useEffect } from 'react';

const contentBlocks = ${JSON.stringify(filteredBlocks, null, 2)};
const globalConfig = ${JSON.stringify(globalConfig, null, 2)};

const AnimatedText = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    
    if (isPlaying) {
      const startTime = Date.now() - currentTime;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        setCurrentTime(elapsed);
        
        if (elapsed < ${Math.max(...filteredBlocks.map(b => b.startTime + b.duration), 10000)}) {
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

export default AnimatedText;`;
  };

  const generateVueComponent = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'

const currentTime = ref(0)
const isPlaying = ref(false)
let animationFrame: number | null = null

const animationData = ${JSON.stringify(generateAnimationData(), null, 2)}

const getActiveBlocks = () => {
  return animationData.contentBlocks.filter(block => 
    currentTime.value >= block.startTime && 
    currentTime.value <= block.startTime + block.duration
  )
}

const getBlockProgress = (block: any) => {
  const adjustedTime = Math.max(0, currentTime.value - block.startTime)
  return Math.min(1, adjustedTime / block.duration)
}

watch(isPlaying, (playing) => {
  if (playing) {
    const startTime = Date.now() - currentTime.value
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      currentTime.value = elapsed
      
      if (elapsed < animationData.totalDuration) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        isPlaying.value = false
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
  } else {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
  }
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>`;
    }

    return `<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-2xl mx-auto space-y-8">
      <div v-for="block in contentBlocks" :key="block.id">
        <!-- Block rendering logic -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'

const isPlaying = ref(false)
const currentTime = ref(0)
let animationFrame: number | null = null

const contentBlocks = ${JSON.stringify(filteredBlocks, null, 2)}
const globalConfig = ${JSON.stringify(globalConfig, null, 2)}

// Animation logic here
</script>`;
  };

  const generateAngularComponent = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `import { Component, OnInit, OnDestroy } from '@angular/core';

interface AnimationBlock {
  id: string;
  type: string;
  startTime: number;
  duration: number;
  animationConfig: any;
}

@Component({
  selector: 'app-animation-controller',
  template: \`
    <div class="animation-blocks">
      <div 
        *ngFor="let block of getActiveBlocks()" 
        class="animation-block"
      >
        Block: {{ block.id }} - Progress: {{ Math.round(getBlockProgress(block) * 100) }}%
      </div>
    </div>
  \`
})
export class AnimationControllerComponent implements OnInit, OnDestroy {
  currentTime = 0;
  isPlaying = false;
  private animationFrame?: number;

  private animationData = ${JSON.stringify(generateAnimationData(), null, 2)};

  getActiveBlocks(): AnimationBlock[] {
    return this.animationData.contentBlocks.filter(block => 
      this.currentTime >= block.startTime && 
      this.currentTime <= block.startTime + block.duration
    );
  }

  getBlockProgress(block: AnimationBlock): number {
    const adjustedTime = Math.max(0, this.currentTime - block.startTime);
    return Math.min(1, adjustedTime / block.duration);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}`;
    }

    return `import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-animated-text',
  template: \`
    <div class="min-h-screen bg-gray-50 p-8">
      <div class="max-w-2xl mx-auto space-y-8">
        <div *ngFor="let block of contentBlocks">
          <!-- Block rendering logic -->
        </div>
      </div>
    </div>
  \`
})
export class AnimatedTextComponent implements OnInit, OnDestroy {
  contentBlocks = ${JSON.stringify(filteredBlocks, null, 2)};
  globalConfig = ${JSON.stringify(globalConfig, null, 2)};

  ngOnInit(): void {}
  ngOnDestroy(): void {}
}`;
  };

  const generateSvelteComponent = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `<script lang="ts">
  import { onDestroy } from 'svelte';
  
  let currentTime = 0;
  let isPlaying = false;
  let animationFrame: number;

  const animationData = ${JSON.stringify(generateAnimationData(), null, 2)};

  function getActiveBlocks() {
    return animationData.contentBlocks.filter(block => 
      currentTime >= block.startTime && 
      currentTime <= block.startTime + block.duration
    );
  }

  function getBlockProgress(block: any) {
    const adjustedTime = Math.max(0, currentTime - block.startTime);
    return Math.min(1, adjustedTime / block.duration);
  }

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

<div class="animation-blocks">
  {#each getActiveBlocks() as block (block.id)}
    <div class="animation-block">
      Block: {block.id} - Progress: {Math.round(getBlockProgress(block) * 100)}%
    </div>
  {/each}
</div>`;
    }

    return `<script lang="ts">
  const contentBlocks = ${JSON.stringify(filteredBlocks, null, 2)};
  const globalConfig = ${JSON.stringify(globalConfig, null, 2)};
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-2xl mx-auto space-y-8">
    {#each contentBlocks as block (block.id)}
      <!-- Block rendering logic -->
    {/each}
  </div>
</div>`;
  };

  const generateVanillaJS = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `class AnimationController {
  constructor() {
    this.currentTime = 0;
    this.isPlaying = false;
    this.animationFrame = null;
    
    this.animationData = ${JSON.stringify(generateAnimationData(), null, 2)};
  }

  getActiveBlocks() {
    return this.animationData.contentBlocks.filter(block => 
      this.currentTime >= block.startTime && 
      this.currentTime <= block.startTime + block.duration
    );
  }

  getBlockProgress(block) {
    const adjustedTime = Math.max(0, this.currentTime - block.startTime);
    return Math.min(1, adjustedTime / block.duration);
  }

  startAnimation() {
    const startTime = Date.now() - this.currentTime;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      this.currentTime = elapsed;
      
      if (elapsed < this.animationData.totalDuration) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.isPlaying = false;
      }
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}`;
    }

    return `class AnimatedTextStudio {
  constructor(container) {
    this.container = container;
    this.contentBlocks = ${JSON.stringify(filteredBlocks, null, 2)};
    this.globalConfig = ${JSON.stringify(globalConfig, null, 2)};
    this.currentTime = 0;
    this.isPlaying = false;
    
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    // Render logic based on contentBlocks and globalConfig
  }
}`;
  };

  const generateFramerMotion = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `import { motion, useAnimation } from 'framer-motion';
import { useState } from 'react';

const animationData = ${JSON.stringify(generateAnimationData(), null, 2)};

export const useAnimationTimeline = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const controls = useAnimation();

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const charVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.004,
        duration: 0.32,
        ease: [0.45, 0, 0.58, 1]
      }
    })
  };

  const staggerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + (i * 0.1),
        duration: 0.4,
        ease: [0, 0, 0, 1]
      }
    })
  };

  return {
    currentTime,
    isPlaying,
    setIsPlaying,
    controls,
    variants,
    charVariants,
    staggerVariants,
    animationData
  };
};`;
    }

    return `import { motion } from 'framer-motion';

const contentBlocks = ${JSON.stringify(filteredBlocks, null, 2)};
const globalConfig = ${JSON.stringify(globalConfig, null, 2)};

export const AnimatedText = () => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {contentBlocks.map((block, index) => (
          <motion.div
            key={block.id}
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.2 }}
          >
            {/* Block content */}
          </motion.div>
        ))}
      </div>
    </div>
  );
};`;
  };

  const generateGSAP = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `import { gsap } from 'gsap';

class GSAPAnimationController {
  constructor() {
    this.timeline = gsap.timeline({ paused: true });
    this.animationData = ${JSON.stringify(generateAnimationData(), null, 2)};
    
    this.setupTimeline();
  }

  setupTimeline() {
    this.animationData.contentBlocks.forEach(block => {
      const startTime = block.startTime / 1000;
      
      if (block.type === 'paragraph') {
        const chars = block.content.split('').map((char, i) => {
          const element = document.createElement('span');
          element.textContent = char === ' ' ? ' ' : char;
          element.style.opacity = '0';
          return element;
        });
        
        this.timeline.to(chars, {
          opacity: 1,
          duration: 0.32,
          stagger: block.animationConfig.charFadeDelay / 1000,
          ease: "power2.out"
        }, startTime);
        
      } else if (block.type === 'bulletList') {
        const items = block.content.items.map((item, i) => {
          const element = document.createElement('div');
          element.innerHTML = \`<strong>\${item.bold}</strong> – \${item.desc}\`;
          element.style.opacity = '0';
          element.style.transform = 'translateY(40px)';
          return element;
        });
        
        this.timeline.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: block.animationConfig.staggerDelay / 1000,
          ease: "expo.out"
        }, startTime + (block.animationConfig.maskFadeDelay / 1000));
      }
    });
  }

  play() {
    this.timeline.play();
  }

  pause() {
    this.timeline.pause();
  }

  restart() {
    this.timeline.restart();
  }
}`;
    }

    return `import { gsap } from 'gsap';

const contentBlocks = ${JSON.stringify(filteredBlocks, null, 2)};
const globalConfig = ${JSON.stringify(globalConfig, null, 2)};

class AnimatedTextGSAP {
  constructor(container) {
    this.container = container;
    this.timeline = gsap.timeline();
    
    this.setupAnimation();
  }

  setupAnimation() {
    // GSAP animation setup based on contentBlocks
  }
}`;
  };

  const generateGitHubFiles = () => {
    const filteredBlocks = getFilteredContentBlocks();
    const blockText = selectedBlockId ? ` (Single Block: ${filteredBlocks[0]?.type || 'Unknown'})` : '';
    
    const readmeContent = `# Animated Text Studio Export${blockText}

Animation timing data and components exported from Animated Text Studio.

## Animation Data

${filteredBlocks.map(block => `
### Block ${block.id} (${block.type})
- Start Time: ${block.startTime}ms
- Duration: ${block.duration}ms
- Character Fade Delay: ${block.animationConfig.charFadeDelay}ms
- Mask Fade Delay: ${block.animationConfig.maskFadeDelay}ms
- Curve: ${block.animationConfig.curve}
${block.animationConfig.staggerDelay ? `- Stagger Delay: ${block.animationConfig.staggerDelay}ms` : ''}
`).join('')}

## Global Configuration

- Global Speed: ${globalConfig.globalSpeed}x
- Default Curve: ${globalConfig.curve}
- Default Character Fade Delay: ${globalConfig.charFadeDelay}ms
- Default Mask Fade Delay: ${globalConfig.maskFadeDelay}ms

## Files

- \`animation-data.json\` - Raw animation timing data
- \`react-component.tsx\` - React implementation
- \`package.json\` - Dependencies

## Usage

\`\`\`javascript
import animationData from './animation-data.json';
// Use with your preferred animation library
\`\`\`
`;

    const packageJson = `{
  "name": "animated-text-studio-export${selectedBlockId ? '-single-block' : ''}",
  "version": "1.0.0",
  "description": "Animation timing data exported from Animated Text Studio${blockText}",
  "main": "index.js",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "keywords": ["animation", "text", "timing", "react"],
  "author": "Animated Text Studio",
  "license": "MIT"
}`;

    return `# GitHub Repository Files${blockText}

## README.md
\`\`\`markdown
${readmeContent}
\`\`\`

## package.json
\`\`\`json
${packageJson}
\`\`\`

## animation-data.json
\`\`\`json
${JSON.stringify(generateAnimationData(), null, 2)}
\`\`\``;
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

  const handleGitHubExport = () => {
    const repoContent = generateGitHubFiles();
    const timestamp = new Date().toISOString().split('T')[0];
    const suffix = selectedBlockId ? `-block-${selectedBlockId}` : '';
    handleDownload(repoContent, `github-repository${suffix}-${timestamp}.md`);
  };

  const getContent = () => {
    switch (selectedFormat) {
      case 'react':
        return generateReactComponent();
      case 'vue':
        return generateVueComponent();
      case 'angular':
        return generateAngularComponent();
      case 'svelte':
        return generateSvelteComponent();
      case 'vanilla':
        return generateVanillaJS();
      case 'framer':
        return generateFramerMotion();
      case 'gsap':
        return generateGSAP();
      case 'github':
        return generateGitHubFiles();
      default:
        return '';
    }
  };

  const getFilename = () => {
    const prefix = animationOnly ? 'animation-' : '';
    const suffix = selectedBlockId ? `-block-${selectedBlockId}` : '';
    switch (selectedFormat) {
      case 'react':
        return `${prefix}component${suffix}.tsx`;
      case 'vue':
        return `${prefix}component${suffix}.vue`;
      case 'angular':
        return `${prefix}component${suffix}.ts`;
      case 'svelte':
        return `${prefix}component${suffix}.svelte`;
      case 'vanilla':
        return `${prefix}script${suffix}.js`;
      case 'framer':
        return `${prefix}framer-motion${suffix}.tsx`;
      case 'gsap':
        return `${prefix}gsap${suffix}.js`;
      case 'github':
        return `repository-files${suffix}.md`;
      default:
        return 'export.txt';
    }
  };

  if (!isOpen) return null;

  const filteredBlocks = getFilteredContentBlocks();
  const exportDescription = selectedBlockId 
    ? `Exporting single block: ${filteredBlocks[0]?.type || 'Unknown'} (ID: ${selectedBlockId})`
    : `Exporting all blocks (${contentBlocks.length} total)`;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white border-l shadow-lg z-10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Export Animation</h2>
          <p className="text-sm text-gray-600">{exportDescription}</p>
        </div>
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
          <TabsList className="mx-4 mt-4 grid grid-cols-4 gap-1">
            <TabsTrigger value="react" className="text-xs">React</TabsTrigger>
            <TabsTrigger value="vue" className="text-xs">Vue</TabsTrigger>
            <TabsTrigger value="angular" className="text-xs">Angular</TabsTrigger>
            <TabsTrigger value="svelte" className="text-xs">Svelte</TabsTrigger>
          </TabsList>
          
          <TabsList className="mx-4 mt-2 grid grid-cols-4 gap-1">
            <TabsTrigger value="vanilla" className="text-xs">Vanilla JS</TabsTrigger>
            <TabsTrigger value="framer" className="text-xs">Framer</TabsTrigger>
            <TabsTrigger value="gsap" className="text-xs">GSAP</TabsTrigger>
            <TabsTrigger value="github" className="text-xs">
              <Github className="w-3 h-3 mr-1" />
              GitHub
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 p-4 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>
                    {selectedFormat === 'react' && (animationOnly ? 'React Animation Controller' : 'React Component')}
                    {selectedFormat === 'vue' && (animationOnly ? 'Vue Animation Controller' : 'Vue Component')}
                    {selectedFormat === 'angular' && (animationOnly ? 'Angular Animation Controller' : 'Angular Component')}
                    {selectedFormat === 'svelte' && (animationOnly ? 'Svelte Animation Controller' : 'Svelte Component')}
                    {selectedFormat === 'vanilla' && (animationOnly ? 'Vanilla JS Animation Controller' : 'Vanilla JS Component')}
                    {selectedFormat === 'framer' && (animationOnly ? 'Framer Motion Configuration' : 'Framer Motion Component')}
                    {selectedFormat === 'gsap' && (animationOnly ? 'GSAP Animation Controller' : 'GSAP Component')}
                    {selectedFormat === 'github' && 'GitHub Repository Files'}
                    {selectedBlockId && ` (Single Block)`}
                  </span>
                  <div className="flex gap-2">
                    {selectedFormat === 'github' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGitHubExport}
                      >
                        <Download className="w-3 h-3 mr-2" />
                        Export
                      </Button>
                    ) : (
                      <>
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
                      </>
                    )}
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

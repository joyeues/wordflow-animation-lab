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
      return `// Animation-only React Component${selectedBlockId ? ' (Single Block)' : ''}
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

// Animated text component${selectedBlockId ? ' (Single Block)' : ''}
const AnimatedTextStudio = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const contentBlocks = ${JSON.stringify(filteredBlocks, null, 2)};
  const globalConfig = ${JSON.stringify(globalConfig, null, 2)};

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

  const generateVueComponent = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `<!-- Vue 3 Animation Controller${selectedBlockId ? ' (Single Block)' : ''} -->
<template>
  <div class="animation-controller">
    <div class="controls mb-4">
      <button
        @click="togglePlay"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      <span class="ml-4">Time: {{ Math.round(currentTime) }}ms</span>
    </div>
    
    <div class="active-animations">
      <div 
        v-for="block in getActiveBlocks()" 
        :key="block.id" 
        class="animation-block mb-2 p-2 border rounded"
      >
        <div>Block ID: {{ block.id }}</div>
        <div>Type: {{ block.type }}</div>
        <div>Progress: {{ Math.round(getBlockProgress(block) * 100) }}%</div>
        <div>Config: {{ JSON.stringify(block.animationConfig) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'

const currentTime = ref(0)
const isPlaying = ref(false)
let animationFrame: number | null = null

// Animation configuration data
const animationData = ${JSON.stringify(generateAnimationData(), null, 2)}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

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

    return `<!-- Vue 3 Animated Text Component${selectedBlockId ? ' (Single Block)' : ''} -->
<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-2xl mx-auto space-y-8">
      <button
        @click="togglePlay"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      
      <div v-for="block in contentBlocks" :key="block.id">
        <ParagraphBlock
          v-if="block.type === 'paragraph'"
          :content="block.content"
          :animationConfig="block.animationConfig"
          :currentTime="getAdjustedTime(block)"
          :isActive="isBlockActive(block)"
        />
        <BulletListBlock
          v-else
          :content="block.content"
          :animationConfig="block.animationConfig"
          :currentTime="getAdjustedTime(block)"
          :isActive="isBlockActive(block)"
        />
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

// Component logic here...
</script>`;
  };

  const generateAngularComponent = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `// Angular Animation Controller${selectedBlockId ? ' (Single Block)' : ''}
import { Component, OnInit, OnDestroy } from '@angular/core';

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
    <div class="animation-controller">
      <div class="controls mb-4">
        <button
          (click)="togglePlay()"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {{ isPlaying ? 'Pause' : 'Play' }}
        </button>
        <span class="ml-4">Time: {{ Math.round(currentTime) }}ms</span>
      </div>
      
      <div class="active-animations">
        <div 
          *ngFor="let block of getActiveBlocks()" 
          class="animation-block mb-2 p-2 border rounded"
        >
          <div>Block ID: {{ block.id }}</div>
          <div>Type: {{ block.type }}</div>
          <div>Progress: {{ Math.round(getBlockProgress(block) * 100) }}%</div>
        </div>
      </div>
    </div>
  \`
})
export class AnimationControllerComponent implements OnInit, OnDestroy {
  currentTime = 0;
  isPlaying = false;
  private animationFrame?: number;

  // Animation configuration data
  private animationData = ${JSON.stringify(generateAnimationData(), null, 2)};

  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }

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

  private startAnimation(): void {
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

  private stopAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.stopAnimation();
  }
}`;
    }

    return `// Angular Animated Text Component${selectedBlockId ? ' (Single Block)' : ''}
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-animated-text',
  template: \`
    <div class="min-h-screen bg-gray-50 p-8">
      <div class="max-w-2xl mx-auto space-y-8">
        <button
          (click)="togglePlay()"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {{ isPlaying ? 'Pause' : 'Play' }}
        </button>
        
        <div *ngFor="let block of contentBlocks">
          <!-- Block rendering logic -->
        </div>
      </div>
    </div>
  \`
})
export class AnimatedTextComponent implements OnInit, OnDestroy {
  // Component implementation with filtered blocks: ${JSON.stringify(filteredBlocks.map(b => b.id), null, 2)}
}`;
  };

  const generateSvelteComponent = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `<!-- Svelte Animation Controller${selectedBlockId ? ' (Single Block)' : ''} -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  let currentTime = 0;
  let isPlaying = false;
  let animationFrame: number;

  // Animation configuration data
  const animationData = ${JSON.stringify(generateAnimationData(), null, 2)};

  function togglePlay() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }

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

  function startAnimation() {
    const startTime = Date.now() - currentTime;
    
    function animate() {
      const elapsed = Date.now() - startTime;
      currentTime = elapsed;
      
      if (elapsed < animationData.totalDuration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        isPlaying = false;
      }
    }
    
    animationFrame = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  }

  onDestroy(() => {
    stopAnimation();
  });
</script>

<div class="animation-controller">
  <div class="controls mb-4">
    <button
      on:click={togglePlay}
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {isPlaying ? 'Pause' : 'Play'}
    </button>
    <span class="ml-4">Time: {Math.round(currentTime)}ms</span>
  </div>
  
  <div class="active-animations">
    {#each getActiveBlocks() as block (block.id)}
      <div class="animation-block mb-2 p-2 border rounded">
        <div>Block ID: {block.id}</div>
        <div>Type: {block.type}</div>
        <div>Progress: {Math.round(getBlockProgress(block) * 100)}%</div>
      </div>
    {/each}
  </div>
</div>`;
    }

    return `<!-- Svelte Animated Text Component${selectedBlockId ? ' (Single Block)' : ''} -->
<script lang="ts">
  // Full Svelte component implementation with filtered blocks: ${JSON.stringify(filteredBlocks.map(b => b.id), null, 2)}
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <!-- Component template -->
</div>`;
  };

  const generateVanillaJS = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `// Vanilla JavaScript Animation Controller${selectedBlockId ? ' (Single Block)' : ''}
class AnimationController {
  constructor(container) {
    this.container = container;
    this.currentTime = 0;
    this.isPlaying = false;
    this.animationFrame = null;
    
    // Animation configuration data
    this.animationData = ${JSON.stringify(generateAnimationData(), null, 2)};
    
    this.init();
  }

  init() {
    this.container.innerHTML = \`
      <div class="animation-controller">
        <div class="controls">
          <button id="playBtn">Play</button>
          <button id="pauseBtn">Pause</button>
          <button id="restartBtn">Restart</button>
          <div id="progress">Progress: 0%</div>
        </div>
        <div id="content"></div>
      </div>
    \`;

    this.playBtn = this.container.querySelector('#playBtn');
    this.pauseBtn = this.container.querySelector('#pauseBtn');
    this.restartBtn = this.container.querySelector('#restartBtn');
    this.progress = this.container.querySelector('#progress');
    this.content = this.container.querySelector('#content');

    this.playBtn.addEventListener('click', () => this.play());
    this.pauseBtn.addEventListener('click', () => this.pause());
    this.restartBtn.addEventListener('click', () => this.restart());
  }

  setupTimeline() {
    // Create timeline based on animation data
    this.animationData.contentBlocks.forEach(block => {
      const startTime = block.startTime / 1000; // Convert to seconds
      
      if (block.type === 'paragraph') {
        // Character-by-character animation
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
        // Staggered list animation
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

    // Update progress
    this.timeline.eventCallback("onUpdate", () => {
      const progress = (this.timeline.progress() * 100).toFixed(1);
      this.progress.textContent = \`Progress: \${progress}%\`;
    });
  }

  play() {
    this.timeline.play();
    this.isPlaying = true;
  }

  pause() {
    this.timeline.pause();
    this.isPlaying = false;
  }

  restart() {
    this.timeline.restart();
    this.isPlaying = true;
  }
}

// Usage
// const controller = new AnimationController(document.getElementById('app'));`;
    }

    return `// Vanilla JavaScript Animated Text${selectedBlockId ? ' (Single Block)' : ''}
class AnimatedTextStudio {
  constructor(container) {
    this.container = container;
    this.contentBlocks = ${JSON.stringify(filteredBlocks, null, 2)};
    // Implementation here
  }
}`;
  };

  const generateFramerMotion = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `// Framer Motion Animation Configuration${selectedBlockId ? ' (Single Block)' : ''}
import { motion, useAnimation, AnimationControls } from 'framer-motion';
import { useState, useEffect } from 'react';

const animationData = ${JSON.stringify(generateAnimationData(), null, 2)};

export const useAnimationTimeline = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const controls = useAnimation();

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const charVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.004, // Based on charFadeDelay
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
        delay: 0.2 + (i * 0.1), // maskFadeDelay + staggerDelay
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
};

// Example Framer Motion Component
export const FramerAnimationController = () => {
  const { 
    currentTime, 
    isPlaying, 
    setIsPlaying, 
    variants, 
    charVariants,
    animationData 
  } = useAnimationTimeline();

  return (
    <div className="animation-controller">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsPlaying(!isPlaying)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </motion.button>

      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        className="active-animations"
      >
        {animationData.contentBlocks.map((block, index) => (
          <motion.div
            key={block.id}
            variants={variants}
            custom={index}
            className="animation-block"
          >
            Block: {block.id}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};`;
    }

    return `// Framer Motion Complete Component${selectedBlockId ? ' (Single Block)' : ''}
import { motion } from 'framer-motion';
// Full implementation with Framer Motion animations for blocks: ${JSON.stringify(filteredBlocks.map(b => b.id), null, 2)}`;
  };

  const generateGSAP = () => {
    const filteredBlocks = getFilteredContentBlocks();
    
    if (animationOnly) {
      return `// GSAP Animation Controller${selectedBlockId ? ' (Single Block)' : ''}
import { gsap } from 'gsap';

class GSAPAnimationController {
  constructor(container) {
    this.container = container;
    this.timeline = gsap.timeline({ paused: true });
    this.currentTime = 0;
    this.isPlaying = false;
    
    // Animation configuration data
    this.animationData = ${JSON.stringify(generateAnimationData(), null, 2)};
    
    this.init();
    this.setupTimeline();
  }

  init() {
    this.container.innerHTML = \`
      <div class="animation-controller">
        <div class="controls">
          <button id="playBtn">Play</button>
          <button id="pauseBtn">Pause</button>
          <button id="restartBtn">Restart</button>
          <div id="progress">Progress: 0%</div>
        </div>
        <div id="content"></div>
      </div>
    \`;

    this.playBtn = this.container.querySelector('#playBtn');
    this.pauseBtn = this.container.querySelector('#pauseBtn');
    this.restartBtn = this.container.querySelector('#restartBtn');
    this.progress = this.container.querySelector('#progress');
    this.content = this.container.querySelector('#content');

    this.playBtn.addEventListener('click', () => this.play());
    this.pauseBtn.addEventListener('click', () => this.pause());
    this.restartBtn.addEventListener('click', () => this.restart());
  }

  setupTimeline() {
    // Create timeline based on animation data
    this.animationData.contentBlocks.forEach(block => {
      const startTime = block.startTime / 1000; // Convert to seconds
      
      if (block.type === 'paragraph') {
        // Character-by-character animation
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
        // Staggered list animation
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

    // Update progress
    this.timeline.eventCallback("onUpdate", () => {
      const progress = (this.timeline.progress() * 100).toFixed(1);
      this.progress.textContent = \`Progress: \${progress}%\`;
    });
  }

  play() {
    this.timeline.play();
    this.isPlaying = true;
  }

  pause() {
    this.timeline.pause();
    this.isPlaying = false;
  }

  restart() {
    this.timeline.restart();
    this.isPlaying = true;
  }
}

// Usage
// const controller = new GSAPAnimationController(document.getElementById('app'));`;
    }

    return `// GSAP Complete Animation Setup${selectedBlockId ? ' (Single Block)' : ''}
import { gsap } from 'gsap';
// Full GSAP implementation for blocks: ${JSON.stringify(filteredBlocks.map(b => b.id), null, 2)}`;
  };

  const generateGitHubFiles = () => {
    const filteredBlocks = getFilteredContentBlocks();
    const blockText = selectedBlockId ? ` (Single Block: ${filteredBlocks[0]?.type || 'Unknown'} (ID: ${selectedBlockId}))` : '';
    
    const readmeContent = `# Animated Text Studio Export${blockText}

This project contains animation timing data and components exported from Animated Text Studio.

## Animation Data

The following animation blocks were exported:

${filteredBlocks.map(block => `
### Block ${block.id} (${block.type})
- **Start Time:** ${block.startTime}ms
- **Duration:** ${block.duration}ms
- **Animation Config:**
  - Character Fade Delay: ${block.animationConfig.charFadeDelay}ms
  - Mask Fade Delay: ${block.animationConfig.maskFadeDelay}ms
  - Curve: ${block.animationConfig.curve}
  ${block.animationConfig.staggerDelay ? `- Stagger Delay: ${block.animationConfig.staggerDelay}ms` : ''}
`).join('')}

## Global Configuration

- **Global Speed:** ${globalConfig.globalSpeed}x
- **Default Curve:** ${globalConfig.curve}
- **Default Character Fade Delay:** ${globalConfig.charFadeDelay}ms
- **Default Mask Fade Delay:** ${globalConfig.maskFadeDelay}ms

## Files Included

- \`animation-data.json\` - Raw animation timing data
- \`react-component.tsx\` - React implementation
- \`package.json\` - Dependencies and scripts
- \`README.md\` - This documentation

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`

## Usage

Import the animation data and use it with your preferred animation library.

\`\`\`javascript
import animationData from './animation-data.json';
// Use with React, Vue, Angular, or any other framework
\`\`\`
`;

    const packageJson = `{
  "name": "animated-text-studio-export${selectedBlockId ? '-single-block' : ''}",
  "version": "1.0.0",
  "description": "Animation timing data exported from Animated Text Studio${blockText}",
  "main": "index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-scripts": "5.0.1"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
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
\`\`\`

## Instructions

1. Create a new GitHub repository
2. Copy each file content to the respective files
3. Commit and push to your repository
4. The animation data will be available for integration into any project

## Additional Files You Can Add

- **TypeScript Definitions:** Create \`types.d.ts\` for TypeScript projects
- **CSS Animations:** Create \`animations.css\` with pure CSS implementations
- **Documentation:** Add more detailed docs in \`docs/\` folder
- **Examples:** Create \`examples/\` folder with different framework implementations`;
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

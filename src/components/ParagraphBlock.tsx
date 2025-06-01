
import React, { useEffect, useRef, useState } from 'react';
import type { ContentBlock } from '@/pages/Index';

interface ParagraphBlockProps {
  content: string;
  animationConfig: ContentBlock['animationConfig'];
  currentTime: number;
  isActive: boolean;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  content,
  animationConfig,
  currentTime,
  isActive
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState<Array<{ char: string; isSpace: boolean; visible: boolean }>>([]);
  const [maskProgress, setMaskProgress] = useState(100);
  const [maskOpacity, setMaskOpacity] = useState(1);
  const [bottomFadeVisible, setBottomFadeVisible] = useState(true);

  useEffect(() => {
    // Initialize characters
    const charArray = content.split('').map(char => ({
      char,
      isSpace: char === ' ',
      visible: false
    }));
    setChars(charArray);
  }, [content]);

  useEffect(() => {
    if (!isActive) {
      // Reset animation state
      setChars(prev => prev.map(char => ({ ...char, visible: false })));
      setMaskProgress(100);
      setMaskOpacity(1);
      setBottomFadeVisible(true);
      return;
    }

    const nonSpaceChars = chars.filter(char => !char.isSpace);
    const totalChars = nonSpaceChars.length;
    
    // Character fade in animation
    const updatedChars = chars.map((char, index) => {
      if (char.isSpace) return char;
      
      const nonSpaceIndex = chars.slice(0, index).filter(c => !c.isSpace).length;
      const charStartTime = nonSpaceIndex * animationConfig.charFadeDelay;
      
      return {
        ...char,
        visible: currentTime >= charStartTime
      };
    });

    setChars(updatedChars);

    // Bottom fade animation
    const lastCharTime = (totalChars - 1) * animationConfig.charFadeDelay;
    setBottomFadeVisible(currentTime < lastCharTime);

    // Mask fade animation
    const allCharsTime = totalChars * animationConfig.charFadeDelay;
    const maskStartTime = allCharsTime + animationConfig.maskFadeDelay;
    
    if (currentTime >= maskStartTime) {
      const maskAnimationProgress = Math.min(
        (currentTime - maskStartTime) / animationConfig.maskFadeDuration,
        1
      );
      setMaskOpacity(1 - maskAnimationProgress);
      
      if (maskAnimationProgress >= 1) {
        setMaskOpacity(1);
      }
    }
  }, [currentTime, isActive, chars.length, animationConfig]);

  const maskStyle = {
    '--mask-progress': `${maskProgress}%`,
    '--mask-opacity': maskOpacity,
  } as React.CSSProperties;

  return (
    <div className="relative bg-white rounded-xl p-6 max-w-2xl">
      <div
        ref={containerRef}
        className="relative min-h-[110px] text-gray-600 text-base leading-6"
        style={{
          ...maskStyle,
          maskImage: `linear-gradient(
            135deg,
            black 0%,
            black calc(var(--mask-progress) - 16%),
            rgba(0,0,0,0.8) calc(var(--mask-progress) - 8%),
            rgba(0,0,0,0.45) var(--mask-progress),
            rgba(0,0,0,0.08) calc(var(--mask-progress) + 9%),
            transparent calc(var(--mask-progress) + 18%),
            transparent 100%
          )`,
          WebkitMaskImage: `linear-gradient(
            135deg,
            black 0%,
            black calc(var(--mask-progress) - 16%),
            rgba(0,0,0,0.8) calc(var(--mask-progress) - 8%),
            rgba(0,0,0,0.45) var(--mask-progress),
            rgba(0,0,0,0.08) calc(var(--mask-progress) + 9%),
            transparent calc(var(--mask-progress) + 18%),
            transparent 100%
          )`,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          opacity: maskOpacity,
          transition: `opacity 0.7s ${animationConfig.curve}`,
        }}
      >
        {chars.map((char, index) => (
          char.isSpace ? (
            <span key={index}> </span>
          ) : (
            <span
              key={index}
              className={`inline-block transition-opacity duration-300 ${animationConfig.curve} ${
                char.visible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transitionTimingFunction: animationConfig.curve,
                transitionDuration: '320ms'
              }}
            >
              {char.char}
            </span>
          )
        ))}
      </div>
      
      {/* Bottom fade */}
      <div
        className={`absolute left-0 right-0 bottom-0 h-11 pointer-events-none transition-opacity duration-600 ${animationConfig.curve} rounded-b-xl ${
          bottomFadeVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 65%, #fff 100%)',
          transitionTimingFunction: animationConfig.curve
        }}
      />
    </div>
  );
};

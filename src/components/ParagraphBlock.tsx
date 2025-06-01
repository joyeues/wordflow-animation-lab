
import React, { useEffect, useRef, useState } from 'react';
import type { ContentBlock } from '@/pages/Index';

interface ParagraphBlockProps {
  content: string;
  animationConfig: ContentBlock['animationConfig'];
  currentTime: number;
  isActive: boolean;
  hasStarted: boolean;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  content,
  animationConfig,
  currentTime,
  isActive,
  hasStarted
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState<Array<{ char: string; isSpace: boolean; visible: boolean }>>([]);
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
    if (!hasStarted) {
      // Reset animation state
      setChars(prev => prev.map(char => ({ ...char, visible: false })));
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

    // Bottom fade animation - hide when last character starts to fade in
    const lastCharTime = (totalChars - 1) * animationConfig.charFadeDelay;
    setBottomFadeVisible(currentTime < lastCharTime);

  }, [currentTime, hasStarted, chars.length, animationConfig]);

  return (
    <div className="relative bg-white rounded-xl p-6 max-w-2xl">
      <div
        ref={containerRef}
        className="relative min-h-[110px] text-gray-600 text-base leading-6"
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

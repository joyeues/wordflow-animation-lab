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
  const [chars, setChars] = useState<Array<{
    char: string;
    isSpace: boolean;
    visible: boolean;
  }>>([]);
  const [words, setWords] = useState<Array<{
    word: string;
    visible: boolean;
  }>>([]);
  const [gleamVisible, setGleamVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [gleamComplete, setGleamComplete] = useState(false);
  const prevContentRef = useRef<string>('');

  const animationType = animationConfig.textAnimationType || 'character';

  // Initialize characters and words when content changes
  useEffect(() => {
    // Character array for character animation
    const charArray = content.split('').map(char => ({
      char,
      isSpace: char === ' ',
      visible: false
    }));
    setChars(charArray);

    // Word array for word streaming animation
    const wordArray = content.split(' ').map(word => ({
      word,
      visible: false
    }));
    setWords(wordArray);

    prevContentRef.current = content;
  }, [content]);

  // Handle animation state updates
  useEffect(() => {
    if (!hasStarted) {
      // Reset all animation states
      setChars(prev => prev.map(char => ({ ...char, visible: false })));
      setWords(prev => prev.map(word => ({ ...word, visible: false })));
      setTextVisible(false);
      setGleamVisible(false);
      setGleamComplete(false);
      return;
    }

    if (animationType === 'character') {
      // Character-by-character animation (existing)
      if (chars.length === 0) return;

      const nonSpaceChars = chars.filter(char => !char.isSpace);
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

    } else if (animationType === 'word') {
      // Word streaming animation
      if (words.length === 0) return;

      const updatedWords = words.map((word, index) => {
        const wordStartTime = index * (animationConfig.charFadeDelay * 3); // Slower than character animation
        return {
          ...word,
          visible: currentTime >= wordStartTime
        };
      });
      setWords(updatedWords);

    } else if (animationType === 'gleam') {
      // Gleam animation - text is revealed by the gleam effect
      const gleamStartTime = 0;
      const gleamDuration = 1200; // Gleam effect duration
      
      if (currentTime >= gleamStartTime && currentTime <= gleamStartTime + gleamDuration && !gleamComplete) {
        setGleamVisible(true);
        setTextVisible(true);
      } else if (currentTime > gleamStartTime + gleamDuration) {
        setGleamVisible(false);
        setTextVisible(true);
        setGleamComplete(true);
      }
    }
  }, [currentTime, hasStarted, content, animationConfig.charFadeDelay, animationType, chars.length, words.length, gleamComplete]);

  const renderCharacterAnimation = () => (
    <>
      {chars.map((char, index) => 
        char.isSpace ? (
          <span key={`${content}-${index}`}> </span>
        ) : (
          <span 
            key={`${content}-${index}`}
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
      )}
    </>
  );

  const renderWordAnimation = () => (
    <>
      {words.map((word, index) => (
        <span key={`${content}-word-${index}`}>
          <span 
            className={`inline-block transition-all duration-400 ${animationConfig.curve} ${
              word.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{
              transitionTimingFunction: animationConfig.curve,
              transitionDuration: '400ms'
            }}
          >
            {word.word}
          </span>
          {index < words.length - 1 && ' '}
        </span>
      ))}
    </>
  );

  const renderGleamAnimation = () => (
    <div className="relative">
      <span 
        className={`gleam-container ${
          textVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {content}
      </span>
      <style dangerouslySetInnerHTML={{
        __html: `
          .gleam-container {
            position: relative;
            color: #374151;
            transition: opacity 0.3s ease;
          }
          
          .gleam-container::before {
            content: "${content.replace(/"/g, '\\"')}";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, 
              transparent 0%,
              transparent 30%,
              #7dd3fc 45%,
              #a78bfa 55%,
              transparent 70%,
              transparent 100%
            );
            background-size: 200% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            animation: ${gleamVisible && !gleamComplete ? 'gleam-reveal 1200ms ease-out forwards' : 'none'};
            opacity: ${gleamVisible ? '1' : '0'};
          }
          
          @keyframes gleam-reveal {
            0% {
              background-position: -200% 0%;
              opacity: 1;
            }
            100% {
              background-position: 200% 0%;
              opacity: 1;
            }
          }
        `
      }} />
    </div>
  );

  return (
    <div className="relative max-w-2xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm cursor-pointer rounded-xl">
      <div 
        ref={containerRef} 
        style={{
          wordWrap: 'break-word',
          whiteSpace: 'normal'
        }} 
        className="relative text-gray-600 text-base leading-6 mx-[23px]"
      >
        {animationType === 'character' && renderCharacterAnimation()}
        {animationType === 'word' && renderWordAnimation()}
        {animationType === 'gleam' && renderGleamAnimation()}
      </div>
    </div>
  );
};

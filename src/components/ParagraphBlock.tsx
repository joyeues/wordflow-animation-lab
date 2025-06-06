
import React, { useEffect, useRef, useState } from 'react';
import type { ContentBlock } from '@/pages/Index';

interface ParagraphBlockProps {
  content: string;
  animationConfig: ContentBlock['animationConfig'];
  currentTime: number;
  isActive: boolean;
  hasStarted: boolean;
  duration?: number; // Add duration prop
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  content,
  animationConfig,
  currentTime,
  isActive,
  hasStarted,
  duration = 3000 // Default duration
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
  const [gleamTriggered, setGleamTriggered] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
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
      setGleamTriggered(false);
      return;
    }

    if (animationType === 'character') {
      // Character-by-character animation timed to complete by duration end
      if (chars.length === 0) return;

      const nonSpaceChars = chars.filter(char => !char.isSpace);
      const totalAnimationTime = duration * 0.8; // Use 80% of duration for character reveals
      const charDelay = totalAnimationTime / nonSpaceChars.length;
      
      const updatedChars = chars.map((char, index) => {
        if (char.isSpace) return char;
        const nonSpaceIndex = chars.slice(0, index).filter(c => !c.isSpace).length;
        const charStartTime = nonSpaceIndex * charDelay;
        return {
          ...char,
          visible: currentTime >= charStartTime
        };
      });
      setChars(updatedChars);

    } else if (animationType === 'word') {
      // Word streaming animation timed to complete by duration end
      if (words.length === 0) return;

      const totalAnimationTime = duration * 0.8; // Use 80% of duration for word reveals
      const wordDelay = totalAnimationTime / words.length;
      
      const updatedWords = words.map((word, index) => {
        const wordStartTime = index * wordDelay;
        return {
          ...word,
          visible: currentTime >= wordStartTime
        };
      });
      setWords(updatedWords);

    } else if (animationType === 'gleam') {
      // Gleam animation - text appears first, then gleam effect triggers once
      setTextVisible(currentTime >= 0);
      if (currentTime >= 0 && !gleamTriggered) {
        setGleamTriggered(true);
      }
    }
  }, [currentTime, hasStarted, content, animationConfig.charFadeDelay, animationType, chars.length, words.length, duration, gleamTriggered]);

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
        className={`transition-opacity duration-500 ${gleamTriggered ? 'gleam-text' : ''} ${
          textVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          '--gleam-duration': `${duration}ms`
        } as React.CSSProperties}
      >
        {content}
      </span>
      <style dangerouslySetInnerHTML={{
        __html: `
          .gleam-text {
            background: linear-gradient(90deg, 
              #374151 0%, 
              #374151 20%, 
              #7dd3fc 40%, 
              #a78bfa 60%, 
              #374151 80%, 
              #374151 100%
            );
            background-size: 300% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            animation: gleam-sweep var(--gleam-duration, 3000ms) ease-out;
          }
          @keyframes gleam-sweep {
            0% {
              background-position: -300% 0%;
            }
            100% {
              background-position: 300% 0%;
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

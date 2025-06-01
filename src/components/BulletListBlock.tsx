
import React, { useEffect, useState } from 'react';
import type { ContentBlock } from '@/pages/Index';

interface BulletListBlockProps {
  content: { title: string; items: Array<{ bold: string; desc: string }> };
  animationConfig: ContentBlock['animationConfig'];
  currentTime: number;
  isActive: boolean;
  hasStarted: boolean;
}

export const BulletListBlock: React.FC<BulletListBlockProps> = ({
  content,
  animationConfig,
  currentTime,
  isActive,
  hasStarted
}) => {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [itemsVisible, setItemsVisible] = useState<boolean[]>([]);

  useEffect(() => {
    if (!hasStarted) {
      setHeaderVisible(false);
      setItemsVisible(content.items.map(() => false));
      return;
    }

    // Header animation (starts immediately)
    setHeaderVisible(currentTime >= 0);

    // Items animation (starts after delay, then staggered)
    const headerDelay = animationConfig.maskFadeDelay || 200;
    const staggerDelay = animationConfig.staggerDelay || 100;

    const newItemsVisible = content.items.map((_, index) => {
      const itemStartTime = headerDelay + (index * staggerDelay);
      return currentTime >= itemStartTime;
    });

    setItemsVisible(newItemsVisible);
  }, [currentTime, hasStarted, content.items.length, animationConfig]);

  return (
    <div className="rounded-xl overflow-hidden max-w-2xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm cursor-pointer">
      {/* Header */}
      <div className="px-6 pt-4 pb-2">
        <h3
          className={`text-xl font-semibold text-gray-600 leading-8 transition-all duration-400 ${animationConfig.curve} ${
            headerVisible 
              ? 'opacity-100 transform-none' 
              : 'opacity-0 -translate-x-7'
          }`}
          style={{
            transitionTimingFunction: animationConfig.curve
          }}
        >
          {content.title}
        </h3>
      </div>

      {/* List */}
      <ul className="px-6 pb-4" style={{ gap: '5px', display: 'flex', flexDirection: 'column' }}>
        {content.items.map((item, index) => (
          <li
            key={index}
            className={`text-gray-600 leading-6 list-disc list-inside transition-all duration-400 ${animationConfig.curve} ${
              itemsVisible[index]
                ? 'opacity-100 transform-none'
                : 'opacity-0 translate-y-10'
            }`}
            style={{
              transitionTimingFunction: animationConfig.curve,
              paddingLeft: '1.2em',
              textIndent: '-1.2em',
              wordWrap: 'break-word',
              whiteSpace: 'normal'
            }}
          >
            <span className="font-semibold">{item.bold} – </span>
            <span className="font-normal">{item.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

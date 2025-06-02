
import React, { useEffect, useState } from 'react';
import type { ContentBlock } from '@/pages/Index';

interface BulletListBlockProps {
  content: { title: string; items: Array<{ bold: string; desc: string }> };
  animationConfig: ContentBlock['animationConfig'];
  currentTime: number;
  isActive: boolean;
  hasStarted: boolean;
  duration: number; // Add duration prop
}

export const BulletListBlock: React.FC<BulletListBlockProps> = ({
  content,
  animationConfig,
  currentTime,
  isActive,
  hasStarted,
  duration
}) => {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [itemsVisible, setItemsVisible] = useState<boolean[]>([]);

  useEffect(() => {
    // Safety check to ensure content and items exist
    if (!hasStarted || !content || !content.items) {
      setHeaderVisible(false);
      setItemsVisible([]);
      return;
    }

    // Calculate timing to complete animation by duration end
    const totalItems = content.items.length + 1; // +1 for header
    const totalAnimationTime = duration * 0.8; // Use 80% of duration
    const itemDelay = totalAnimationTime / totalItems;

    // Header animation (starts immediately)
    setHeaderVisible(currentTime >= 0);

    // Items animation - evenly distributed across remaining time
    const newItemsVisible = content.items.map((_, index) => {
      const itemStartTime = itemDelay * (index + 1); // +1 because header takes first slot
      return currentTime >= itemStartTime;
    });

    setItemsVisible(newItemsVisible);
  }, [currentTime, hasStarted, content, content?.items?.length, animationConfig, duration]);

  // Safety check - don't render if content is invalid
  if (!content || !content.items) {
    return null;
  }

  return (
    <div className="rounded-xl overflow-hidden max-w-2xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm cursor-pointer">
      {/* Header */}
      <div className="px-6 pb-2">
        <h3
          className={`text-xl font-semibold text-gray-600 leading-8 transition-all duration-400 ${
            headerVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
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
            className={`text-gray-600 leading-6 list-disc list-inside transition-all duration-400 ${
              itemsVisible[index]
                ? 'opacity-100 translate-y-0'
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

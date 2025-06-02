
import type { ContentBlock } from '@/pages/Index';

// Helper function to snap to nearest 10ms
export const snapToTen = (value: number) => Math.round(value / 10) * 10;

// Helper function to get block display text
export const getBlockDisplayText = (block: ContentBlock) => {
  if (typeof block.content === 'string') {
    return block.content.slice(0, 20);
  } else if (block.type === 'bulletList' && 'title' in block.content) {
    return block.content.title;
  } else if (block.type === 'chart' && 'data' in block.content) {
    return 'Chart';
  }
  return 'Unknown';
};

// Helper function to format time
export const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};


import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartBlockProps {
  content: {
    chartType: 'bar' | 'line' | 'pie' | 'doughnut';
    data: any;
    options?: any;
    duration?: number; // Make duration optional in content
  };
  isVisible: boolean;
  currentTime: number;
  isActive: boolean;
  hasStarted: boolean;
  className?: string;
  duration: number; // Add duration as a direct prop from the block
}

export const ChartBlock: React.FC<ChartBlockProps> = ({ 
  content, 
  isVisible, 
  currentTime,
  isActive,
  hasStarted,
  className,
  duration // Use the block's duration directly
}) => {
  const { chartType, data, options } = content;
  const chartRef = useRef<any>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [triggerAnimation, setTriggerAnimation] = useState(false);
  const [hasBeenActive, setHasBeenActive] = useState(false);

  // Show chart when it becomes active and keep it visible once it has been active
  useEffect(() => {
    // Reset hasBeenActive when scrubbing back to before start time
    if (!hasStarted && hasBeenActive) {
      setHasBeenActive(false);
      setShouldRender(false);
      return;
    }

    if (isActive && !shouldRender) {
      setShouldRender(true);
      setHasBeenActive(true);
      // Trigger animation after a short delay to ensure chart is mounted
      setTimeout(() => {
        setTriggerAnimation(true);
      }, 100);
    }
    // Keep chart visible if it has been active before (even after duration ends)
    if (hasBeenActive && hasStarted && !shouldRender) {
      setShouldRender(true);
    }
    // Hide chart if it hasn't started yet and hasn't been active
    if (!hasStarted && !hasBeenActive && shouldRender) {
      setShouldRender(false);
    }
  }, [isActive, hasStarted, shouldRender, hasBeenActive]);

  // Trigger chart animation when needed
  useEffect(() => {
    if (triggerAnimation && chartRef.current) {
      chartRef.current.update('active');
      setTriggerAnimation(false);
    }
  }, [triggerAnimation]);

  const renderChart = () => {
    const chartProps = { 
      ref: chartRef,
      data, 
      options: {
        ...options,
        animation: {
          duration: duration, // Use the block's duration for animation
          easing: 'easeOutSine',
          animateRotate: true,
          animateScale: true
        },
        responsive: true,
        maintainAspectRatio: false
      }
    };
    
    switch (chartType) {
      case 'bar':
        return <Bar {...chartProps} />;
      case 'line':
        return <Line {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      default:
        return <Doughnut {...chartProps} />;
    }
  };

  // Don't render anything if the block shouldn't be visible
  if (!shouldRender) {
    return null;
  }

  return (
    <div 
      className={`chart-block ${className || ''}`}
      style={{ 
        height: '400px', 
        width: '100%'
      }}
    >
      {renderChart()}
    </div>
  );
};

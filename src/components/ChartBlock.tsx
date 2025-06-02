
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
  };
  isVisible: boolean;
  currentTime: number;
  isActive: boolean;
  hasStarted: boolean;
  className?: string;
}

export const ChartBlock: React.FC<ChartBlockProps> = ({ 
  content, 
  isVisible, 
  currentTime,
  isActive,
  hasStarted,
  className 
}) => {
  const { chartType, data, options } = content;
  const chartRef = useRef<any>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [triggerAnimation, setTriggerAnimation] = useState(false);

  // Only show chart when it becomes active
  useEffect(() => {
    if (isActive && !shouldRender) {
      setShouldRender(true);
      // Trigger animation after a short delay to ensure chart is mounted
      setTimeout(() => {
        setTriggerAnimation(true);
      }, 100);
    } else if (!isActive && shouldRender) {
      setShouldRender(false);
      setTriggerAnimation(false);
    }
  }, [isActive, shouldRender]);

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
          duration: 1000,
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

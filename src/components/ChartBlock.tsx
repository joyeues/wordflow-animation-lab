
import React, { useEffect, useRef } from 'react';
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
  const hasAnimatedRef = useRef(false);

  // Reset animation when block becomes inactive
  useEffect(() => {
    if (!isActive) {
      hasAnimatedRef.current = false;
    }
  }, [isActive]);

  // Trigger animation when the block becomes active for the first time
  useEffect(() => {
    if (isActive && !hasAnimatedRef.current && chartRef.current) {
      hasAnimatedRef.current = true;
      // Destroy and recreate the chart to trigger fresh animation
      chartRef.current.destroy();
      // Small delay to ensure clean recreation
      setTimeout(() => {
        if (chartRef.current) {
          chartRef.current.update('none'); // Update without animation first
          chartRef.current.update('active'); // Then trigger animation
        }
      }, 50);
    }
  }, [isActive]);

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

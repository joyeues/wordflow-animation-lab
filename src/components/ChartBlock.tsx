
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

  // Trigger animation when the block becomes active
  useEffect(() => {
    if (isActive && chartRef.current) {
      // Force re-render with animation when it's time
      chartRef.current.update('active');
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
          // Only animate when the block is active
          animateRotate: true,
          animateScale: true
        },
        // Force animation on update
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

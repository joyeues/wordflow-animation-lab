
import React from 'react';
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

  // Calculate animation progress (0 to 1)
  const animationProgress = Math.min(currentTime / 1000, 1); // 1 second animation duration
  
  // Create animated data based on progress
  const animatedData = {
    ...data,
    datasets: data.datasets.map((dataset: any) => ({
      ...dataset,
      data: dataset.data.map((value: number) => 
        hasStarted ? value * animationProgress : 0
      )
    }))
  };

  const renderChart = () => {
    const chartProps = { 
      data: animatedData, 
      options: {
        ...options,
        animation: {
          duration: 0 // Disable chart.js internal animations since we're controlling it
        },
        plugins: {
          ...options?.plugins,
          legend: {
            ...options?.plugins?.legend,
            display: hasStarted ? options?.plugins?.legend?.display !== false : false
          }
        }
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
        return <Bar {...chartProps} />;
    }
  };

  return (
    <div 
      className={`chart-block transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${className || ''}`}
      style={{ 
        height: '400px', 
        width: '100%',
        transform: hasStarted 
          ? `translateY(0px) scale(${0.95 + (0.05 * animationProgress)})` 
          : 'translateY(20px) scale(0.95)'
      }}
    >
      {renderChart()}
    </div>
  );
};

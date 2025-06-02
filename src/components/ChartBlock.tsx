
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
  className?: string;
}

export const ChartBlock: React.FC<ChartBlockProps> = ({ content, isVisible, className }) => {
  const { chartType, data, options } = content;

  const renderChart = () => {
    const chartProps = { data, options };
    
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
      className={`chart-block transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className || ''}`}
      style={{ height: '400px', width: '100%' }}
    >
      {renderChart()}
    </div>
  );
};

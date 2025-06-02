
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ContentBlock } from '@/pages/Index';

interface ChartEditorProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
}

export const ChartEditor: React.FC<ChartEditorProps> = ({ block, onUpdate }) => {
  if (block.type !== 'chart' || typeof block.content === 'string' || !('chartType' in block.content)) {
    return null;
  }

  const chartContent = block.content;

  const handleChartTypeChange = (chartType: 'bar' | 'line' | 'pie' | 'doughnut') => {
    onUpdate({
      content: {
        ...chartContent,
        chartType
      }
    });
  };

  const handleDatasetLabelChange = (index: number, label: string) => {
    const newDatasets = [...chartContent.data.datasets];
    newDatasets[index] = { ...newDatasets[index], label };
    
    onUpdate({
      content: {
        ...chartContent,
        data: {
          ...chartContent.data,
          datasets: newDatasets
        }
      }
    });
  };

  const handleDataChange = (datasetIndex: number, valueIndex: number, value: string) => {
    const newDatasets = [...chartContent.data.datasets];
    const newData = [...newDatasets[datasetIndex].data];
    newData[valueIndex] = parseFloat(value) || 0;
    newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], data: newData };
    
    onUpdate({
      content: {
        ...chartContent,
        data: {
          ...chartContent.data,
          datasets: newDatasets
        }
      }
    });
  };

  const handleLabelChange = (index: number, label: string) => {
    const newLabels = [...chartContent.data.labels];
    newLabels[index] = label;
    
    onUpdate({
      content: {
        ...chartContent,
        data: {
          ...chartContent.data,
          labels: newLabels
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Chart Type</Label>
        <Select value={chartContent.chartType} onValueChange={handleChartTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="doughnut">Doughnut Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Labels</Label>
        {chartContent.data.labels.map((label, index) => (
          <Input
            key={index}
            value={label}
            onChange={(e) => handleLabelChange(index, e.target.value)}
            placeholder={`Label ${index + 1}`}
          />
        ))}
      </div>

      <div className="space-y-2">
        <Label>Dataset</Label>
        {chartContent.data.datasets.map((dataset, datasetIndex) => (
          <div key={datasetIndex} className="space-y-2 border p-3 rounded">
            <Input
              value={dataset.label}
              onChange={(e) => handleDatasetLabelChange(datasetIndex, e.target.value)}
              placeholder="Dataset Label"
            />
            <div className="grid grid-cols-2 gap-2">
              {dataset.data.map((value, valueIndex) => (
                <Input
                  key={valueIndex}
                  type="number"
                  value={value}
                  onChange={(e) => handleDataChange(datasetIndex, valueIndex, e.target.value)}
                  placeholder={`Value ${valueIndex + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

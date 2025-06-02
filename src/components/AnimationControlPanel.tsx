
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { BulletListEditor } from '@/components/BulletListEditor';
import { ChartEditor } from '@/components/ChartEditor';
import type { ContentBlock, AnimationConfig } from '@/pages/Index';

interface AnimationControlPanelProps {
  globalConfig: AnimationConfig;
  onGlobalConfigChange: (config: AnimationConfig) => void;
  selectedBlock: ContentBlock | null;
  onBlockUpdate: (blockId: string, updates: Partial<ContentBlock>) => void;
}

export const AnimationControlPanel: React.FC<AnimationControlPanelProps> = ({
  globalConfig,
  onGlobalConfigChange,
  selectedBlock,
  onBlockUpdate
}) => {
  const handleGlobalConfigChange = (key: keyof AnimationConfig, value: any) => {
    onGlobalConfigChange({
      ...globalConfig,
      [key]: value
    });
  };

  const handleBlockContentChange = (content: any) => {
    if (selectedBlock) {
      onBlockUpdate(selectedBlock.id, { content });
    }
  };

  const handleBlockPropertyChange = (key: keyof ContentBlock, value: any) => {
    if (selectedBlock) {
      onBlockUpdate(selectedBlock.id, { [key]: value });
    }
  };

  const handleAnimationConfigChange = (key: string, value: any) => {
    if (selectedBlock) {
      onBlockUpdate(selectedBlock.id, {
        animationConfig: {
          ...selectedBlock.animationConfig,
          [key]: value
        }
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Global Speed</Label>
            <Slider
              value={[globalConfig.globalSpeed]}
              onValueChange={([value]) => handleGlobalConfigChange('globalSpeed', value)}
              min={0.1}
              max={3}
              step={0.1}
              className="mt-2"
            />
            <div className="text-sm text-gray-500 mt-1">{globalConfig.globalSpeed}x</div>
          </div>

          <div>
            <Label>Easing Curve</Label>
            <Select value={globalConfig.curve} onValueChange={(value) => handleGlobalConfigChange('curve', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cubic-bezier(0.45,0,0.58,1)">Ease Out</SelectItem>
                <SelectItem value="cubic-bezier(0.00,0.00,0.00,1.00)">Ease In</SelectItem>
                <SelectItem value="cubic-bezier(0.45,0.45,0.55,1)">Ease In Out</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Character Fade Delay (ms)</Label>
            <Input
              type="number"
              value={globalConfig.charFadeDelay}
              onChange={(e) => handleGlobalConfigChange('charFadeDelay', parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label>Mask Fade Delay (ms)</Label>
            <Input
              type="number"
              value={globalConfig.maskFadeDelay}
              onChange={(e) => handleGlobalConfigChange('maskFadeDelay', parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label>Mask Fade Duration (ms)</Label>
            <Input
              type="number"
              value={globalConfig.maskFadeDuration}
              onChange={(e) => handleGlobalConfigChange('maskFadeDuration', parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label>Stagger Delay (ms)</Label>
            <Input
              type="number"
              value={globalConfig.staggerDelay}
              onChange={(e) => handleGlobalConfigChange('staggerDelay', parseInt(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Block Settings */}
      {selectedBlock && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedBlock.type === 'paragraph' && 'Paragraph Settings'}
              {selectedBlock.type === 'bulletList' && 'Bullet List Settings'}
              {selectedBlock.type === 'chart' && 'Chart Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content Editor */}
            <div>
              <Label>Content</Label>
              {selectedBlock.type === 'paragraph' && (
                <Textarea
                  value={selectedBlock.content as string}
                  onChange={(e) => handleBlockContentChange(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              )}
              {selectedBlock.type === 'bulletList' && (
                <div className="mt-2">
                  <BulletListEditor
                    content={selectedBlock.content as { title: string; items: Array<{ bold: string; desc: string }> }}
                    onChange={handleBlockContentChange}
                  />
                </div>
              )}
              {selectedBlock.type === 'chart' && (
                <div className="mt-2">
                  <ChartEditor
                    block={selectedBlock}
                    onUpdate={(updates) => onBlockUpdate(selectedBlock.id, updates)}
                  />
                </div>
              )}
            </div>

            {/* Timing Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time (ms)</Label>
                <Input
                  type="number"
                  value={selectedBlock.startTime}
                  onChange={(e) => handleBlockPropertyChange('startTime', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Duration (ms)</Label>
                <Input
                  type="number"
                  value={selectedBlock.duration}
                  onChange={(e) => handleBlockPropertyChange('duration', parseInt(e.target.value) || 1000)}
                />
              </div>
            </div>

            {/* Animation Settings - only for non-chart blocks */}
            {selectedBlock.type !== 'chart' && (
              <>
                <div>
                  <Label>Easing Curve</Label>
                  <Select 
                    value={selectedBlock.animationConfig.curve} 
                    onValueChange={(value) => handleAnimationConfigChange('curve', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cubic-bezier(0.45,0,0.58,1)">Ease Out</SelectItem>
                      <SelectItem value="cubic-bezier(0.00,0.00,0.00,1.00)">Ease In</SelectItem>
                      <SelectItem value="cubic-bezier(0.45,0.45,0.55,1)">Ease In Out</SelectItem>
                      <SelectItem value="linear">Linear</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Character Fade Delay (ms)</Label>
                  <Input
                    type="number"
                    value={selectedBlock.animationConfig.charFadeDelay}
                    onChange={(e) => handleAnimationConfigChange('charFadeDelay', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label>Mask Fade Delay (ms)</Label>
                  <Input
                    type="number"
                    value={selectedBlock.animationConfig.maskFadeDelay}
                    onChange={(e) => handleAnimationConfigChange('maskFadeDelay', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label>Mask Fade Duration (ms)</Label>
                  <Input
                    type="number"
                    value={selectedBlock.animationConfig.maskFadeDuration}
                    onChange={(e) => handleAnimationConfigChange('maskFadeDuration', parseInt(e.target.value) || 0)}
                  />
                </div>

                {selectedBlock.type === 'bulletList' && (
                  <div>
                    <Label>Stagger Delay (ms)</Label>
                    <Input
                      type="number"
                      value={selectedBlock.animationConfig.staggerDelay || 0}
                      onChange={(e) => handleAnimationConfigChange('staggerDelay', parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

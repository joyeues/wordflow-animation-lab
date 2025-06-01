
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { AnimationConfig, ContentBlock } from '@/pages/Index';

interface AnimationControlPanelProps {
  globalConfig: AnimationConfig;
  onGlobalConfigChange: (config: AnimationConfig) => void;
  selectedBlock: ContentBlock | null;
  onBlockUpdate: (blockId: string, updates: Partial<ContentBlock>) => void;
}

const easingCurves = [
  { value: 'cubic-bezier(0.45,0,0.58,1)', label: 'Ease Out' },
  { value: 'cubic-bezier(0.25,0.46,0.45,0.94)', label: 'Ease' },
  { value: 'cubic-bezier(0.55,0.05,0.68,0.19)', label: 'Ease In' },
  { value: 'cubic-bezier(0.68,-0.55,0.265,1.55)', label: 'Back Out' },
  { value: 'cubic-bezier(0.00,0.00,0.00,1.00)', label: 'Ease Out Expo' },
  { value: 'linear', label: 'Linear' }
];

export const AnimationControlPanel: React.FC<AnimationControlPanelProps> = ({
  globalConfig,
  onGlobalConfigChange,
  selectedBlock,
  onBlockUpdate
}) => {
  const handleGlobalConfigChange = (key: keyof AnimationConfig, value: any) => {
    onGlobalConfigChange({ ...globalConfig, [key]: value });
  };

  const handleBlockConfigChange = (key: string, value: any) => {
    if (!selectedBlock) return;
    
    if (key.startsWith('animationConfig.')) {
      const configKey = key.split('.')[1];
      onBlockUpdate(selectedBlock.id, {
        animationConfig: {
          ...selectedBlock.animationConfig,
          [configKey]: value
        }
      });
    } else {
      onBlockUpdate(selectedBlock.id, { [key]: value });
    }
  };

  const handleContentChange = (value: string) => {
    if (!selectedBlock) return;
    
    if (selectedBlock.type === 'paragraph') {
      onBlockUpdate(selectedBlock.id, { content: value });
    } else if (selectedBlock.type === 'bulletList' && typeof selectedBlock.content === 'object') {
      try {
        const parsed = JSON.parse(value);
        onBlockUpdate(selectedBlock.id, { content: parsed });
      } catch (e) {
        // Invalid JSON, don't update
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Global Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Global Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Global Speed</Label>
            <Slider
              value={[globalConfig.globalSpeed]}
              onValueChange={([value]) => handleGlobalConfigChange('globalSpeed', value)}
              min={0.1}
              max={3}
              step={0.1}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">{globalConfig.globalSpeed}x</div>
          </div>

          <div>
            <Label className="text-xs">Default Easing</Label>
            <Select
              value={globalConfig.curve}
              onValueChange={(value) => handleGlobalConfigChange('curve', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {easingCurves.map(curve => (
                  <SelectItem key={curve.value} value={curve.value}>
                    {curve.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Character Fade Delay (ms)</Label>
            <Slider
              value={[globalConfig.charFadeDelay]}
              onValueChange={([value]) => handleGlobalConfigChange('charFadeDelay', value)}
              min={1}
              max={20}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">{globalConfig.charFadeDelay}ms</div>
          </div>

          <div>
            <Label className="text-xs">Stagger Delay (ms)</Label>
            <Slider
              value={[globalConfig.staggerDelay]}
              onValueChange={([value]) => handleGlobalConfigChange('staggerDelay', value)}
              min={50}
              max={500}
              step={10}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">{globalConfig.staggerDelay}ms</div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Block-Specific Controls */}
      {selectedBlock ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {selectedBlock.type === 'paragraph' ? 'Paragraph' : 'Bullet List'} Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Content</Label>
              <Textarea
                value={
                  selectedBlock.type === 'paragraph' 
                    ? selectedBlock.content as string
                    : JSON.stringify(selectedBlock.content, null, 2)
                }
                onChange={(e) => handleContentChange(e.target.value)}
                className="mt-2"
                rows={selectedBlock.type === 'paragraph' ? 4 : 8}
                placeholder={
                  selectedBlock.type === 'paragraph' 
                    ? 'Enter paragraph text...'
                    : 'Enter JSON for bullet list...'
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Start Time (ms)</Label>
                <Input
                  type="number"
                  value={selectedBlock.startTime}
                  onChange={(e) => handleBlockConfigChange('startTime', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-xs">Duration (ms)</Label>
                <Input
                  type="number"
                  value={selectedBlock.duration}
                  onChange={(e) => handleBlockConfigChange('duration', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Easing Curve</Label>
              <Select
                value={selectedBlock.animationConfig.curve}
                onValueChange={(value) => handleBlockConfigChange('animationConfig.curve', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {easingCurves.map(curve => (
                    <SelectItem key={curve.value} value={curve.value}>
                      {curve.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBlock.type === 'paragraph' && (
              <>
                <div>
                  <Label className="text-xs">Character Fade Delay (ms)</Label>
                  <Slider
                    value={[selectedBlock.animationConfig.charFadeDelay]}
                    onValueChange={([value]) => handleBlockConfigChange('animationConfig.charFadeDelay', value)}
                    min={1}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">{selectedBlock.animationConfig.charFadeDelay}ms</div>
                </div>

                <div>
                  <Label className="text-xs">Mask Fade Delay (ms)</Label>
                  <Slider
                    value={[selectedBlock.animationConfig.maskFadeDelay]}
                    onValueChange={([value]) => handleBlockConfigChange('animationConfig.maskFadeDelay', value)}
                    min={0}
                    max={500}
                    step={10}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">{selectedBlock.animationConfig.maskFadeDelay}ms</div>
                </div>

                <div>
                  <Label className="text-xs">Mask Fade Duration (ms)</Label>
                  <Slider
                    value={[selectedBlock.animationConfig.maskFadeDuration]}
                    onValueChange={([value]) => handleBlockConfigChange('animationConfig.maskFadeDuration', value)}
                    min={100}
                    max={1000}
                    step={50}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">{selectedBlock.animationConfig.maskFadeDuration}ms</div>
                </div>
              </>
            )}

            {selectedBlock.type === 'bulletList' && (
              <div>
                <Label className="text-xs">Stagger Delay (ms)</Label>
                <Slider
                  value={[selectedBlock.animationConfig.staggerDelay || 100]}
                  onValueChange={([value]) => handleBlockConfigChange('animationConfig.staggerDelay', value)}
                  min={50}
                  max={500}
                  step={10}
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">{selectedBlock.animationConfig.staggerDelay || 100}ms</div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 text-sm">
              Select a block on the timeline to edit its properties
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

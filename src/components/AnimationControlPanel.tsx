import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
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
  { value: 'linear', label: 'Linear' },
  { value: 'custom', label: 'Custom' }
];

export const AnimationControlPanel: React.FC<AnimationControlPanelProps> = ({
  globalConfig,
  onGlobalConfigChange,
  selectedBlock,
  onBlockUpdate
}) => {
  const [isGlobalCustom, setIsGlobalCustom] = useState(false);
  const [isBlockCustom, setIsBlockCustom] = useState(false);

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

  const handleGlobalCurveChange = (value: string) => {
    if (value === 'custom') {
      setIsGlobalCustom(true);
      return;
    }
    setIsGlobalCustom(false);
    handleGlobalConfigChange('curve', value);
  };

  const handleGlobalCustomCurveChange = (value: string) => {
    handleGlobalConfigChange('curve', value);
  };

  const handleBlockCurveChange = (value: string) => {
    if (value === 'custom') {
      setIsBlockCustom(true);
      return;
    }
    setIsBlockCustom(false);
    handleBlockConfigChange('animationConfig.curve', value);
  };

  const handleBlockCustomCurveChange = (value: string) => {
    handleBlockConfigChange('animationConfig.curve', value);
  };

  const getCurrentGlobalCurveValue = () => {
    const predefined = easingCurves.find(curve => curve.value === globalConfig.curve && curve.value !== 'custom');
    return predefined ? globalConfig.curve : 'custom';
  };

  const getCurrentBlockCurveValue = () => {
    if (!selectedBlock) return '';
    const predefined = easingCurves.find(curve => curve.value === selectedBlock.animationConfig.curve && curve.value !== 'custom');
    return predefined ? selectedBlock.animationConfig.curve : 'custom';
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
            {isGlobalCustom ? (
              <div className="mt-2 space-y-2">
                <Input
                  placeholder="e.g., cubic-bezier(0.25, 0.1, 0.25, 1) or ease-in-out"
                  value={globalConfig.curve}
                  onChange={(e) => handleGlobalCustomCurveChange(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsGlobalCustom(false)}
                  className="text-xs"
                >
                  Back to presets
                </Button>
              </div>
            ) : (
              <Select
                value={getCurrentGlobalCurveValue()}
                onValueChange={handleGlobalCurveChange}
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
            )}
          </div>

          <div>
            <Label className="text-xs">Character Fade Delay (ms)</Label>
            <Slider
              value={[globalConfig.charFadeDelay]}
              onValueChange={([value]) => handleGlobalConfigChange('charFadeDelay', Math.round(value))}
              min={1}
              max={20}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">{Math.round(globalConfig.charFadeDelay)}ms</div>
          </div>

          <div>
            <Label className="text-xs">Stagger Delay (ms)</Label>
            <Slider
              value={[globalConfig.staggerDelay]}
              onValueChange={([value]) => handleGlobalConfigChange('staggerDelay', Math.round(value))}
              min={50}
              max={500}
              step={10}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">{Math.round(globalConfig.staggerDelay)}ms</div>
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
                  onChange={(e) => handleBlockConfigChange('startTime', Math.round(parseInt(e.target.value) || 0))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-xs">Duration (ms)</Label>
                <Input
                  type="number"
                  value={selectedBlock.duration}
                  onChange={(e) => handleBlockConfigChange('duration', Math.round(parseInt(e.target.value) || 1000))}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Easing Curve</Label>
              {isBlockCustom ? (
                <div className="mt-2 space-y-2">
                  <Input
                    placeholder="e.g., cubic-bezier(0.25, 0.1, 0.25, 1) or ease-in-out"
                    value={selectedBlock.animationConfig.curve}
                    onChange={(e) => handleBlockCustomCurveChange(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBlockCustom(false)}
                    className="text-xs"
                  >
                    Back to presets
                  </Button>
                </div>
              ) : (
                <Select
                  value={getCurrentBlockCurveValue()}
                  onValueChange={handleBlockCurveChange}
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
              )}
            </div>

            {selectedBlock.type === 'paragraph' && (
              <>
                <div>
                  <Label className="text-xs">Character Fade Delay (ms)</Label>
                  <Slider
                    value={[selectedBlock.animationConfig.charFadeDelay]}
                    onValueChange={([value]) => handleBlockConfigChange('animationConfig.charFadeDelay', Math.round(value))}
                    min={1}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">{Math.round(selectedBlock.animationConfig.charFadeDelay)}ms</div>
                </div>

                <div>
                  <Label className="text-xs">Mask Fade Delay (ms)</Label>
                  <Slider
                    value={[selectedBlock.animationConfig.maskFadeDelay]}
                    onValueChange={([value]) => handleBlockConfigChange('animationConfig.maskFadeDelay', Math.round(value))}
                    min={0}
                    max={500}
                    step={10}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">{Math.round(selectedBlock.animationConfig.maskFadeDelay)}ms</div>
                </div>

                <div>
                  <Label className="text-xs">Mask Fade Duration (ms)</Label>
                  <Slider
                    value={[selectedBlock.animationConfig.maskFadeDuration]}
                    onValueChange={([value]) => handleBlockConfigChange('animationConfig.maskFadeDuration', Math.round(value))}
                    min={100}
                    max={1000}
                    step={50}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">{Math.round(selectedBlock.animationConfig.maskFadeDuration)}ms</div>
                </div>
              </>
            )}

            {selectedBlock.type === 'bulletList' && (
              <div>
                <Label className="text-xs">Stagger Delay (ms)</Label>
                <Slider
                  value={[selectedBlock.animationConfig.staggerDelay || 100]}
                  onValueChange={([value]) => handleBlockConfigChange('animationConfig.staggerDelay', Math.round(value))}
                  min={50}
                  max={500}
                  step={10}
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">{Math.round(selectedBlock.animationConfig.staggerDelay || 100)}ms</div>
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

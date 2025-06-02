
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface BulletListContent {
  title: string;
  items: Array<{ bold: string; desc: string }>;
}

interface BulletListEditorProps {
  content: BulletListContent;
  onChange: (content: BulletListContent) => void;
}

export const BulletListEditor: React.FC<BulletListEditorProps> = ({
  content,
  onChange
}) => {
  const [localContent, setLocalContent] = useState<BulletListContent>(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Safety check to ensure content has the expected structure
  if (!content || !content.items || !Array.isArray(content.items)) {
    return (
      <div className="p-4 text-center text-gray-500">
        Invalid bullet list content structure
      </div>
    );
  }

  const handleTitleChange = (title: string) => {
    const updated = { ...localContent, title };
    setLocalContent(updated);
    onChange(updated);
  };

  const handleItemChange = (index: number, field: 'bold' | 'desc', value: string) => {
    const updatedItems = [...localContent.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    const updated = { ...localContent, items: updatedItems };
    setLocalContent(updated);
    onChange(updated);
  };

  const addItem = () => {
    const updated = {
      ...localContent,
      items: [...localContent.items, { bold: '', desc: '' }]
    };
    setLocalContent(updated);
    onChange(updated);
  };

  const removeItem = (index: number) => {
    const updated = {
      ...localContent,
      items: localContent.items.filter((_, i) => i !== index)
    };
    setLocalContent(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={localContent.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Bullet List"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Items</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>

        {localContent.items.map((item, index) => (
          <div key={index} className="space-y-2 p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Item {index + 1}</Label>
              {localContent.items.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            <div>
              <Label htmlFor={`item-${index}-bold`} className="text-xs text-gray-600">
                Bold Text (always bold)
              </Label>
              <Input
                id={`item-${index}-bold`}
                value={item.bold}
                onChange={(e) => handleItemChange(index, 'bold', e.target.value)}
                placeholder="Item title"
                className="text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor={`item-${index}-desc`} className="text-xs text-gray-600">
                Description
              </Label>
              <Textarea
                id={`item-${index}-desc`}
                value={item.desc}
                onChange={(e) => handleItemChange(index, 'desc', e.target.value)}
                placeholder="Item description"
                className="text-sm min-h-[60px]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

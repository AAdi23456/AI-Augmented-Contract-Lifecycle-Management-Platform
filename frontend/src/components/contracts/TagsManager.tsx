'use client';

import { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TagsManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[];
}

export function TagsManager({ tags, onTagsChange, availableTags = [] }: TagsManagerProps) {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      onTagsChange(updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onTagsChange(updatedTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Filter out tags that are already added
  const filteredAvailableTags = availableTags.filter(tag => !tags.includes(tag));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="outline" className="flex items-center gap-1 pr-1">
            <Tag size={12} />
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X size={12} />
              <span className="sr-only">Remove {tag} tag</span>
            </button>
          </Badge>
        ))}
        
        {tags.length === 0 && (
          <span className="text-sm text-gray-500">No tags added yet</span>
        )}
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new tag"
            className="pl-8 pr-4 py-2 border border-gray-300 rounded-md w-full"
          />
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <Button onClick={handleAddTag} disabled={!newTag.trim()}>
          <Plus size={16} className="mr-1" />
          Add
        </Button>
      </div>
      
      {filteredAvailableTags.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="mt-1">
              Suggested Tags
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select from common tags</h3>
              <div className="flex flex-wrap gap-2">
                {filteredAvailableTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      onTagsChange([...tags, tag]);
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
} 
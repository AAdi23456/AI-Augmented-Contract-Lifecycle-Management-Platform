'use client';

import { useState } from 'react';
import { Folder, FolderPlus, ChevronRight, ChevronDown, MoreHorizontal, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FolderItem {
  id: string;
  name: string;
  children?: FolderItem[];
}

interface FolderManagerProps {
  folders: FolderItem[];
  onFolderSelect: (folderId: string) => void;
  selectedFolderId?: string;
  onFolderCreate?: (parentId: string | null, name: string) => void;
  onFolderRename?: (folderId: string, newName: string) => void;
  onFolderDelete?: (folderId: string) => void;
}

export function FolderManager({
  folders,
  onFolderSelect,
  selectedFolderId,
  onFolderCreate,
  onFolderRename,
  onFolderDelete
}: FolderManagerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleCreateFolder = (parentId: string | null = null) => {
    if (onFolderCreate && newFolderName.trim()) {
      onFolderCreate(parentId, newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
      setCreatingParentId(null);
    }
  };

  const handleRenameFolder = (folderId: string) => {
    if (onFolderRename && editingFolderName.trim()) {
      onFolderRename(folderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const startCreatingFolder = (parentId: string | null = null) => {
    setIsCreatingFolder(true);
    setCreatingParentId(parentId);
    setNewFolderName('');
  };

  const startEditingFolder = (folder: FolderItem) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  const renderFolder = (folder: FolderItem, depth = 0) => {
    const isExpanded = expandedFolders[folder.id];
    const hasChildren = folder.children && folder.children.length > 0;
    const isSelected = selectedFolderId === folder.id;
    const isEditing = editingFolderId === folder.id;

    return (
      <div key={folder.id} className="select-none">
        <div 
          className={`flex items-center py-1 px-2 rounded-md ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {hasChildren ? (
            <button 
              onClick={() => toggleFolder(folder.id)}
              className="p-1 rounded-md hover:bg-gray-200 mr-1"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-6 mr-1"></div>
          )}
          
          <Folder size={16} className="text-blue-500 mr-2" />
          
          {isEditing ? (
            <div className="flex-1 flex">
              <input
                type="text"
                value={editingFolderName}
                onChange={(e) => setEditingFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameFolder(folder.id);
                  if (e.key === 'Escape') setEditingFolderId(null);
                }}
                autoFocus
                className="flex-1 py-0.5 px-1 border border-gray-300 rounded text-sm"
              />
              <Button 
                size="sm" 
                className="ml-1 h-6 text-xs" 
                onClick={() => handleRenameFolder(folder.id)}
              >
                Save
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-1 h-6 text-xs" 
                onClick={() => setEditingFolderId(null)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <span 
                className="flex-1 truncate cursor-pointer"
                onClick={() => onFolderSelect(folder.id)}
              >
                {folder.name}
              </span>
              
              {onFolderRename && onFolderDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEditingFolder(folder)}>
                      <Edit size={14} className="mr-2" />
                      Rename
                    </DropdownMenuItem>
                    {onFolderCreate && (
                      <DropdownMenuItem onClick={() => startCreatingFolder(folder.id)}>
                        <FolderPlus size={14} className="mr-2" />
                        Add Subfolder
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onFolderDelete(folder.id)}
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {folder.children!.map(child => renderFolder(child, depth + 1))}
          </div>
        )}
        
        {isExpanded && creatingParentId === folder.id && isCreatingFolder && (
          <div 
            className="flex items-center py-1 px-2"
            style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
          >
            <div className="w-6 mr-1"></div>
            <Folder size={16} className="text-blue-500 mr-2" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder(folder.id);
                if (e.key === 'Escape') setIsCreatingFolder(false);
              }}
              autoFocus
              placeholder="New folder name"
              className="flex-1 py-0.5 px-1 border border-gray-300 rounded text-sm"
            />
            <Button 
              size="sm" 
              className="ml-1 h-6 text-xs" 
              onClick={() => handleCreateFolder(folder.id)}
            >
              Create
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-1 h-6 text-xs" 
              onClick={() => setIsCreatingFolder(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Folders</h3>
        {onFolderCreate && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => startCreatingFolder(null)}
          >
            <Plus size={14} className="mr-1" />
            New Folder
          </Button>
        )}
      </div>
      
      <div className="border rounded-md">
        {folders.map(folder => renderFolder(folder))}
        
        {isCreatingFolder && creatingParentId === null && (
          <div className="flex items-center py-1 px-2">
            <div className="w-6 mr-1"></div>
            <Folder size={16} className="text-blue-500 mr-2" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder(null);
                if (e.key === 'Escape') setIsCreatingFolder(false);
              }}
              autoFocus
              placeholder="New folder name"
              className="flex-1 py-0.5 px-1 border border-gray-300 rounded text-sm"
            />
            <Button 
              size="sm" 
              className="ml-1 h-6 text-xs" 
              onClick={() => handleCreateFolder(null)}
            >
              Create
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-1 h-6 text-xs" 
              onClick={() => setIsCreatingFolder(false)}
            >
              Cancel
            </Button>
          </div>
        )}
        
        {folders.length === 0 && !isCreatingFolder && (
          <div className="p-4 text-center text-gray-500 text-sm">
            <p>No folders yet</p>
            {onFolderCreate && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => startCreatingFolder(null)}
              >
                <FolderPlus size={14} className="mr-2" />
                Create Folder
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
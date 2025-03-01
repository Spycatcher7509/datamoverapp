
import React from 'react';
import { Folder, File, ChevronRight } from 'lucide-react';

interface FolderItemProps {
  name: string;
  path: string;
  isFolder?: boolean;
  onSelect: (path: string) => void;
}

const FolderItem = ({ name, path, isFolder = true, onSelect }: FolderItemProps) => {
  return (
    <button
      className="flex items-center w-full p-2 rounded-md hover:bg-muted text-left"
      onClick={() => onSelect(path)}
    >
      {isFolder ? (
        <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
      ) : (
        <File className="h-4 w-4 mr-2 text-muted-foreground" />
      )}
      <span className="truncate flex-1">{name}</span>
      {isFolder && <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />}
    </button>
  );
};

export default FolderItem;

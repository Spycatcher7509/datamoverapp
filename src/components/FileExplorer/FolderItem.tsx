
import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { generateMockFolderContents } from './folderUtils';

interface FolderItemProps {
  name: string;
  path: string;
  isFolder?: boolean;
  onSelect: (path: string) => void;
  depth?: number;
  isExpanded?: boolean;
}

const FolderItem = ({ 
  name, 
  path, 
  isFolder = true, 
  onSelect,
  depth = 0,
  isExpanded = false
}: FolderItemProps) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const [subItems, setSubItems] = useState<{name: string, path: string, isFolder: boolean}[]>([]);
  
  const handleToggleExpand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!expanded && subItems.length === 0) {
      // Fetch contents only when expanding for the first time
      const contents = generateMockFolderContents(path);
      setSubItems(contents);
    }
    
    setExpanded(!expanded);
  };
  
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(path);
  };
  
  return (
    <div className="w-full">
      <button
        className={cn(
          "flex items-center w-full p-2 rounded-md hover:bg-muted text-left",
          depth > 0 && "text-sm"
        )}
        onClick={handleSelect}
        style={{ paddingLeft: `${depth * 8 + 8}px` }}
      >
        {isFolder ? (
          <>
            <div onClick={handleToggleExpand} className="mr-1 text-muted-foreground">
              {expanded ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </div>
            <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
          </>
        ) : (
          <>
            <div className="w-5"></div> {/* Spacer to align with folders */}
            <File className="h-4 w-4 mr-2 text-muted-foreground" />
          </>
        )}
        <span className="truncate flex-1">{name}</span>
      </button>
      
      {isFolder && expanded && (
        <div className="pl-2">
          {subItems.map((item, index) => (
            <FolderItem
              key={index}
              name={item.name}
              path={item.path}
              isFolder={item.isFolder}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
          {subItems.length === 0 && (
            <div className="text-xs text-muted-foreground pl-10 py-2">
              Empty folder
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FolderItem;

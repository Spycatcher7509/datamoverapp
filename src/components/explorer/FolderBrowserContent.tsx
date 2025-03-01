
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import FolderItem from './FolderItem';

interface FolderItemData {
  name: string;
  path: string;
  isFolder: boolean;
}

interface FolderBrowserContentProps {
  isLoading: boolean;
  folderContents: FolderItemData[];
  onSelectFolder: (path: string) => void;
}

const FolderBrowserContent = ({
  isLoading,
  folderContents,
  onSelectFolder
}: FolderBrowserContentProps) => {
  if (isLoading) {
    return (
      <ScrollArea className="h-[250px]">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-[250px]">
      <div className="space-y-1 p-1">
        {folderContents.map((item, index) => (
          <FolderItem
            key={index}
            name={item.name}
            path={item.path}
            isFolder={item.isFolder}
            onSelect={item.isFolder ? onSelectFolder : () => {}}
          />
        ))}
        {folderContents.length === 0 && (
          <div className="p-2 text-center text-muted-foreground">
            No folders found
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default FolderBrowserContent;

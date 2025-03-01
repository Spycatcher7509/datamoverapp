
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import FolderItem from './FolderItem';
import { useQuery } from '@tanstack/react-query';
import { loadFolderContents } from './folderBrowserUtils';

interface FolderItemData {
  name: string;
  path: string;
  isFolder: boolean;
}

interface FolderBrowserContentProps {
  currentPath: string;
  onSelectFolder: (path: string) => void;
}

const FolderBrowserContent = ({
  currentPath,
  onSelectFolder
}: FolderBrowserContentProps) => {
  // Use React Query to fetch folder contents
  const { 
    data: folderContents = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['folderContents', currentPath],
    queryFn: () => loadFolderContents(currentPath),
    enabled: !!currentPath,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <ScrollArea className="h-[250px]">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <ScrollArea className="h-[250px]">
        <div className="p-4 text-center text-destructive">
          <p>Error loading folder contents</p>
          <p className="text-xs text-muted-foreground mt-1">{(error as Error).message}</p>
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

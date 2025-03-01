
import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FolderItem from './FolderItem';

interface FolderBrowserProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentPath: string;
  folderContents: {name: string, path: string, isFolder: boolean}[];
  folderHistory: string[];
  onFolderSelect: (folderPath: string) => void;
  onGoBack: () => void;
  onSelectFolder: () => void;
  label: string;
}

const FolderBrowser = ({
  isOpen,
  setIsOpen,
  currentPath,
  folderContents,
  folderHistory,
  onFolderSelect,
  onGoBack,
  onSelectFolder,
  label
}: FolderBrowserProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Browse Folders</DialogTitle>
          <DialogDescription>
            Select a folder for {label.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between py-2 px-4 bg-muted/50 rounded-md">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onGoBack}
              disabled={folderHistory.length <= 1}
            >
              Back
            </Button>
            <span className="text-xs truncate max-w-[200px]">{currentPath}</span>
          </div>
          
          <ScrollArea className="h-[350px]">
            <div className="space-y-1 p-1">
              {folderContents.map((item, index) => (
                <FolderItem
                  key={index}
                  name={item.name}
                  path={item.path}
                  isFolder={item.isFolder}
                  onSelect={item.isFolder ? onFolderSelect : () => {}}
                />
              ))}
              {folderContents.length === 0 && (
                <div className="p-2 text-center text-muted-foreground">
                  No folders found
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={onSelectFolder}
            >
              Select This Folder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FolderBrowser;


import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FolderBrowserHeader from './FolderBrowserHeader';
import FolderBrowserContent from './FolderBrowserContent';
import FolderBrowserFooter from './FolderBrowserFooter';
import { getPlatformRoot } from './folderBrowserUtils';

interface FolderBrowserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFolder: (path: string) => void;
  label: string;
}

const FolderBrowserDialog = ({ 
  isOpen, 
  onOpenChange, 
  onSelectFolder, 
  label 
}: FolderBrowserDialogProps) => {
  const [currentPath, setCurrentPath] = useState('');
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const [platformRoot, setPlatformRoot] = useState<string>('');

  // Initialize platform-specific root path
  useEffect(() => {
    const initPlatformRoot = async () => {
      const rootPath = await getPlatformRoot();
      setPlatformRoot(rootPath);
    };

    initPlatformRoot();
  }, []);

  // Initialize browser with root when opened
  useEffect(() => {
    if (isOpen && platformRoot && folderHistory.length === 0) {
      loadInitialFolder(platformRoot);
    }
  }, [isOpen, platformRoot, folderHistory.length]);

  const loadInitialFolder = (rootPath: string) => {
    setCurrentPath(rootPath);
    setFolderHistory([rootPath]);
  };

  const handleFolderSelect = (folderPath: string) => {
    setCurrentPath(folderPath);
    setFolderHistory([...folderHistory, folderPath]);
  };

  const handleGoBack = () => {
    if (folderHistory.length > 1) {
      const newHistory = [...folderHistory];
      newHistory.pop(); // Remove current path
      const previousPath = newHistory[newHistory.length - 1];
      
      setCurrentPath(previousPath);
      setFolderHistory(newHistory);
    }
  };

  const handleGoHome = () => {
    if (platformRoot) {
      loadInitialFolder(platformRoot);
    }
  };

  const handleSelectCurrentFolder = () => {
    onSelectFolder(currentPath);
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Browse Folders</DialogTitle>
        <DialogDescription>
          Select a folder for {label.toLowerCase()}
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col space-y-4">
        <FolderBrowserHeader 
          currentPath={currentPath}
          canGoBack={folderHistory.length > 1}
          onGoBack={handleGoBack}
          onGoHome={handleGoHome}
        />
        
        <FolderBrowserContent 
          currentPath={currentPath}
          onSelectFolder={handleFolderSelect}
        />
        
        <FolderBrowserFooter 
          onCancel={() => onOpenChange(false)}
          onSelect={handleSelectCurrentFolder}
        />
      </div>
    </DialogContent>
  );
};

export default FolderBrowserDialog;

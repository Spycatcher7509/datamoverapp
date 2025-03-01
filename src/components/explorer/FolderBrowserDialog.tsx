
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FolderBrowserHeader from './FolderBrowserHeader';
import FolderBrowserContent from './FolderBrowserContent';
import FolderBrowserFooter from './FolderBrowserFooter';
import { loadFolderContents, getPlatformRoot } from './folderBrowserUtils';

interface FolderItemData {
  name: string;
  path: string;
  isFolder: boolean;
}

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
  const [folderContents, setFolderContents] = useState<FolderItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const loadInitialFolder = async (rootPath: string) => {
    await browseFolderContents(rootPath);
    setCurrentPath(rootPath);
    setFolderHistory([rootPath]);
  };

  const browseFolderContents = async (folderPath: string) => {
    setIsLoading(true);
    
    try {
      const contents = await loadFolderContents(folderPath);
      setFolderContents(contents);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderSelect = async (folderPath: string) => {
    try {
      await browseFolderContents(folderPath);
      setCurrentPath(folderPath);
      setFolderHistory([...folderHistory, folderPath]);
    } catch (error) {
      console.error('Error browsing folder:', error);
    }
  };

  const handleGoBack = async () => {
    if (folderHistory.length > 1) {
      const newHistory = [...folderHistory];
      newHistory.pop(); // Remove current path
      const previousPath = newHistory[newHistory.length - 1];
      
      await browseFolderContents(previousPath);
      setCurrentPath(previousPath);
      setFolderHistory(newHistory);
    }
  };

  const handleGoHome = async () => {
    if (platformRoot) {
      await loadInitialFolder(platformRoot);
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
          isLoading={isLoading}
          folderContents={folderContents}
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

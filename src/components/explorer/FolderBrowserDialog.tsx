
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { environmentDetector } from '@/services/environmentDetector';
import FolderItem from './FolderItem';

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
  const [folderContents, setFolderContents] = useState<{name: string, path: string, isFolder: boolean}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [platformRoot, setPlatformRoot] = useState<string>('');

  // Initialize platform-specific root path
  useEffect(() => {
    const initPlatformRoot = async () => {
      try {
        if (environmentDetector.isReady()) {
          // Get home directory when using Tauri
          const homedir = await environmentDetector.tauriPath.homeDir();
          setPlatformRoot(homedir);
        } else {
          // Mock for web environment
          const platform = navigator.platform.toLowerCase();
          if (platform.includes('win')) {
            setPlatformRoot('C:\\');
          } else {
            setPlatformRoot('/home/user');
          }
        }
      } catch (error) {
        console.error('Failed to get platform root:', error);
        setPlatformRoot('/');
      }
    };

    initPlatformRoot();
  }, []);

  // Initialize browser with root when opened
  useEffect(() => {
    if (isOpen && platformRoot && folderHistory.length === 0) {
      loadFolderContents(platformRoot);
      setCurrentPath(platformRoot);
      setFolderHistory([platformRoot]);
    }
  }, [isOpen, platformRoot, folderHistory.length]);

  const loadFolderContents = async (folderPath: string) => {
    setIsLoading(true);
    
    try {
      if (environmentDetector.isReady()) {
        // Use Tauri FS API
        try {
          // Check if the path exists
          const exists = await environmentDetector.tauriFs.exists(folderPath);
          if (!exists) {
            console.error(`Path does not exist: ${folderPath}`);
            return;
          }

          // Read the directory contents
          const entries = await environmentDetector.tauriFs.readDir(folderPath, { recursive: false });
          
          // Convert entries to our format
          const formattedEntries = entries.map(entry => ({
            name: entry.name || 'Unknown',
            path: entry.path,
            isFolder: !!entry.children || entry.isDirectory
          }));
          
          // Sort folders first, then files
          formattedEntries.sort((a, b) => {
            if (a.isFolder === b.isFolder) {
              return a.name.localeCompare(b.name);
            }
            return a.isFolder ? -1 : 1;
          });
          
          setFolderContents(formattedEntries);
        } catch (error) {
          console.error('Error reading directory with Tauri:', error);
          generateMockFolderContents(folderPath);
        }
      } else {
        // Mock for web environment
        generateMockFolderContents(folderPath);
      }
    } catch (error) {
      console.error('Error loading folder contents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockFolderContents = (folderPath: string) => {
    // Generate mock folder structure for web preview
    let mockContents: {name: string, path: string, isFolder: boolean}[] = [];
    
    // Check if we're at the root level
    if (folderPath === '/' || folderPath === platformRoot) {
      mockContents = [
        { name: 'Documents', path: `${folderPath}/Documents`, isFolder: true },
        { name: 'Pictures', path: `${folderPath}/Pictures`, isFolder: true },
        { name: 'Downloads', path: `${folderPath}/Downloads`, isFolder: true },
        { name: 'Desktop', path: `${folderPath}/Desktop`, isFolder: true },
        { name: 'Applications', path: `${folderPath}/Applications`, isFolder: true },
      ];
    } else {
      // Generate some random subfolders and files
      const pathParts = folderPath.split(/[/\\]+/);
      const folderName = pathParts[pathParts.length - 1];
      
      // Generate subfolders based on the folder name
      if (folderName === 'Documents') {
        mockContents = [
          { name: 'Work', path: `${folderPath}/Work`, isFolder: true },
          { name: 'Personal', path: `${folderPath}/Personal`, isFolder: true },
          { name: 'budget.xlsx', path: `${folderPath}/budget.xlsx`, isFolder: false },
          { name: 'report.docx', path: `${folderPath}/report.docx`, isFolder: false },
        ];
      } else if (folderName === 'Pictures') {
        mockContents = [
          { name: 'Vacation', path: `${folderPath}/Vacation`, isFolder: true },
          { name: 'Family', path: `${folderPath}/Family`, isFolder: true },
          { name: 'photo1.jpg', path: `${folderPath}/photo1.jpg`, isFolder: false },
          { name: 'photo2.jpg', path: `${folderPath}/photo2.jpg`, isFolder: false },
        ];
      } else if (folderName === 'Downloads') {
        mockContents = [
          { name: 'Software', path: `${folderPath}/Software`, isFolder: true },
          { name: 'app-installer.exe', path: `${folderPath}/app-installer.exe`, isFolder: false },
          { name: 'document.pdf', path: `${folderPath}/document.pdf`, isFolder: false },
        ];
      } else {
        // For any other folder, generate generic content
        mockContents = [
          { name: 'Subfolder 1', path: `${folderPath}/Subfolder 1`, isFolder: true },
          { name: 'Subfolder 2', path: `${folderPath}/Subfolder 2`, isFolder: true },
          { name: 'file1.txt', path: `${folderPath}/file1.txt`, isFolder: false },
          { name: 'file2.txt', path: `${folderPath}/file2.txt`, isFolder: false },
        ];
      }
    }
    
    setFolderContents(mockContents);
  };

  const handleFolderSelect = async (folderPath: string) => {
    try {
      await loadFolderContents(folderPath);
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
      
      await loadFolderContents(previousPath);
      setCurrentPath(previousPath);
      setFolderHistory(newHistory);
    }
  };

  const handleGoHome = async () => {
    if (platformRoot) {
      await loadFolderContents(platformRoot);
      setCurrentPath(platformRoot);
      setFolderHistory([platformRoot]);
    }
  };

  const handleSelectCurrentFolder = () => {
    onSelectFolder(currentPath);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Browse Folders</DialogTitle>
          <DialogDescription>
            Select a folder for {label.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between py-2 px-4 bg-muted/50 rounded-md">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoBack}
                disabled={folderHistory.length <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoHome}
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Button>
            </div>
            <span className="text-xs truncate max-w-[200px]">{currentPath}</span>
          </div>
          
          <ScrollArea className="h-[250px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-1 p-1">
                {folderContents.map((item, index) => (
                  <FolderItem
                    key={index}
                    name={item.name}
                    path={item.path}
                    isFolder={item.isFolder}
                    onSelect={item.isFolder ? handleFolderSelect : () => {}}
                  />
                ))}
                {folderContents.length === 0 && (
                  <div className="p-2 text-center text-muted-foreground">
                    No folders found
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSelectCurrentFolder}
            >
              Select This Folder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FolderBrowserDialog;

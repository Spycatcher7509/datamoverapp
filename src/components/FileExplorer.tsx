
import React, { useState, useEffect } from 'react';
import { Folder, X, AlertCircle, ChevronRight, File, ChevronLeft, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { environmentDetector } from '@/services/environmentDetector';

type FileExplorerProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showError?: boolean;
  errorMessage?: string;
};

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

const FileExplorer = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Select a folder",
  showError = false,
  errorMessage = "This field is required"
}: FileExplorerProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  // Try to use Tauri's native file dialogs when available
  const handleBrowse = async () => {
    try {
      // Check if we're running in Tauri
      if (environmentDetector.isReady()) {
        try {
          // Use Tauri dialog API
          const dialog = await import('@tauri-apps/api/dialog');
          // Open a folder selection dialog
          const selected = await dialog.open({
            directory: true,
            multiple: false,
            title: `Select ${label}`
          });
          
          // If a folder was selected (not cancelled), update the state
          if (selected && !Array.isArray(selected)) {
            onChange(selected);
          }
        } catch (e) {
          console.error('Error with Tauri dialog:', e);
          // Try to open our custom folder browser dialog
          openFolderBrowser();
        }
      } else {
        // Use custom folder browser for web
        openFolderBrowser();
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      openFolderBrowser();
    }
  };

  const openFolderBrowser = async () => {
    setIsDialogOpen(true);
    setIsLoading(true);
    
    try {
      // Initialize with platform root
      const rootPath = platformRoot || '/';
      await loadFolderContents(rootPath);
      setCurrentPath(rootPath);
      setFolderHistory([rootPath]);
    } catch (error) {
      console.error('Error opening folder browser:', error);
      // Fallback to common locations if we can't get the platform root
      const commonLocations = [
        { name: 'Home', path: platformRoot || '/home/user', isFolder: true },
        { name: 'Documents', path: `${platformRoot}/Documents`, isFolder: true },
        { name: 'Desktop', path: `${platformRoot}/Desktop`, isFolder: true },
        { name: 'Downloads', path: `${platformRoot}/Downloads`, isFolder: true },
      ];
      
      setFolderContents(commonLocations);
      setCurrentPath('/');
      setFolderHistory(['/']);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSelectFolder = () => {
    onChange(currentPath);
    setIsDialogOpen(false);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="space-y-2 animated-panel">
      <div className="flex items-center justify-between">
        <label 
          htmlFor={id} 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
        {showError && (
          <div className="flex items-center text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            {errorMessage}
          </div>
        )}
      </div>
      
      <div 
        className={cn(
          "relative flex items-center w-full rounded-md border border-input bg-background ring-offset-background",
          isFocused ? "ring-2 ring-ring ring-offset-2" : "",
          showError ? "border-destructive" : ""
        )}
      >
        <div className="flex items-center absolute left-2.5 pointer-events-none">
          <Folder className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="h-10 pl-9 pr-20 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        
        <div className="absolute right-1.5 flex space-x-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium"
                onClick={handleBrowse}
              >
                Browse
              </Button>
            </DialogTrigger>
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
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSelectFolder}
                  >
                    Select This Folder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;

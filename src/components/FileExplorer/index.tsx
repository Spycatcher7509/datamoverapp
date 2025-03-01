
import React, { useState } from 'react';
import { Folder, X, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DialogTrigger } from "@/components/ui/dialog";
import FolderBrowser from './FolderBrowser';
import { generateMockFolderContents, getMockRootFolders } from './folderUtils';

type FileExplorerProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showError?: boolean;
  errorMessage?: string;
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

  // Try to use Tauri's native file dialogs when available
  const handleBrowse = async () => {
    try {
      // Check if we're running in Tauri
      const isTauri = typeof window !== 'undefined' && 
                      window !== null && 
                      // @ts-ignore - Tauri types
                      window.__TAURI__ !== undefined;
      
      if (isTauri) {
        try {
          // Dynamically import Tauri dialog API
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
    
    // Initialize with mock root folders
    const mockRootFolders = getMockRootFolders();
    
    setCurrentPath('/');
    setFolderContents(mockRootFolders);
    setFolderHistory(['/']);
  };

  const handleFolderSelect = async (folderPath: string) => {
    try {
      // In a real implementation, we would use Tauri's fs API to read the folder contents
      // For now, we'll simulate with mock data
      setCurrentPath(folderPath);
      setFolderHistory([...folderHistory, folderPath]);
      
      setFolderContents(generateMockFolderContents(folderPath));
    } catch (error) {
      console.error('Error browsing folder:', error);
    }
  };

  const handleGoBack = () => {
    if (folderHistory.length > 1) {
      const newHistory = [...folderHistory];
      newHistory.pop(); // Remove current path
      const previousPath = newHistory[newHistory.length - 1];
      
      setCurrentPath(previousPath);
      setFolderHistory(newHistory);
      
      setFolderContents(generateMockFolderContents(previousPath));
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
        </div>
      </div>
      
      <FolderBrowser
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        currentPath={currentPath}
        folderContents={folderContents}
        folderHistory={folderHistory}
        onFolderSelect={handleFolderSelect}
        onGoBack={handleGoBack}
        onSelectFolder={handleSelectFolder}
        label={label}
      />
    </div>
  );
};

export default FileExplorer;

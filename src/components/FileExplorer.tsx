
import React, { useState } from 'react';
import { Folder, X, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

  // Try to use Tauri's native file dialogs when available
  const handleBrowse = async () => {
    try {
      // Check if we're running in Tauri
      const isTauri = typeof window !== 'undefined' && 
                      window !== null && 
                      // @ts-ignore - Tauri types
                      window.__TAURI__ !== undefined;
      
      if (isTauri) {
        // In a real Tauri app, this would use Tauri's dialog API
        // But we'll use mock behavior for now until Tauri is properly set up
        console.log('Tauri detected, but using mock folder selection since Tauri APIs are not available');
        const mockPath = `/Users/user/Documents/Sample${Math.floor(Math.random() * 100)}`;
        onChange(mockPath);
      } else {
        // Fallback for web - simulate folder selection
        console.log('Running in web mode - using mock folder selection');
        const mockPath = `/Users/user/Documents/Sample${Math.floor(Math.random() * 100)}`;
        onChange(mockPath);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      // Fallback for errors
      const mockPath = `/Users/user/Documents/Sample${Math.floor(Math.random() * 100)}`;
      onChange(mockPath);
    }
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
        <div className="form-input-icon">
          <Folder className="file-folder-icon" />
        </div>
        
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="h-10 pl-10 pr-20 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-medium"
            onClick={handleBrowse}
          >
            Browse
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;

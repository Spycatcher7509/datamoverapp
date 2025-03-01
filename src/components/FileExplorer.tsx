
import React, { useState } from 'react';
import { Folder, X, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import FolderBrowserDialog from './explorer/FolderBrowserDialog';
import { openNativeDirectoryDialog } from './explorer/folderBrowserService';
import { toast } from 'sonner';

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

  const handleBrowse = async () => {
    try {
      // Try native dialog first
      const selectedPath = await openNativeDirectoryDialog(label);
      
      if (selectedPath) {
        // Use the native dialog selection
        onChange(selectedPath);
        toast.success(`Selected folder: ${selectedPath}`);
      } else {
        // Fall back to our custom dialog
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error browsing folder:', error);
      toast.error(`Error browsing folder: ${(error as Error).message}`);
      // Fall back to our custom dialog
      setIsDialogOpen(true);
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <FolderBrowserDialog 
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSelectFolder={(selectedPath) => {
            onChange(selectedPath);
            toast.success(`Selected folder: ${selectedPath}`);
          }}
          label={label}
        />
      </Dialog>
    </div>
  );
};

export default FileExplorer;

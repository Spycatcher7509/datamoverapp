
import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FolderBrowserHeaderProps {
  currentPath: string;
  canGoBack: boolean;
  onGoBack: () => void;
  onGoHome: () => void;
}

const FolderBrowserHeader = ({
  currentPath,
  canGoBack,
  onGoBack,
  onGoHome
}: FolderBrowserHeaderProps) => {
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-muted/50 rounded-md">
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onGoBack}
          disabled={!canGoBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onGoHome}
        >
          <Home className="h-4 w-4 mr-1" />
          Home
        </Button>
      </div>
      <span className="text-xs truncate max-w-[200px]">{currentPath}</span>
    </div>
  );
};

export default FolderBrowserHeader;

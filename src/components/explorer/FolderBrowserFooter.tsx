
import React from 'react';
import { Button } from "@/components/ui/button";

interface FolderBrowserFooterProps {
  onCancel: () => void;
  onSelect: () => void;
}

const FolderBrowserFooter = ({
  onCancel,
  onSelect
}: FolderBrowserFooterProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-2">
      <Button 
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        onClick={onSelect}
      >
        Select This Folder
      </Button>
    </div>
  );
};

export default FolderBrowserFooter;

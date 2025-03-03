
import React, { useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import FolderBrowserDialog from './explorer/FolderBrowserDialog';

const FolderSelector: React.FC = () => {
  const [folder, setFolder] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectFolder = async () => {
    try {
      const selectedFolder = await open({
        directory: true,
        multiple: false,
        defaultPath: "/Users/dassgehtdichnichtan/datamoverapp"
      });
      if (selectedFolder && typeof selectedFolder === 'string') {
        setFolder(selectedFolder);
        console.log('Selected folder:', selectedFolder);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleFolderSelect = (path: string) => {
    setFolder(path);
    console.log('Selected folder from browser:', path);
  };

  return (
    <div className="p-4 border rounded-md">
      <Button onClick={() => setDialogOpen(true)} className="mb-2">Browse Folders</Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <FolderBrowserDialog 
          isOpen={dialogOpen} 
          onOpenChange={setDialogOpen}
          onSelectFolder={handleFolderSelect}
          label="File Explorer"
        />
      </Dialog>
      
      {folder && <p className="mt-2">Selected Folder: {folder}</p>}
    </div>
  );
};

export default FolderSelector;

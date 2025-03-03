
import React, { useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { Button } from '@/components/ui/button';

const FolderSelector: React.FC = () => {
  const [folder, setFolder] = useState<string | null>(null);

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

  return (
    <div className="p-4 border rounded-md">
      <Button onClick={handleSelectFolder} className="mb-2">Select Folder</Button>
      {folder && <p className="mt-2">Selected Folder: {folder}</p>}
    </div>
  );
};

export default FolderSelector;

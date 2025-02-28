
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { FileIcon, FolderIcon, FolderSyncIcon, PauseIcon, PlayIcon } from 'lucide-react';
import AppCard from './AppCard';
import FileExplorer from './FileExplorer';
import PollingControl from './PollingControl';
import SyncStatus, { SyncState } from './SyncStatus';
import { fileSyncService, SyncConfig, SyncStatus as SyncStatusType } from '../services/fileSyncService';

const FileSyncApp = () => {
  // App state
  const [sourceFolder, setSourceFolder] = useState<string>('');
  const [destinationFolder, setDestinationFolder] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<number>(5);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>({ state: 'idle' });
  const [validationErrors, setValidationErrors] = useState<{
    source?: boolean;
    destination?: boolean;
  }>({});

  // Handle status updates from the sync service
  const handleStatusChange = (status: SyncStatusType) => {
    setSyncStatus(status);
  };

  // Start/stop sync based on configuration changes
  useEffect(() => {
    // If not enabled, don't start sync
    if (!isEnabled) {
      fileSyncService.stopPolling();
      return;
    }
    
    // Validate required fields
    const errors = {
      source: !sourceFolder,
      destination: !destinationFolder
    };
    
    setValidationErrors(errors);
    
    // If any errors, don't start sync
    if (errors.source || errors.destination) {
      return;
    }
    
    // Configuration is valid, start sync
    const config: SyncConfig = {
      sourceFolder,
      destinationFolder,
      pollingInterval,
      enabled: isEnabled
    };
    
    fileSyncService.startPolling(config, handleStatusChange);
    
    // Clean up on unmount
    return () => {
      fileSyncService.stopPolling();
    };
  }, [sourceFolder, destinationFolder, pollingInterval, isEnabled]);

  const toggleSync = () => {
    setIsEnabled(prev => !prev);
  };

  return (
    <AppCard>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <FolderSyncIcon className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">File Sync</h1>
        </div>
        
        <SyncStatus 
          state={syncStatus.state} 
          message={syncStatus.message}
          lastSync={syncStatus.lastSync} 
        />
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-4">
        <FileExplorer
          id="source-folder"
          label="Source Folder"
          value={sourceFolder}
          onChange={setSourceFolder}
          placeholder="Select source folder to monitor"
          showError={validationErrors.source}
          errorMessage="Source folder is required"
        />
        
        <FileExplorer
          id="destination-folder"
          label="Destination Folder"
          value={destinationFolder}
          onChange={setDestinationFolder}
          placeholder="Select destination folder"
          showError={validationErrors.destination}
          errorMessage="Destination folder is required"
        />
        
        <PollingControl
          value={pollingInterval}
          onChange={setPollingInterval}
        />
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={isEnabled} 
            onCheckedChange={toggleSync}
            id="sync-toggle"
          />
          <label 
            htmlFor="sync-toggle" 
            className="text-sm font-medium leading-none cursor-pointer"
          >
            {isEnabled ? 'Monitoring active' : 'Start monitoring'}
          </label>
        </div>
        
        <Button
          variant={isEnabled ? "outline" : "default"}
          size="sm"
          onClick={toggleSync}
          className="flex items-center space-x-1 h-8"
        >
          {isEnabled ? (
            <>
              <PauseIcon className="h-3.5 w-3.5 mr-1" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <PlayIcon className="h-3.5 w-3.5 mr-1" />
              <span>Start</span>
            </>
          )}
        </Button>
      </div>
    </AppCard>
  );
};

export default FileSyncApp;

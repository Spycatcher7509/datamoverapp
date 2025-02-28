
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, FileIcon, FolderIcon, FolderSyncIcon, PauseIcon, PlayIcon, RefreshCw } from 'lucide-react';
import { toast } from "sonner";
import AppCard from './AppCard';
import FileExplorer from './FileExplorer';
import PollingControl from './PollingControl';
import SyncStatus from './SyncStatus';
import { fileSyncService, SyncConfig, SyncStatus as SyncStatusType } from '../services/fileSyncService';

const FileSyncApp = () => {
  // App state
  const [sourceFolder, setSourceFolder] = useState<string>('');
  const [destinationFolder, setDestinationFolder] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<number>(5);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>({ state: 'idle' });
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    source?: boolean;
    destination?: boolean;
    same?: boolean;
  }>({});

  // Handle status updates from the sync service
  const handleStatusChange = (status: SyncStatusType) => {
    setSyncStatus(status);
    
    // If we got an error, also disable the sync
    if (status.state === 'error') {
      setIsEnabled(false);
    }
  };

  // Validate configuration
  const validateConfig = () => {
    const errors = {
      source: !sourceFolder,
      destination: !destinationFolder,
      same: sourceFolder === destinationFolder && sourceFolder !== ''
    };
    
    setValidationErrors(errors);
    
    // If there are errors, show toast with most important error
    if (errors.source || errors.destination || errors.same) {
      if (errors.same) {
        toast.error("Source and destination folders must be different");
      } else if (errors.source && errors.destination) {
        toast.error("Source and destination folders are required");
      } else if (errors.source) {
        toast.error("Source folder is required");
      } else if (errors.destination) {
        toast.error("Destination folder is required");
      }
      return false;
    }
    
    return true;
  };

  // Start/stop sync based on configuration changes
  useEffect(() => {
    // If not enabled, don't start sync
    if (!isEnabled) {
      fileSyncService.stopPolling();
      return;
    }
    
    // Validate required fields
    if (!validateConfig()) {
      setIsEnabled(false);
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
    // If turning on sync, validate first
    if (!isEnabled && !validateConfig()) {
      return;
    }
    
    setIsEnabled(prev => !prev);
    
    // Show feedback to user
    if (!isEnabled) {
      toast.success("Sync monitoring started");
    } else {
      toast.info("Sync monitoring stopped");
    }
  };

  const handleManualSync = async () => {
    // Validate config first
    if (!validateConfig()) {
      return;
    }
    
    setIsManualSyncing(true);
    
    try {
      const config: SyncConfig = {
        sourceFolder,
        destinationFolder,
        pollingInterval,
        enabled: isEnabled
      };
      
      await fileSyncService.manualSync(config, handleStatusChange);
    } catch (error) {
      toast.error("Failed to manually sync files");
    } finally {
      setIsManualSyncing(false);
    }
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
          showError={validationErrors.destination || validationErrors.same}
          errorMessage={validationErrors.same ? "Must be different from source" : "Destination folder is required"}
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
            disabled={syncStatus.state === 'error'}
          />
          <label 
            htmlFor="sync-toggle" 
            className="text-sm font-medium leading-none cursor-pointer"
          >
            {isEnabled ? 'Monitoring active' : 'Start monitoring'}
          </label>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSync}
            disabled={isManualSyncing || syncStatus.state === 'syncing'}
            className="h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isManualSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </Button>
          
          <Button
            variant={isEnabled ? "outline" : "default"}
            size="sm"
            onClick={toggleSync}
            className="flex items-center space-x-1 h-8"
            disabled={syncStatus.state === 'error'}
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
      </div>
      
      {syncStatus.state === 'error' && (
        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Sync Error</p>
            <p className="text-xs mt-1">{syncStatus.error || "Unknown error occurred"}</p>
            <Button 
              variant="destructive" 
              size="sm" 
              className="mt-2 h-7 text-xs" 
              onClick={() => setSyncStatus({ state: 'idle' })}
            >
              Clear Error
            </Button>
          </div>
        </div>
      )}
    </AppCard>
  );
};

export default FileSyncApp;

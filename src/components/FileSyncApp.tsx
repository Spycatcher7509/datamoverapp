
import { useEffect, useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import AppCard from './AppCard';
import SyncHeader from './SyncHeader';
import SyncControls from './SyncControls';
import SyncErrorMessage from './SyncErrorMessage';
import FolderConfigForm from './FolderConfigForm';
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

  const handleClearError = () => {
    setSyncStatus({ state: 'idle' });
  };

  return (
    <AppCard>
      <SyncHeader syncStatus={syncStatus} />
      
      <Separator className="my-4" />
      
      <FolderConfigForm
        sourceFolder={sourceFolder}
        setSourceFolder={setSourceFolder}
        destinationFolder={destinationFolder}
        setDestinationFolder={setDestinationFolder}
        pollingInterval={pollingInterval}
        setPollingInterval={setPollingInterval}
        validationErrors={validationErrors}
      />
      
      <Separator className="my-4" />
      
      <SyncControls
        isEnabled={isEnabled}
        toggleSync={toggleSync}
        handleManualSync={handleManualSync}
        isManualSyncing={isManualSyncing}
        syncStatus={syncStatus}
      />
      
      <SyncErrorMessage 
        syncStatus={syncStatus}
        onClearError={handleClearError}
      />
    </AppCard>
  );
};

export default FileSyncApp;

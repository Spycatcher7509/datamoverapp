
import { useEffect, useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import AppCard from './AppCard';
import SyncHeader from './SyncHeader';
import SyncControls from './SyncControls';
import SyncErrorMessage from './SyncErrorMessage';
import FolderConfigForm from './FolderConfigForm';
import { fileSyncService } from '../services/fileSyncService';
import { SyncConfig, SyncStatus as SyncStatusType } from '../services/types';

const FileSyncApp = () => {
  // App state with safe defaults
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

  // First effect to handle stopping polling when sync is disabled
  useEffect(() => {
    if (!isEnabled) {
      fileSyncService.stopPolling();
    }
  }, [isEnabled]);
  
  // Second effect to handle starting polling when config changes
  useEffect(() => {
    // If not enabled, don't start sync
    if (!isEnabled) {
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
    
    // Clean up on unmount or when dependencies change
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

  // Adding try-catch to protect the render
  try {
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
  } catch (error) {
    console.error("Render error in FileSyncApp:", error);
    return <div className="p-6 text-red-500">An error occurred while rendering the application. Please check the console for details.</div>;
  }
};

export default FileSyncApp;

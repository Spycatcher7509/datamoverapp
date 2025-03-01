
import { useEffect } from 'react';
import { Separator } from "@/components/ui/separator";
import AppCard from './AppCard';
import SyncHeader from './SyncHeader';
import SyncControls from './SyncControls';
import SyncErrorMessage from './SyncErrorMessage';
import FolderConfigForm from './FolderConfigForm';
import { fileSyncService } from '../services/fileSyncService';
import { useSyncConfig } from '../hooks/useSyncConfig';
import { useSyncValidation } from '../hooks/useSyncValidation';
import { useSyncOperations } from '../hooks/useSyncOperations';

const FileSyncApp = () => {
  // Use custom hooks for state management
  const {
    sourceFolder,
    setSourceFolder,
    destinationFolder,
    setDestinationFolder,
    pollingInterval,
    setPollingInterval,
    isEnabled,
    setIsEnabled,
    getConfig
  } = useSyncConfig();

  const { validationErrors, validateConfig } = useSyncValidation();

  const {
    syncStatus,
    isManualSyncing,
    toggleSync,
    handleManualSync,
    handleClearError,
    handleStatusChange
  } = useSyncOperations(isEnabled, setIsEnabled);

  // Start/stop sync based on configuration changes
  useEffect(() => {
    // If not enabled, don't start sync
    if (!isEnabled) {
      fileSyncService.stopPolling();
      return;
    }
    
    // Validate required fields
    if (!validateConfig(sourceFolder, destinationFolder)) {
      setIsEnabled(false);
      return;
    }
    
    // Configuration is valid, start sync
    const config = getConfig();
    fileSyncService.startPolling(config, handleStatusChange);
    
  }, [sourceFolder, destinationFolder, pollingInterval, isEnabled, validateConfig, getConfig, handleStatusChange, setIsEnabled]);

  // UI event handlers
  const handleToggleSync = () => {
    const isValid = validateConfig(sourceFolder, destinationFolder);
    toggleSync(getConfig(), isValid);
  };

  const handleSyncNow = async () => {
    if (!validateConfig(sourceFolder, destinationFolder)) {
      return;
    }
    
    await handleManualSync(getConfig());
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
        toggleSync={handleToggleSync}
        handleManualSync={handleSyncNow}
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


import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { fileSyncService } from '../services/fileSyncService';
import type { SyncConfig, SyncStatus } from '../services/types';

export function useSyncOperations(isEnabled: boolean, setIsEnabled: (value: boolean) => void) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: 'idle' });
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);

  // Handle status updates from the sync service
  const handleStatusChange = useCallback((status: SyncStatus) => {
    setSyncStatus(status);
    
    // If we got an error, also disable the sync
    if (status.state === 'error') {
      setIsEnabled(false);
    }
  }, [setIsEnabled]);

  const startSync = useCallback((config: SyncConfig) => {
    fileSyncService.startPolling(config, handleStatusChange);
    
    // Show feedback to user
    toast.success("Sync monitoring started");
  }, [handleStatusChange]);

  const stopSync = useCallback(() => {
    fileSyncService.stopPolling();
    
    // Show feedback to user
    toast.info("Sync monitoring stopped");
  }, []);

  const toggleSync = useCallback((config: SyncConfig, isValid: boolean) => {
    // If turning on sync, validate first
    if (!isEnabled && !isValid) {
      return;
    }
    
    if (!isEnabled) {
      startSync(config);
    } else {
      stopSync();
    }
    
    setIsEnabled(!isEnabled);
  }, [isEnabled, startSync, stopSync, setIsEnabled]);

  const handleManualSync = useCallback(async (config: SyncConfig) => {
    setIsManualSyncing(true);
    
    try {
      await fileSyncService.manualSync(config, handleStatusChange);
    } catch (error) {
      toast.error("Failed to manually sync files");
    } finally {
      setIsManualSyncing(false);
    }
  }, [handleStatusChange]);

  const handleClearError = useCallback(() => {
    setSyncStatus({ state: 'idle' });
  }, []);

  // Clean up effect
  useEffect(() => {
    return () => {
      fileSyncService.stopPolling();
    };
  }, []);

  return {
    syncStatus,
    isManualSyncing,
    toggleSync,
    handleManualSync,
    handleClearError,
    handleStatusChange
  };
}

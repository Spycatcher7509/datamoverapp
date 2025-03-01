
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { fileSyncService } from '../services/fileSyncService';
import type { SyncConfig } from '../services/types';
import { useSyncStatus } from './useSyncStatus';

export function useSyncOperations(isEnabled: boolean, setIsEnabled: (value: boolean) => void) {
  const { syncStatus, handleStatusChange, handleClearError } = useSyncStatus(setIsEnabled);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);

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


import { useState, useCallback } from 'react';
import { toast } from "sonner";
import type { SyncStatus } from '../services/types';

export function useSyncStatus(setIsEnabled: (value: boolean) => void) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: 'idle' });

  // Handle status updates from the sync service
  const handleStatusChange = useCallback((status: SyncStatus) => {
    setSyncStatus(status);
    
    // If we got an error, also disable the sync
    if (status.state === 'error') {
      setIsEnabled(false);
    }
  }, [setIsEnabled]);

  const handleClearError = useCallback(() => {
    setSyncStatus({ state: 'idle' });
  }, []);

  return {
    syncStatus,
    handleStatusChange,
    handleClearError
  };
}

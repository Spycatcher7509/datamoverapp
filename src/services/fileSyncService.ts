
import { toast } from "sonner";
import { SyncConfig, SyncStatus } from './types';
import { configValidator } from './configValidator';
import { pollingService } from './pollingService';
import { syncOperations } from './syncOperations';

// Re-export types so consumer imports don't need to change
export type { SyncConfig, SyncStatus } from './types';

class FileSyncService {
  // Start the polling process
  startPolling(config: SyncConfig, onStatusChange: (status: SyncStatus) => void) {
    pollingService.startPolling(config, onStatusChange);
  }

  // Stop the polling process
  stopPolling() {
    pollingService.stopPolling();
  }

  // Reset synced files tracking
  resetSyncedFiles() {
    syncOperations.resetSyncedFiles();
  }

  // Perform a single sync operation
  async performSync(config: SyncConfig, onStatusChange: (status: SyncStatus) => void): Promise<void> {
    return syncOperations.performSync(config, onStatusChange);
  }

  // Manually trigger a sync
  async manualSync(config: SyncConfig, onStatusChange: (status: SyncStatus) => void): Promise<void> {
    if (!config || !onStatusChange) {
      console.error('Invalid config or status callback');
      return;
    }
    
    try {
      // Clear previously synced files to force re-sync
      this.resetSyncedFiles();
      
      // If a poll is already in progress, cancel it
      if (pollingService.timerId) {
        this.stopPolling();
      }
      
      // Perform a sync
      await this.performSync(config, onStatusChange);
      
      // If enabled, restart polling
      if (config.enabled) {
        this.startPolling(config, onStatusChange);
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      onStatusChange({
        state: 'error',
        error: error instanceof Error ? error.message : 'Manual sync failed',
        lastSync: syncOperations.lastSyncTime ? syncOperations.lastSyncTime.toLocaleTimeString() : undefined
      });
      
      toast.error('Manual sync failed');
    }
  }
}

// Create and export a singleton instance
export const fileSyncService = new FileSyncService();

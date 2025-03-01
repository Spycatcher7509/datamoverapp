
import { toast } from "sonner";
import { SyncConfig, SyncStatus } from './types';
import { fileOperations } from './fileOperations';
import { configValidator } from './configValidator';

// Re-export types so consumer imports don't need to change
export type { SyncConfig, SyncStatus } from './types';

class FileSyncService {
  timerId: number | null = null;
  lastSyncTime: Date | null = null;
  sourceFiles: string[] = [];
  syncedFiles: Set<string> = new Set();

  // Start the polling process
  startPolling(config: SyncConfig, onStatusChange: (status: SyncStatus) => void) {
    if (!configValidator.validateConfig(config, onStatusChange)) {
      return;
    }

    if (this.timerId) {
      this.stopPolling();
    }

    if (!config.enabled) {
      onStatusChange({ state: 'idle' });
      return;
    }

    // Convert seconds to milliseconds
    const intervalMs = Number(config.pollingInterval) * 1000;

    // Initial status update
    onStatusChange({ state: 'polling' });

    try {
      // Perform immediate sync
      this.performSync(config, onStatusChange);

      // Set up polling interval
      this.timerId = window.setInterval(() => {
        this.performSync(config, onStatusChange);
      }, intervalMs);
    } catch (error) {
      console.error('Error starting polling:', error);
      onStatusChange({
        state: 'error',
        error: error instanceof Error ? error.message : 'Failed to start monitoring'
      });
    }
  }

  // Stop the polling process
  stopPolling() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // Reset synced files tracking
  resetSyncedFiles() {
    this.syncedFiles.clear();
  }

  // Perform a single sync operation
  async performSync(config: SyncConfig, onStatusChange: (status: SyncStatus) => void): Promise<void> {
    if (!config || !onStatusChange) {
      console.error('Invalid config or status callback');
      return;
    }

    // First update status to polling
    onStatusChange({ state: 'polling' });

    try {
      // Validate config again (in case it changed)
      if (!configValidator.validateConfig(config)) {
        throw new Error('Invalid configuration');
      }

      // Get files from source directory
      this.sourceFiles = await fileOperations.readFiles(config.sourceFolder);
      
      // Find files that need to be synced (not in syncedFiles)
      const filesToSync = this.sourceFiles.filter(file => !this.syncedFiles.has(file));
      
      if (filesToSync.length > 0) {
        // Update status to syncing
        onStatusChange({ state: 'syncing' });
        
        // Track successful syncs
        let successCount = 0;
        let errorCount = 0;
        
        // Sync each file
        for (const file of filesToSync) {
          try {
            await fileOperations.syncFile(file, config.destinationFolder);
            this.syncedFiles.add(file);
            successCount++;
          } catch (error) {
            errorCount++;
            console.error(`Failed to sync file ${file}:`, error);
            // Continue with other files even if one fails
          }
        }
        
        this.lastSyncTime = new Date();
        // Format current time
        const timeString = this.lastSyncTime.toLocaleTimeString();
        
        if (errorCount > 0) {
          if (successCount > 0) {
            // Some succeeded, some failed
            onStatusChange({
              state: 'success',
              message: `Synced ${successCount} files, ${errorCount} failed`,
              lastSync: timeString,
              error: `${errorCount} files failed to sync`
            });
            
            toast.warning(`Synced ${successCount} files, but ${errorCount} failed`);
          } else {
            // All failed
            onStatusChange({
              state: 'error',
              message: `Failed to sync ${errorCount} files`,
              error: 'All file sync operations failed',
              lastSync: timeString
            });
            
            toast.error(`Failed to sync ${errorCount} files to destination`);
          }
        } else {
          // All succeeded
          onStatusChange({
            state: 'success',
            message: `Synced ${successCount} files`,
            lastSync: timeString
          });
          
          toast.success(`Synced ${successCount} files to destination`);
        }
      } else {
        // No changes found, update status to idle
        onStatusChange({
          state: 'idle',
          lastSync: this.lastSyncTime ? this.lastSyncTime.toLocaleTimeString() : undefined
        });
      }
    } catch (error) {
      // Handle errors
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      onStatusChange({
        state: 'error',
        error: errorMessage,
        lastSync: this.lastSyncTime ? this.lastSyncTime.toLocaleTimeString() : undefined
      });
      
      // Show error toast
      toast.error(`Sync error: ${errorMessage}`);
    }
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
      if (this.timerId) {
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
        lastSync: this.lastSyncTime ? this.lastSyncTime.toLocaleTimeString() : undefined
      });
      
      toast.error('Manual sync failed');
    }
  }
}

// Create and export a singleton instance
export const fileSyncService = new FileSyncService();

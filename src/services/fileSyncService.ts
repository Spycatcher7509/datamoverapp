
import { toast } from "sonner";
import { SyncConfig, SyncStatus } from './types';
import { fileOperations } from './fileOperations';

class FileSyncService {
  timerId: number | null = null;
  lastSyncTime: Date | null = null;
  sourceFiles: string[] = [];
  syncedFiles: Set<string> = new Set();

  constructor() {
    // Initialize is handled automatically 
    // by the environment detector when imported
  }

  // Start the polling process
  startPolling(config: SyncConfig, onStatusChange: (status: SyncStatus) => void) {
    if (this.timerId) {
      this.stopPolling();
    }

    if (!config.enabled) {
      onStatusChange({ state: 'idle' });
      return;
    }

    // Validate configuration
    if (!config.sourceFolder || !config.destinationFolder) {
      onStatusChange({ 
        state: 'error', 
        error: 'Source and destination folders must be specified' 
      });
      return;
    }

    // Make sure source and destination are different
    if (config.sourceFolder === config.destinationFolder) {
      onStatusChange({ 
        state: 'error', 
        error: 'Source and destination folders must be different' 
      });
      return;
    }

    // Convert seconds to milliseconds
    const intervalMs = config.pollingInterval * 1000;

    // Initial status update
    onStatusChange({ state: 'polling' });

    // Perform immediate sync
    this.performSync(config, onStatusChange);

    // Set up polling interval
    this.timerId = window.setInterval(() => {
      this.performSync(config, onStatusChange);
    }, intervalMs);
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
    // First update status to polling
    onStatusChange({ state: 'polling' });

    try {
      // Validate source and destination
      if (!config.sourceFolder || !config.destinationFolder) {
        throw new Error('Source and destination folders must be specified');
      }

      // Get files from source directory
      this.sourceFiles = await fileOperations.readFiles(config.sourceFolder);
      
      // Find files that need to be synced (not in syncedFiles)
      const filesToSync = this.sourceFiles.filter(file => !this.syncedFiles.has(file));
      
      if (filesToSync.length > 0) {
        // Update status to syncing
        onStatusChange({ state: 'syncing' });
        
        // Sync each file
        for (const file of filesToSync) {
          await fileOperations.syncFile(file, config.destinationFolder);
          // Mark as synced
          this.syncedFiles.add(file);
        }
        
        this.lastSyncTime = new Date();
        // Format current time
        const timeString = this.lastSyncTime.toLocaleTimeString();
        
        // Update status to success
        onStatusChange({
          state: 'success',
          message: `Synced ${filesToSync.length} files`,
          lastSync: timeString
        });
        
        // Show toast notification
        toast.success(`Synced ${filesToSync.length} files to destination`);
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
        error: errorMessage
      });
      
      // Show error toast
      toast.error(`Sync error: ${errorMessage}`);
    }
  }

  // Manually trigger a sync
  async manualSync(config: SyncConfig, onStatusChange: (status: SyncStatus) => void): Promise<void> {
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
  }
}

// Create and export a singleton instance
export const fileSyncService = new FileSyncService();

// Re-export types from the types module for backward compatibility
export { SyncConfig, SyncStatus } from './types';

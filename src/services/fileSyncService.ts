
import { toast } from "sonner";

// Types to represent our sync state
export type SyncState = 'idle' | 'polling' | 'syncing' | 'success' | 'error';

export interface SyncStatus {
  state: SyncState;
  message?: string;
  lastSync?: string;
  error?: string;
}

export interface SyncConfig {
  sourceFolder: string;
  destinationFolder: string;
  pollingInterval: number; // in seconds
  enabled: boolean;
}

class FileSyncService {
  private timerId: number | null = null;
  private mockFileCount = 0;
  
  constructor() {
    // Initialize with random files between 0-50
    this.mockFileCount = Math.floor(Math.random() * 50);
  }

  // Start the polling process
  startPolling(config: SyncConfig, onStatusChange: (status: SyncStatus) => void): void {
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
        message: 'Source and destination folders must be specified',
        error: 'Invalid configuration'
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
  stopPolling(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
  
  // Perform a single sync operation (mock implementation)
  private async performSync(config: SyncConfig, onStatusChange: (status: SyncStatus) => void): Promise<void> {
    // First update status to polling
    onStatusChange({ state: 'polling' });
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Random chance (1 in 10) to simulate an error
      if (Math.random() < 0.1) {
        throw new Error("Simulated random sync error");
      }
      
      // Simulate file check
      const hasChanges = Math.random() < 0.3; // 30% chance of finding changes
      
      if (hasChanges) {
        // Update status to syncing
        onStatusChange({ state: 'syncing' });
        
        // Simulate sync operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate synced files
        const filesMoved = Math.floor(Math.random() * 5) + 1;
        this.mockFileCount += filesMoved;
        
        // Format current time
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        // Update status to success
        onStatusChange({ 
          state: 'success', 
          message: `Synced ${filesMoved} files`,
          lastSync: timeString
        });
        
        // Show toast notification
        toast.success(`Synced ${filesMoved} files from source to destination`);
      } else {
        // No changes found, update status to idle
        onStatusChange({ 
          state: 'idle',
          lastSync: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      onStatusChange({ 
        state: 'error',
        message: 'Sync failed',
        error: errorMessage
      });
      
      // Show error toast
      toast.error(`Sync error: ${errorMessage}`);
      
      // Stop polling on error (optional, depends on requirements)
      this.stopPolling();
    }
  }
  
  // Get stats (mock implementation)
  getStats() {
    return {
      totalFiles: this.mockFileCount,
      lastSyncTime: new Date().toLocaleTimeString()
    };
  }
}

// Create and export a singleton instance
export const fileSyncService = new FileSyncService();

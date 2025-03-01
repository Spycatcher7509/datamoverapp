
import { SyncConfig, SyncStatus, SyncResult } from './types';
import { environmentDetector } from './environmentDetector';
import { copyFiles, getFilesToSync, resetSyncedFiles } from './fileOperations';

// Polling interval ID for background sync
let pollingIntervalId: NodeJS.Timeout | null = null;

// Keep track of the last sync time for polling logic
let lastSyncTime = 0;

/**
 * File sync service for managing file synchronization
 */
export const fileSyncService = {
  /**
   * Starts polling for file changes based on configuration
   */
  startPolling: (config: SyncConfig, statusCallback: (status: SyncStatus) => void) => {
    // Clear any existing polling
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    }
    
    // If not enabled, don't start
    if (!config.enabled) {
      statusCallback({ state: 'idle' });
      return;
    }
    
    lastSyncTime = Date.now();
    statusCallback({ 
      state: 'polling', 
      message: 'Monitoring for changes', 
      lastSyncTime
    });
    
    // Set polling interval in seconds
    const intervalMs = config.pollingInterval * 1000;
    
    pollingIntervalId = setInterval(async () => {
      try {
        // Check for files that need sync
        statusCallback({ state: 'checking' });
        
        // Check for files that need sync
        const filesToSync = await getFilesToSync(config);
        
        // If files need syncing, sync them
        if (filesToSync.length > 0) {
          statusCallback({ 
            state: 'syncing', 
            message: `Syncing ${filesToSync.length} files...`,
            filesCount: filesToSync.length 
          });
          
          const result = await copyFiles(config, filesToSync);
          
          lastSyncTime = Date.now();
          statusCallback({ 
            state: 'success', 
            message: `Synced ${result.syncedCount} files`, 
            lastSyncTime,
            lastSyncResult: result
          });
        } else {
          // No files to sync - still active
          statusCallback({ 
            state: 'polling', 
            message: 'Monitoring for changes', 
            lastSyncTime 
          });
        }
      } catch (error) {
        // Handle sync errors
        console.error('Sync error:', error);
        statusCallback({ 
          state: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error during sync'
        });
        
        // Stop polling on error
        if (pollingIntervalId) {
          clearInterval(pollingIntervalId);
          pollingIntervalId = null;
        }
      }
    }, intervalMs);
  },
  
  /**
   * Stops the polling/monitoring process
   */
  stopPolling: () => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    }
  },
  
  /**
   * Manually triggers a sync operation
   */
  manualSync: async (config: SyncConfig, statusCallback: (status: SyncStatus) => void): Promise<SyncResult> => {
    try {
      // Update status to checking
      statusCallback({ state: 'checking' });
      
      // Get files that need to be synced
      const filesToSync = await getFilesToSync(config);
      
      // Update status based on files to sync
      if (filesToSync.length === 0) {
        lastSyncTime = Date.now();
        statusCallback({ 
          state: 'success', 
          message: 'No files need syncing', 
          lastSyncTime
        });
        return { syncedCount: 0, errorCount: 0, details: [] };
      }
      
      // Update status to syncing
      statusCallback({ 
        state: 'syncing', 
        message: `Syncing ${filesToSync.length} files...`,
        filesCount: filesToSync.length 
      });
      
      // Perform the sync operation
      const result = await copyFiles(config, filesToSync);
      
      // Update status to complete
      lastSyncTime = Date.now();
      statusCallback({ 
        state: 'success', 
        message: `Synced ${result.syncedCount} files`, 
        lastSyncTime,
        lastSyncResult: result
      });
      
      return result;
    } catch (error) {
      // Handle and report errors
      console.error('Manual sync error:', error);
      statusCallback({ 
        state: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error during manual sync'
      });
      throw error;
    }
  },
  
  /**
   * Reset sync state - useful for testing or forcing a full sync
   */
  resetSync: async () => {
    await resetSyncedFiles();
    lastSyncTime = 0;
  }
};

// Re-export types for convenience
export type { SyncConfig, SyncStatus, SyncResult };

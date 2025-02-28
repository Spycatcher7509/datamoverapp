
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
  private lastSyncTime: Date | null = null;
  private isTauri: boolean = false;
  private sourceFiles: string[] = [];
  private syncedFiles: Set<string> = new Set();
  
  constructor() {
    // Check if we're running in Tauri on initialization
    this.initializeEnvironment();
  }
  
  private async initializeEnvironment() {
    try {
      this.isTauri = typeof window !== 'undefined' && 
                     window !== null && 
                     // @ts-ignore - Tauri types
                     window.__TAURI__ !== undefined;
      
      if (this.isTauri) {
        console.log('Running in Tauri environment, but using mock implementation since Tauri APIs are not available');
      } else {
        console.log('Running in web environment');
      }
    } catch (error) {
      console.error('Error initializing environment:', error);
      this.isTauri = false;
    }
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
  stopPolling(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
  
  // Read files from a directory
  private async readFiles(directory: string): Promise<string[]> {
    try {
      // Use mock implementation for now
      console.log('Using mock readFiles for directory:', directory);
      
      // Simulate 1-5 random files
      const fileCount = Math.floor(Math.random() * 5) + 1;
      const mockFiles = [];
      
      for (let i = 0; i < fileCount; i++) {
        mockFiles.push(`${directory}/file${i}.txt`);
      }
      
      return mockFiles;
    } catch (error) {
      console.error(`Error reading directory ${directory}:`, error);
      throw error;
    }
  }
  
  // Sync a single file from source to destination
  private async syncFile(sourcePath: string, destinationFolder: string): Promise<void> {
    try {
      // Mock implementation
      console.log(`Mock: Synced ${sourcePath} to ${destinationFolder}`);
      this.syncedFiles.add(sourcePath);
      
      // Simulate a random success/fail
      if (Math.random() > 0.9) {
        throw new Error('Random mock sync error');
      }
    } catch (error) {
      console.error(`Error syncing file ${sourcePath}:`, error);
      throw error;
    }
  }
  
  // Perform a single sync operation
  private async performSync(config: SyncConfig, onStatusChange: (status: SyncStatus) => void): Promise<void> {
    // First update status to polling
    onStatusChange({ state: 'polling' });
    
    try {
      // Get files from source directory
      this.sourceFiles = await this.readFiles(config.sourceFolder);
      
      // Find files that need to be synced (not in syncedFiles)
      const filesToSync = this.sourceFiles.filter(file => !this.syncedFiles.has(file));
      
      if (filesToSync.length > 0) {
        // Update status to syncing
        onStatusChange({ state: 'syncing' });
        
        // Sync each file
        for (const file of filesToSync) {
          await this.syncFile(file, config.destinationFolder);
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

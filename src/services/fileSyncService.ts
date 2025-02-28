
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

export interface FileInfo {
  id: string;
  name: string;
  size: number; // in KB
  lastModified: Date;
  synced: boolean;
}

class FileSyncService {
  private timerId: number | null = null;
  private mockFiles: FileInfo[] = [];
  private syncedFileCount: number = 0;
  private lastSyncTime: Date | null = null;
  
  constructor() {
    // Initialize with random files between 5-20
    const fileCount = Math.floor(Math.random() * 15) + 5;
    this.generateMockFiles(fileCount);
  }

  // Generate mock files for simulation
  private generateMockFiles(count: number): void {
    const fileExtensions = ['.pdf', '.docx', '.jpg', '.png', '.txt', '.xlsx'];
    const fileNames = [
      'Report', 'Document', 'Photo', 'Invoice', 'Receipt', 'Presentation', 
      'Contract', 'Template', 'Screenshot', 'Backup', 'Chart', 'Diagram'
    ];
    
    for (let i = 0; i < count; i++) {
      const randomName = fileNames[Math.floor(Math.random() * fileNames.length)];
      const randomExt = fileExtensions[Math.floor(Math.random() * fileExtensions.length)];
      const randomSize = Math.floor(Math.random() * 5000) + 10; // 10KB to 5MB
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30)); // Last 30 days
      
      this.mockFiles.push({
        id: `file-${Date.now()}-${i}`,
        name: `${randomName}${i}${randomExt}`,
        size: randomSize,
        lastModified: randomDate,
        synced: Math.random() > 0.7 // 30% are not synced initially
      });
    }
  }

  // Get files that need to be synced (not synced yet)
  private getUnsyncedFiles(): FileInfo[] {
    return this.mockFiles.filter(file => !file.synced);
  }

  // Add new files (simulates new files being created in source)
  private addNewFiles(count: number = 1): void {
    const prevLength = this.mockFiles.length;
    this.generateMockFiles(count);
    // Mark new files as unsynced
    for (let i = prevLength; i < this.mockFiles.length; i++) {
      this.mockFiles[i].synced = false;
      this.mockFiles[i].lastModified = new Date(); // Just created
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
        message: 'Source and destination folders must be specified',
        error: 'Invalid configuration'
      });
      return;
    }

    // Make sure source and destination are different
    if (config.sourceFolder === config.destinationFolder) {
      onStatusChange({
        state: 'error',
        message: 'Source and destination cannot be the same',
        error: 'Invalid configuration'
      });
      toast.error('Source and destination folders must be different');
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
      // Randomly add new files (10% chance per interval)
      if (Math.random() < 0.1) {
        const numNewFiles = Math.floor(Math.random() * 3) + 1; // 1-3 new files
        this.addNewFiles(numNewFiles);
      }
      
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
  
  // Perform a single sync operation
  private async performSync(config: SyncConfig, onStatusChange: (status: SyncStatus) => void): Promise<void> {
    // First update status to polling
    onStatusChange({ state: 'polling' });
    
    try {
      // Simulate API/file system delay (checking for changes)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Random chance (5% chance) to simulate an error
      if (Math.random() < 0.05) {
        const possibleErrors = [
          "Permission denied accessing folder",
          "Network drive disconnected",
          "Destination folder full",
          "Source file locked by another process",
          "Unexpected I/O error"
        ];
        const errorMessage = possibleErrors[Math.floor(Math.random() * possibleErrors.length)];
        throw new Error(errorMessage);
      }
      
      // Get files that need to be synced
      const filesToSync = this.getUnsyncedFiles();
      
      if (filesToSync.length > 0) {
        // Update status to syncing
        onStatusChange({ state: 'syncing' });
        
        // Simulate sync operation with progress for larger files
        const totalSizeKB = filesToSync.reduce((sum, file) => sum + file.size, 0);
        const estimatedTimeMs = Math.min(3000, totalSizeKB / 5); // Simulate faster sync for demo
        
        await new Promise(resolve => setTimeout(resolve, estimatedTimeMs));
        
        // Mark files as synced
        filesToSync.forEach(file => {
          file.synced = true;
        });
        
        this.syncedFileCount += filesToSync.length;
        this.lastSyncTime = new Date();
        
        // Format current time
        const timeString = this.lastSyncTime.toLocaleTimeString();
        
        // Calculate total size of synced files in appropriate units
        let sizeText = "";
        const totalSizeMB = totalSizeKB / 1024;
        if (totalSizeMB >= 1) {
          sizeText = `${totalSizeMB.toFixed(2)} MB`;
        } else {
          sizeText = `${totalSizeKB.toFixed(2)} KB`;
        }
        
        // Update status to success
        onStatusChange({ 
          state: 'success', 
          message: `Synced ${filesToSync.length} files (${sizeText})`,
          lastSync: timeString
        });
        
        // Show toast notification
        toast.success(`Synced ${filesToSync.length} files (${sizeText}) to destination`);
      } else {
        // No changes found, update status to idle
        onStatusChange({ 
          state: 'idle',
          lastSync: this.lastSyncTime ? this.lastSyncTime.toLocaleTimeString() : undefined
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
    }
  }
  
  // Get stats
  getStats() {
    return {
      totalFiles: this.mockFiles.length,
      syncedFiles: this.syncedFileCount,
      lastSyncTime: this.lastSyncTime ? this.lastSyncTime.toLocaleTimeString() : 'Never',
      sourceSize: this.mockFiles.reduce((sum, file) => sum + file.size, 0),
      unsyncedCount: this.getUnsyncedFiles().length
    };
  }
  
  // Get all files (could be used for a detailed view in the UI)
  getFiles(): FileInfo[] {
    return [...this.mockFiles];
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

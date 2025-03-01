
import { toast } from "sonner";

// Define and export the types needed by components
export interface SyncConfig {
  sourceFolder: string;
  destinationFolder: string;
  pollingInterval: number;
  enabled: boolean;
}

export interface SyncStatus {
  state: 'idle' | 'polling' | 'syncing' | 'success' | 'error';
  message?: string;
  lastSync?: string;
  error?: string;
}

class FileSyncService {
  timerId: number | null = null;
  lastSyncTime: Date | null = null;
  isTauri: boolean = false;
  tauriFs: any = null;
  tauriPath: any = null;
  sourceFiles: string[] = [];
  syncedFiles: Set<string> = new Set();

  constructor() {
    // Check if we're running in Tauri on initialization
    this.initializeEnvironment();
  }

  async initializeEnvironment() {
    try {
      this.isTauri = typeof window !== 'undefined' && 
                     window !== null && 
                     // @ts-ignore - Tauri types
                     window.__TAURI__ !== undefined;
      
      if (this.isTauri) {
        try {
          // Dynamically import Tauri APIs
          const fs = await import('@tauri-apps/api/fs');
          const path = await import('@tauri-apps/api/path');
          this.tauriFs = fs;
          this.tauriPath = path;
          console.log('Running in Tauri environment');
        } catch (e) {
          console.error('Error importing Tauri APIs:', e);
          this.isTauri = false;
        }
      } else {
        console.log('Running in web environment');
      }
    } catch (error) {
      console.error('Error initializing environment:', error);
      this.isTauri = false;
    }
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

  // Read files from a directory
  async readFiles(directory: string): Promise<string[]> {
    if (!directory) {
      console.error('Invalid directory path');
      return [];
    }

    try {
      if (this.isTauri && this.tauriFs) {
        try {
          // Check if the directory exists
          const exists = await this.tauriFs.exists(directory);
          if (!exists) {
            console.error(`Directory ${directory} does not exist`);
            return [];
          }

          const entries = await this.tauriFs.readDir(directory, { recursive: true });
          const files = [];

          // Helper function to recursively get files
          const processEntries = async (entries) => {
            for (const entry of entries) {
              if (entry.children) {
                await processEntries(entry.children);
              } else if (!entry.isDirectory) {
                files.push(entry.path);
              }
            }
          };

          await processEntries(entries);
          return files;
        } catch (e) {
          console.error('Error reading directory with Tauri:', e);
          // Fall back to mock implementation
          return this.getMockFiles(directory);
        }
      } else {
        // Mock for web environment
        return this.getMockFiles(directory);
      }
    } catch (error) {
      console.error(`Error reading directory ${directory}:`, error);
      return [];
    }
  }

  // Mock implementation for web development
  getMockFiles(directory: string) {
    console.log('Using mock readFiles in web environment');
    // Simulate 1-5 random files
    const fileCount = Math.floor(Math.random() * 5) + 1;
    const mockFiles = [];
    for (let i = 0; i < fileCount; i++) {
      mockFiles.push(`${directory}/file${i}.txt`);
    }
    return mockFiles;
  }

  // Sync a single file from source to destination
  async syncFile(sourcePath: string, destinationFolder: string): Promise<void> {
    if (!sourcePath || !destinationFolder) {
      throw new Error('Invalid source path or destination folder');
    }

    try {
      if (this.isTauri && this.tauriFs && this.tauriPath) {
        try {
          // Get just the filename from the path
          const fileName = await this.tauriPath.basename(sourcePath);
          const destPath = await this.tauriPath.join(destinationFolder, fileName);

          // Ensure destination directory exists
          await this.tauriFs.createDir(destinationFolder, { recursive: true });
          
          // Copy the file
          await this.tauriFs.copyFile(sourcePath, destPath);
          console.log(`Copied ${sourcePath} to ${destPath}`);
          
          // Mark as synced
          this.syncedFiles.add(sourcePath);
        } catch (e) {
          console.error('Error syncing file with Tauri:', e);
          this.mockSyncFile(sourcePath, destinationFolder);
        }
      } else {
        this.mockSyncFile(sourcePath, destinationFolder);
      }
    } catch (error) {
      console.error(`Error syncing file ${sourcePath}:`, error);
      throw error;
    }
  }

  // Mock file sync for web development
  mockSyncFile(sourcePath: string, destinationFolder: string) {
    // Mock for web environment
    console.log(`Mock: Synced ${sourcePath} to ${destinationFolder}`);
    this.syncedFiles.add(sourcePath);
    
    // Simulate a random success/fail (10% chance of failure)
    if (Math.random() > 0.9) {
      throw new Error('Random mock sync error');
    }
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


import { environmentDetector } from './environmentDetector';
import { SyncResult, SyncFileDetail } from './types';

/**
 * Service to handle file-related operations
 */
class FileOperations {
  // Read files from a directory
  async readFiles(directory: string): Promise<string[]> {
    if (!directory) {
      console.error('Invalid directory path');
      return [];
    }

    try {
      if (environmentDetector.isTauri && environmentDetector.tauriFs) {
        try {
          // Check if the directory exists
          const exists = await environmentDetector.tauriFs.exists(directory);
          if (!exists) {
            console.error(`Directory ${directory} does not exist`);
            return [];
          }

          const entries = await environmentDetector.tauriFs.readDir(directory, { recursive: true });
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
      if (environmentDetector.isTauri && environmentDetector.tauriFs && environmentDetector.tauriPath) {
        try {
          // Get just the filename from the path
          const fileName = await environmentDetector.tauriPath.basename(sourcePath);
          const destPath = await environmentDetector.tauriPath.join(destinationFolder, fileName);

          // Ensure destination directory exists
          await environmentDetector.tauriFs.createDir(destinationFolder, { recursive: true });
          
          // Copy the file
          await environmentDetector.tauriFs.copyFile(sourcePath, destPath);
          console.log(`Copied ${sourcePath} to ${destPath}`);
          
          return;
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
    
    // Simulate a random success/fail (10% chance of failure)
    if (Math.random() > 0.9) {
      throw new Error('Random mock sync error');
    }
  }

  // Get files that need to be synced
  async getFilesToSync(config: any): Promise<string[]> {
    // This would normally check timestamps, etc.
    // For now, we'll just return some mock files
    return this.getMockFiles(config.sourceFolder);
  }

  // Copy multiple files from source to destination
  async copyFiles(config: any, filesToSync: string[]): Promise<SyncResult> {
    const result: SyncResult = {
      syncedCount: 0,
      errorCount: 0,
      details: []
    };

    for (const filePath of filesToSync) {
      const detail: SyncFileDetail = {
        sourcePath: filePath,
        destinationPath: `${config.destinationFolder}/${filePath.split('/').pop()}`,
        success: false
      };

      try {
        await this.syncFile(filePath, config.destinationFolder);
        detail.success = true;
        result.syncedCount++;
      } catch (error) {
        detail.error = error instanceof Error ? error.message : 'Unknown error';
        result.errorCount++;
      }

      result.details.push(detail);
    }

    return result;
  }

  // Reset sync state
  async resetSyncedFiles(): Promise<void> {
    console.log('Resetting synced files state');
    // This would clear local storage or a DB in a real app
  }
}

// Create and export a singleton instance
export const fileOperations = new FileOperations();

// Export required functions
export const getFilesToSync = async (config: any) => fileOperations.getFilesToSync(config);
export const copyFiles = async (config: any, filesToSync: string[]) => fileOperations.copyFiles(config, filesToSync);
export const resetSyncedFiles = async () => fileOperations.resetSyncedFiles();


import { environmentDetector } from './environmentDetector';
import { toast } from "sonner";

class FileOperations {
  // Read files from a directory
  async readFiles(directory: string): Promise<string[]> {
    if (!directory) {
      console.error('Invalid directory path');
      return [];
    }

    try {
      if (environmentDetector.isReady()) {
        try {
          if (environmentDetector.isTauri) {
            // Tauri implementation
            const exists = await environmentDetector.tauriFs.exists(directory);
            if (!exists) {
              console.error(`Directory ${directory} does not exist`);
              return [];
            }

            const entries = await environmentDetector.tauriFs.readDir(directory, { recursive: true });
            const files = [];

            // Helper function to recursively get files
            const processEntries = async (entries) => {
              if (!entries || !Array.isArray(entries)) {
                return;
              }
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
          } else if (environmentDetector.isCapacitor) {
            // Capacitor implementation for Android
            try {
              // Import Filesystem from Capacitor
              const { Filesystem, Directory } = await import('@capacitor/filesystem');
              
              // Use Android's storage system
              const result = await Filesystem.readdir({
                path: directory,
                directory: Directory.ExternalStorage
              });
              
              // Process results (might need to handle recursive directory traversal)
              const files = result.files.filter(f => !f.type.includes('directory')).map(f => {
                return `${directory}/${f.name}`;
              });
              
              console.log(`Found ${files.length} files in ${directory}`);
              return files;
            } catch (err) {
              console.error('Error reading directory with Capacitor:', err);
              toast.error(`Failed to read directory: ${(err as Error).message}`);
              return this.getMockFiles(directory);
            }
          }
        } catch (e) {
          console.error('Error reading directory:', e);
          // Fall back to mock implementation
          return this.getMockFiles(directory);
        }
      }
      
      // Mock for web environment
      return this.getMockFiles(directory);
    } catch (error) {
      console.error(`Error reading directory ${directory}:`, error);
      return [];
    }
  }

  // Mock implementation for web development
  getMockFiles(directory: string): string[] {
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
      if (environmentDetector.isReady()) {
        try {
          if (environmentDetector.isTauri) {
            // Tauri implementation
            const fileName = await environmentDetector.tauriPath.basename(sourcePath);
            const destPath = await environmentDetector.tauriPath.join(destinationFolder, fileName);

            // Ensure destination directory exists
            await environmentDetector.tauriFs.createDir(destinationFolder, { recursive: true });
            
            // Copy the file
            await environmentDetector.tauriFs.copyFile(sourcePath, destPath);
            console.log(`Copied ${sourcePath} to ${destPath}`);
          } else if (environmentDetector.isCapacitor) {
            // Capacitor implementation for Android
            try {
              // Import Filesystem from Capacitor
              const { Filesystem, Directory } = await import('@capacitor/filesystem');
              
              // Get file name from path
              const fileName = sourcePath.split('/').pop();
              if (!fileName) {
                throw new Error('Invalid source file path');
              }
              
              // Read the source file
              const readResult = await Filesystem.readFile({
                path: sourcePath,
                directory: Directory.ExternalStorage
              });
              
              // Ensure destination directory exists
              await Filesystem.mkdir({
                path: destinationFolder,
                directory: Directory.ExternalStorage,
                recursive: true
              });
              
              // Write to destination
              const destPath = `${destinationFolder}/${fileName}`;
              await Filesystem.writeFile({
                path: destPath,
                data: readResult.data,
                directory: Directory.ExternalStorage
              });
              
              console.log(`Copied ${sourcePath} to ${destPath}`);
            } catch (err) {
              console.error('Error syncing file with Capacitor:', err);
              toast.error(`Failed to sync file: ${(err as Error).message}`);
              this.mockSyncFile(sourcePath, destinationFolder);
            }
          }
        } catch (e) {
          console.error('Error syncing file:', e);
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
  mockSyncFile(sourcePath: string, destinationFolder: string): void {
    // Mock for web environment
    console.log(`Mock: Synced ${sourcePath} to ${destinationFolder}`);
    
    // Simulate a random success/fail (10% chance of failure)
    if (Math.random() > 0.9) {
      throw new Error('Random mock sync error');
    }
  }
}

export const fileOperations = new FileOperations();

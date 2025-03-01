
import { environmentDetector } from '@/services/environmentDetector';
import { toast } from 'sonner';

interface FolderItem {
  name: string;
  path: string;
  isFolder: boolean;
}

export const loadFolderContents = async (folderPath: string): Promise<FolderItem[]> => {
  if (!folderPath) {
    console.error('Invalid folder path');
    return [];
  }
  
  try {
    if (environmentDetector.isReady()) {
      // Ensure environment is initialized
      await environmentDetector.waitForInit();
      
      try {
        // Check if the path exists
        const exists = await environmentDetector.tauriFs.exists(folderPath);
        if (!exists) {
          console.error(`Path does not exist: ${folderPath}`);
          throw new Error(`The folder "${folderPath}" does not exist or cannot be accessed`);
        }

        console.log(`Reading directory: ${folderPath}`);
        
        // Read the directory contents
        const entries = await environmentDetector.tauriFs.readDir(folderPath, { recursive: false });
        
        console.log(`Got ${entries?.length || 0} entries from: ${folderPath}`);
        
        // Convert entries to our format
        const formattedEntries = entries.map(entry => ({
          name: entry.name || 'Unknown',
          path: entry.path,
          isFolder: !!entry.children || entry.isDirectory
        }));
        
        // Sort folders first, then files
        formattedEntries.sort((a, b) => {
          if (a.isFolder === b.isFolder) {
            return a.name.localeCompare(b.name);
          }
          return a.isFolder ? -1 : 1;
        });
        
        return formattedEntries;
      } catch (error) {
        console.error('Error reading directory with Tauri:', error);
        toast.error(`Error browsing folder: ${(error as Error).message}`);
        return generateMockFolderContents(folderPath);
      }
    } else {
      console.log('Environment not ready, using mock data');
      // Mock for web environment
      return generateMockFolderContents(folderPath);
    }
  } catch (error) {
    console.error('Error loading folder contents:', error);
    throw new Error(`Failed to load folder contents: ${(error as Error).message}`);
  }
};

export const generateMockFolderContents = (folderPath: string): FolderItem[] => {
  // Generate mock folder structure for web preview
  let mockContents: FolderItem[] = [];
  
  // Check if we're at the root level
  if (folderPath === '/' || folderPath.endsWith(':\\')) {
    mockContents = [
      { name: 'Documents', path: `${folderPath}/Documents`, isFolder: true },
      { name: 'Pictures', path: `${folderPath}/Pictures`, isFolder: true },
      { name: 'Downloads', path: `${folderPath}/Downloads`, isFolder: true },
      { name: 'Desktop', path: `${folderPath}/Desktop`, isFolder: true },
      { name: 'Applications', path: `${folderPath}/Applications`, isFolder: true },
    ];
  } else {
    // Generate some random subfolders and files
    const pathParts = folderPath.split(/[/\\]+/);
    const folderName = pathParts[pathParts.length - 1];
    
    // Generate subfolders based on the folder name
    if (folderName === 'Documents') {
      mockContents = [
        { name: 'Work', path: `${folderPath}/Work`, isFolder: true },
        { name: 'Personal', path: `${folderPath}/Personal`, isFolder: true },
        { name: 'budget.xlsx', path: `${folderPath}/budget.xlsx`, isFolder: false },
        { name: 'report.docx', path: `${folderPath}/report.docx`, isFolder: false },
      ];
    } else if (folderName === 'Pictures') {
      mockContents = [
        { name: 'Vacation', path: `${folderPath}/Vacation`, isFolder: true },
        { name: 'Family', path: `${folderPath}/Family`, isFolder: true },
        { name: 'photo1.jpg', path: `${folderPath}/photo1.jpg`, isFolder: false },
        { name: 'photo2.jpg', path: `${folderPath}/photo2.jpg`, isFolder: false },
      ];
    } else if (folderName === 'Downloads') {
      mockContents = [
        { name: 'Software', path: `${folderPath}/Software`, isFolder: true },
        { name: 'app-installer.exe', path: `${folderPath}/app-installer.exe`, isFolder: false },
        { name: 'document.pdf', path: `${folderPath}/document.pdf`, isFolder: false },
      ];
    } else {
      // For any other folder, generate generic content
      mockContents = [
        { name: 'Subfolder 1', path: `${folderPath}/Subfolder 1`, isFolder: true },
        { name: 'Subfolder 2', path: `${folderPath}/Subfolder 2`, isFolder: true },
        { name: 'file1.txt', path: `${folderPath}/file1.txt`, isFolder: false },
        { name: 'file2.txt', path: `${folderPath}/file2.txt`, isFolder: false },
      ];
    }
  }
  
  return mockContents;
};

export const getPlatformRoot = async (): Promise<string> => {
  try {
    // Ensure environment is initialized
    await environmentDetector.waitForInit();
    
    if (environmentDetector.isReady()) {
      // Get home directory when using Tauri
      try {
        const homedir = await environmentDetector.tauriPath.homeDir();
        console.log(`Got home directory: ${homedir}`);
        return homedir;
      } catch (error) {
        console.error('Error getting home directory:', error);
        // Fallback to basic root paths if error occurs
        if (navigator.platform.toLowerCase().includes('win')) {
          return 'C:\\';
        } else {
          return '/home/user';
        }
      }
    } else {
      // Mock for web environment
      console.log('Using mock platform root in web environment');
      const platform = navigator.platform.toLowerCase();
      if (platform.includes('win')) {
        return 'C:\\';
      } else {
        return '/home/user';
      }
    }
  } catch (error) {
    console.error('Failed to get platform root:', error);
    return '/';
  }
};

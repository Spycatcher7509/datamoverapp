
import { environmentDetector } from '@/services/environmentDetector';

interface FolderItem {
  name: string;
  path: string;
  isFolder: boolean;
}

export const loadFolderContents = async (folderPath: string): Promise<FolderItem[]> => {
  try {
    if (environmentDetector.isReady()) {
      // Use Tauri FS API
      try {
        // Check if the path exists
        const exists = await environmentDetector.tauriFs.exists(folderPath);
        if (!exists) {
          console.error(`Path does not exist: ${folderPath}`);
          return [];
        }

        // Read the directory contents
        const entries = await environmentDetector.tauriFs.readDir(folderPath, { recursive: false });
        
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
        return generateMockFolderContents(folderPath);
      }
    } else {
      // Mock for web environment
      return generateMockFolderContents(folderPath);
    }
  } catch (error) {
    console.error('Error loading folder contents:', error);
    return [];
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
    if (environmentDetector.isReady()) {
      // Get home directory when using Tauri
      const homedir = await environmentDetector.tauriPath.homeDir();
      return homedir;
    } else {
      // Mock for web environment
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

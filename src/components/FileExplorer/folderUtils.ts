
// Utility functions for folder operations

export const generateMockFolderContents = (folderPath: string) => {
  // Generate some mock subfolders and files
  const randomSubfolderCount = Math.floor(Math.random() * 3) + 1;
  const randomFileCount = Math.floor(Math.random() * 3) + 1;
  
  const mockSubfolders = Array.from({ length: randomSubfolderCount }).map((_, index) => ({
    name: `Folder ${index + 1}`,
    path: `${folderPath}/Folder ${index + 1}`,
    isFolder: true
  }));
  
  const mockFiles = Array.from({ length: randomFileCount }).map((_, index) => ({
    name: `file${index + 1}.txt`,
    path: `${folderPath}/file${index + 1}.txt`,
    isFolder: false
  }));
  
  return [...mockSubfolders, ...mockFiles];
};

export const getMockRootFolders = () => {
  return [
    { name: 'Home', path: '/Users/user', isFolder: true },
    { name: 'Documents', path: '/Users/user/Documents', isFolder: true },
    { name: 'Desktop', path: '/Users/user/Desktop', isFolder: true },
    { name: 'Downloads', path: '/Users/user/Downloads', isFolder: true },
    { name: 'Applications', path: '/Applications', isFolder: true },
  ];
};

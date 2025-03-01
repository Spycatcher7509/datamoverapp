
// Utility functions for folder operations

export const generateMockFolderContents = (folderPath: string) => {
  // Generate some mock subfolders and files based on the path
  let randomSubfolderCount = Math.floor(Math.random() * 3) + 1;
  let randomFileCount = Math.floor(Math.random() * 5) + 2;
  
  // For deeper paths, reduce the number of items
  const pathDepth = folderPath.split('/').filter(Boolean).length;
  if (pathDepth > 3) {
    randomSubfolderCount = Math.max(0, randomSubfolderCount - 1);
    randomFileCount = Math.max(1, randomFileCount - 2);
  }
  
  // Create more realistic folder names based on the parent folder
  const parentFolder = folderPath.split('/').pop() || '';
  
  // Generate subfolder names based on common folder patterns
  const mockSubfolders = Array.from({ length: randomSubfolderCount }).map((_, index) => {
    let folderName = '';
    
    // Create more contextual folder names
    if (parentFolder.includes('Document')) {
      folderName = ['Projects', 'Reports', 'Invoices', 'Archives', 'Shared'][index % 5];
    } else if (parentFolder.includes('Download')) {
      folderName = ['Software', 'Media', 'Temp', 'Backups'][index % 4];
    } else if (parentFolder.includes('Desktop')) {
      folderName = ['Work', 'Personal', 'Screenshots', 'Shortcuts'][index % 4];
    } else {
      folderName = `Folder ${index + 1}`;
    }
    
    return {
      name: folderName,
      path: `${folderPath}/${folderName}`,
      isFolder: true
    };
  });
  
  // Generate more realistic file names
  const fileExtensions = ['.txt', '.pdf', '.docx', '.jpg', '.png', '.md'];
  const mockFiles = Array.from({ length: randomFileCount }).map((_, index) => {
    const extension = fileExtensions[index % fileExtensions.length];
    let fileName = '';
    
    // Create more contextual file names
    if (parentFolder.includes('Document')) {
      fileName = ['Report', 'Invoice', 'Contract', 'Resume', 'Notes'][index % 5];
    } else if (parentFolder.includes('Download')) {
      fileName = ['Setup', 'Manual', 'Guide', 'Document', 'README'][index % 5];
    } else if (parentFolder.includes('Desktop')) {
      fileName = ['Project', 'Todo', 'Meeting', 'Notes', 'Screenshot'][index % 5];
    } else {
      fileName = `file${index + 1}`;
    }
    
    return {
      name: `${fileName}${extension}`,
      path: `${folderPath}/${fileName}${extension}`,
      isFolder: false
    };
  });
  
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

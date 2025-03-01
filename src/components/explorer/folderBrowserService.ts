
import { environmentDetector } from '@/services/environmentDetector';
import { toast } from 'sonner';

export async function openNativeDirectoryDialog(label: string): Promise<string | null> {
  try {
    // Ensure environment is initialized
    await environmentDetector.waitForInit();
    
    // Check if we're running in Tauri
    if (environmentDetector.isReady()) {
      try {
        console.log('Opening native Tauri directory dialog');
        // Use Tauri dialog API
        const dialog = await import('@tauri-apps/api/dialog');
        // Open a folder selection dialog
        const selected = await dialog.open({
          directory: true,
          multiple: false,
          title: `Select ${label}`
        });
        
        console.log('Dialog result:', selected);
        
        // If a folder was selected (not cancelled), return the path
        if (selected && !Array.isArray(selected)) {
          return selected as string;
        } else if (Array.isArray(selected) && selected.length > 0) {
          // In case it returns an array (shouldn't happen with directory:true, but just in case)
          return selected[0] as string;
        }
      } catch (e) {
        console.error('Error with Tauri dialog:', e);
        toast.error('Failed to open native folder dialog');
      }
    } else {
      console.log('Native folder dialog not available in web environment');
    }
  } catch (error) {
    console.error('Error selecting folder:', error);
    toast.error(`Error selecting folder: ${(error as Error).message}`);
  }
  
  // Return null if native dialog failed or isn't available
  return null;
}

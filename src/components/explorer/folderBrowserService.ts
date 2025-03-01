
import { environmentDetector } from '@/services/environmentDetector';
import { toast } from 'sonner';

export async function openNativeDirectoryDialog(label: string): Promise<string | null> {
  try {
    // Check if we're running in Tauri
    if (environmentDetector.isReady()) {
      try {
        // Use Tauri dialog API
        const dialog = await import('@tauri-apps/api/dialog');
        // Open a folder selection dialog
        const selected = await dialog.open({
          directory: true,
          multiple: false,
          title: `Select ${label}`
        });
        
        // If a folder was selected (not cancelled), return the path
        if (selected && !Array.isArray(selected)) {
          return selected as string;
        }
      } catch (e) {
        console.error('Error with Tauri dialog:', e);
        toast.error('Failed to open native folder dialog');
        return null;
      }
    }
  } catch (error) {
    console.error('Error selecting folder:', error);
  }
  
  // Return null if native dialog failed or isn't available
  return null;
}

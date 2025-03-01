
/**
 * Service to detect the runtime environment (Tauri vs Web)
 */
class EnvironmentDetector {
  isTauri: boolean = false;
  tauriFs: any = null;
  tauriPath: any = null;

  constructor() {
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
}

// Create and export a singleton instance
export const environmentDetector = new EnvironmentDetector();

// Export the isTauri property directly
export const isTauri = environmentDetector.isTauri;

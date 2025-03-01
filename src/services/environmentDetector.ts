
import { toast } from "sonner";

class EnvironmentDetector {
  isTauri: boolean = false;
  tauriFs: any = null;
  tauriPath: any = null;
  isInitialized: boolean = false;
  initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initializeEnvironment();
  }

  async initializeEnvironment() {
    if (this.isInitialized) return;
    
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
          toast.error('Failed to initialize Tauri APIs');
          this.isTauri = false;
        }
      } else {
        console.log('Running in web environment');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing environment:', error);
      this.isTauri = false;
      this.isInitialized = true; // Mark as initialized even on error to prevent repeated attempts
    }
  }

  // Check if running in Tauri and APIs are loaded
  isReady(): boolean {
    return this.isInitialized && this.isTauri && this.tauriFs !== null && this.tauriPath !== null;
  }
  
  // Wait for initialization to complete
  async waitForInit(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }
}

// Create a singleton instance
export const environmentDetector = new EnvironmentDetector();

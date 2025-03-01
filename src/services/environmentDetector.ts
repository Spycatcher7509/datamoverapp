
import { toast } from "sonner";

class EnvironmentDetector {
  isTauri: boolean = false;
  isCapacitor: boolean = false;
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
      // Check if running in Tauri
      this.isTauri = typeof window !== 'undefined' && 
                     window !== null && 
                     // @ts-ignore - Tauri types
                     window.__TAURI__ !== undefined;
      
      // Check if running in Capacitor (mobile)
      this.isCapacitor = typeof window !== 'undefined' &&
                        window !== null &&
                        // @ts-ignore - Capacitor types
                        window.Capacitor !== undefined;
      
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
      } else if (this.isCapacitor) {
        console.log('Running in Capacitor (mobile) environment');
        // Request storage permissions for Android
        if (this.isAndroid()) {
          try {
            const { Permissions } = await import('@capacitor/core');
            // Request permissions
            const permissionState = await Permissions.query({
              name: 'storage'
            });
            
            if (permissionState.state !== 'granted') {
              const requestResult = await Permissions.request({
                name: 'storage'
              });
              
              if (requestResult.state !== 'granted') {
                toast.error('Storage permission is required for file operations');
                console.warn('Storage permission denied');
              } else {
                console.log('Storage permission granted');
              }
            }
          } catch (err) {
            console.error('Error requesting Android permissions:', err);
          }
        }
      } else {
        console.log('Running in web environment');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing environment:', error);
      this.isTauri = false;
      this.isCapacitor = false;
      this.isInitialized = true; // Mark as initialized even on error to prevent repeated attempts
    }
  }

  // Check if running in Tauri and APIs are loaded
  isReady(): boolean {
    return this.isInitialized && (this.isTauri || this.isCapacitor);
  }
  
  isAndroid(): boolean {
    return this.isCapacitor && 
           // @ts-ignore - Capacitor types
           window.Capacitor?.getPlatform() === 'android';
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

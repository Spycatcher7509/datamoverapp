
// Type definitions for Tauri API
declare namespace TauriAPI {
  interface FileEntry {
    path: string;
    isDirectory: boolean;
    children?: FileEntry[];
  }

  interface DialogOptions {
    directory?: boolean;
    multiple?: boolean;
    title?: string;
  }
}

// Declare global Tauri namespace for TypeScript
interface Window {
  __TAURI__?: unknown;
}

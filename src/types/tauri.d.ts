
// Type definitions for Tauri globals
interface Window {
  __TAURI__?: {
    [key: string]: any;
  };
}

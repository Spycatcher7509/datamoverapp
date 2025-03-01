
// Define and export shared types needed by components and services
export interface SyncConfig {
  sourceFolder: string;
  destinationFolder: string;
  pollingInterval: number;
  enabled: boolean;
}

export interface SyncStatus {
  state: 'idle' | 'polling' | 'syncing' | 'success' | 'error';
  message?: string;
  lastSync?: string;
  error?: string;
}

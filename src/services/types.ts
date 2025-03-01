
// Define exported types needed by components
export type SyncConfig = {
  sourceFolder: string;
  destinationFolder: string;
  pollingInterval: number;
  enabled: boolean;
}

export type SyncStatus = {
  state: 'idle' | 'polling' | 'syncing' | 'success' | 'error';
  message?: string;
  lastSync?: string;
  error?: string;
}

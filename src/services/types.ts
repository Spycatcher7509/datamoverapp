
// Define and export shared types needed by components and services
export interface SyncConfig {
  sourceFolder: string;
  destinationFolder: string;
  pollingInterval: number;
  enabled: boolean;
}

export interface SyncStatus {
  state: 'idle' | 'polling' | 'checking' | 'syncing' | 'success' | 'error' | 'active';
  message?: string;
  lastSync?: string;
  lastSyncTime?: number;
  lastSyncResult?: SyncResult;
  error?: string;
  filesCount?: number;
}

export interface SyncFileDetail {
  sourcePath: string;
  destinationPath: string;
  success: boolean;
  error?: string;
}

export interface SyncResult {
  syncedCount: number;
  errorCount: number;
  details: SyncFileDetail[];
}

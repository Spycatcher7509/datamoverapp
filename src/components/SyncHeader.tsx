import { FolderSyncIcon } from 'lucide-react';
import SyncStatus from './SyncStatus';
import { SyncStatus as SyncStatusType } from '../services/types';

interface SyncHeaderProps {
  syncStatus: SyncStatusType;
}

const SyncHeader = ({ syncStatus }: SyncHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <FolderSyncIcon className="h-4 w-4 text-primary" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">File Sync</h1>
      </div>
      
      <SyncStatus 
        state={syncStatus.state} 
        message={syncStatus.message}
        lastSync={syncStatus.lastSync} 
      />
    </div>
  );
};

export default SyncHeader;

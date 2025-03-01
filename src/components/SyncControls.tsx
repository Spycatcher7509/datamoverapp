
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PauseIcon, PlayIcon, RefreshCw } from 'lucide-react';
import type { SyncStatus as SyncStatusType } from '../services/types';

interface SyncControlsProps {
  isEnabled: boolean;
  toggleSync: () => void;
  handleManualSync: () => void;
  isManualSyncing: boolean;
  syncStatus: SyncStatusType;
}

const SyncControls = ({
  isEnabled,
  toggleSync,
  handleManualSync,
  isManualSyncing,
  syncStatus
}: SyncControlsProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Switch 
          checked={isEnabled} 
          onCheckedChange={toggleSync}
          id="sync-toggle"
          disabled={syncStatus.state === 'error'}
        />
        <label 
          htmlFor="sync-toggle" 
          className="text-sm font-medium leading-none cursor-pointer"
        >
          {isEnabled ? 'Monitoring active' : 'Start monitoring'}
        </label>
      </div>
      
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSync}
          disabled={isManualSyncing || syncStatus.state === 'syncing'}
          className="h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isManualSyncing ? 'animate-spin' : ''}`} />
          <span>Sync Now</span>
        </Button>
        
        <Button
          variant={isEnabled ? "outline" : "default"}
          size="sm"
          onClick={toggleSync}
          className="flex items-center space-x-1 h-8"
          disabled={syncStatus.state === 'error'}
        >
          {isEnabled ? (
            <>
              <PauseIcon className="h-3.5 w-3.5 mr-1" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <PlayIcon className="h-3.5 w-3.5 mr-1" />
              <span>Start</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SyncControls;

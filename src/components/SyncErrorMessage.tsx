import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';
import { SyncStatus as SyncStatusType } from '@/services/types';

interface SyncErrorMessageProps {
  syncStatus: SyncStatusType;
  onClearError: () => void;
}

const SyncErrorMessage = ({ syncStatus, onClearError }: SyncErrorMessageProps) => {
  if (syncStatus.state !== 'error') return null;

  return (
    <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-start">
      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-sm">Sync Error</p>
        <p className="text-xs mt-1">{syncStatus.error || "Unknown error occurred"}</p>
        <Button 
          variant="destructive" 
          size="sm" 
          className="mt-2 h-7 text-xs" 
          onClick={onClearError}
        >
          Clear Error
        </Button>
      </div>
    </div>
  );
};

export default SyncErrorMessage;

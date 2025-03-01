
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { AlertCircleIcon, XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { SyncStatus } from "../services/types";

interface SyncErrorMessageProps {
  syncStatus: SyncStatus;
  onClearError: () => void;
}

const SyncErrorMessage = ({ syncStatus, onClearError }: SyncErrorMessageProps) => {
  const [open, setOpen] = useState(false);
  
  // Reset dialog state when error is cleared
  useEffect(() => {
    if (syncStatus.state !== 'error') {
      setOpen(false);
    }
  }, [syncStatus]);
  
  if (syncStatus.state !== 'error') {
    return null;
  }
  
  return (
    <div className="mt-6 animate-fade-in">
      <Alert variant="destructive" className="border-destructive/50">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Sync Error</AlertTitle>
        <AlertDescription className="flex items-start justify-between">
          <div>
            {syncStatus.error || "An error occurred during synchronization."}
          </div>
          
          <div className="flex items-center space-x-2 ml-4 mt-1">
            <Button 
              variant="ghost" 
              className="h-6 px-2"
              onClick={() => setOpen(true)}
            >
              <XCircleIcon className="h-4 w-4 mr-1" />
              <span>Dismiss</span>
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Clear Sync Error
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            Are you sure you want to clear this error? This will reset the sync status.
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                onClearError();
                setOpen(false);
              }}
            >
              Clear Error
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SyncErrorMessage;

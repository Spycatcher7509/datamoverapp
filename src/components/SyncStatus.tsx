
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowDownUp, CheckCircle, Clock, Loader2 } from "lucide-react";

export type SyncState = 'idle' | 'polling' | 'syncing' | 'success' | 'error';

interface SyncStatusProps {
  state: SyncState;
  message?: string;
  lastSync?: string;
  className?: string;
}

const SyncStatus = ({ 
  state, 
  message,
  lastSync,
  className 
}: SyncStatusProps) => {
  const getIcon = () => {
    switch (state) {
      case 'idle':
        return <Clock className="h-4 w-4" />;
      case 'polling':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'syncing':
        return <ArrowDownUp className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getColorVariant = () => {
    switch (state) {
      case 'idle':
        return "bg-secondary text-secondary-foreground";
      case 'polling':
        return "bg-primary/15 text-primary border-primary/20";
      case 'syncing':
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case 'success':
        return "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20";
      case 'error':
        return "bg-destructive/15 text-destructive border-destructive/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getDefaultMessage = () => {
    switch (state) {
      case 'idle':
        return "Ready to sync";
      case 'polling':
        return "Checking for changes";
      case 'syncing':
        return "Syncing files";
      case 'success':
        return "Sync complete";
      case 'error':
        return "Sync failed";
      default:
        return "Ready";
    }
  };

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <Badge 
        variant="outline" 
        className={cn(
          "h-7 px-3 flex items-center gap-1.5 border animate-fade-in transition-colors",
          getColorVariant()
        )}
      >
        {getIcon()}
        <span>{message || getDefaultMessage()}</span>
      </Badge>
      
      {lastSync && state !== 'error' && (
        <p className="text-xs text-muted-foreground pl-1">
          {state === 'idle' ? 'Last sync:' : 'Updated:'} {lastSync}
        </p>
      )}
    </div>
  );
};

export default SyncStatus;

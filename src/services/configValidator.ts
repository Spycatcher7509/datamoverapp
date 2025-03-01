
import { toast } from "sonner";
import { SyncConfig, SyncStatus } from './types';

class ConfigValidator {
  // Validate sync configuration
  validateConfig(config: SyncConfig, onStatusChange?: (status: SyncStatus) => void): boolean {
    if (!config) {
      if (onStatusChange) {
        onStatusChange({ state: 'error', error: 'Invalid configuration' });
      }
      return false;
    }

    // Validate source and destination
    if (!config.sourceFolder || !config.destinationFolder) {
      const error = 'Source and destination folders must be specified';
      if (onStatusChange) {
        onStatusChange({ state: 'error', error });
      }
      toast.error(error);
      return false;
    }

    // Make sure source and destination are different
    if (config.sourceFolder === config.destinationFolder) {
      const error = 'Source and destination folders must be different';
      if (onStatusChange) {
        onStatusChange({ state: 'error', error });
      }
      toast.error(error);
      return false;
    }

    // Validate polling interval
    const interval = Number(config.pollingInterval);
    if (isNaN(interval) || interval <= 0) {
      const error = 'Polling interval must be a positive number';
      if (onStatusChange) {
        onStatusChange({ state: 'error', error });
      }
      toast.error(error);
      return false;
    }

    return true;
  }
}

export const configValidator = new ConfigValidator();

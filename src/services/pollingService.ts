
import { toast } from "sonner";
import { SyncConfig, SyncStatus } from './types';
import { configValidator } from './configValidator';
import { syncOperations } from './syncOperations';

class PollingService {
  timerId: number | null = null;

  // Start the polling process
  startPolling(config: SyncConfig, onStatusChange: (status: SyncStatus) => void) {
    if (!configValidator.validateConfig(config, onStatusChange)) {
      return;
    }

    if (this.timerId) {
      this.stopPolling();
    }

    if (!config.enabled) {
      onStatusChange({ state: 'idle' });
      return;
    }

    // Convert seconds to milliseconds
    const intervalMs = Number(config.pollingInterval) * 1000;

    // Initial status update
    onStatusChange({ state: 'polling' });

    try {
      // Perform immediate sync
      syncOperations.performSync(config, onStatusChange);

      // Set up polling interval
      this.timerId = window.setInterval(() => {
        syncOperations.performSync(config, onStatusChange);
      }, intervalMs);
    } catch (error) {
      console.error('Error starting polling:', error);
      onStatusChange({
        state: 'error',
        error: error instanceof Error ? error.message : 'Failed to start monitoring'
      });
    }
  }

  // Stop the polling process
  stopPolling() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

// Create and export a singleton instance
export const pollingService = new PollingService();

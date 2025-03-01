
import { useState } from 'react';
import type { SyncConfig } from '../services/types';

export function useSyncConfig() {
  const [sourceFolder, setSourceFolder] = useState<string>('');
  const [destinationFolder, setDestinationFolder] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<number>(5);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const getConfig = (): SyncConfig => ({
    sourceFolder,
    destinationFolder,
    pollingInterval,
    enabled: isEnabled
  });

  return {
    sourceFolder,
    setSourceFolder,
    destinationFolder,
    setDestinationFolder,
    pollingInterval,
    setPollingInterval,
    isEnabled,
    setIsEnabled,
    getConfig
  };
}

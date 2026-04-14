import { useEffect } from 'react';
import type { InstallerEvent } from '../../../shared/ipc-contract.js';

/**
 * Subscribes to installer:event IPC messages forwarded through the preload's
 * contextBridge API. Calls `onEvent` for each received event and cleans up the
 * listener on unmount.
 */
export function useInstallerEvents(onEvent: (event: InstallerEvent) => void): void {
  useEffect(() => {
    const cleanup = window.installerApi.onEvent(onEvent);
    return cleanup;
  }, [onEvent]);
}

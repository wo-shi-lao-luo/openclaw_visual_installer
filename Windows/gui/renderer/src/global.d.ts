import type { InstallerEvent } from '../../shared/ipc-contract.js';

declare global {
  interface Window {
    installerApi: {
      /** Start an install or uninstall run. */
      start(payload: { mode: 'install' | 'uninstall' }): Promise<void>;
      /** Respond to a pending confirmation prompt. */
      respondConfirm(id: string, confirmed: boolean): Promise<void>;
      /**
       * Subscribe to installer events. Returns a cleanup function that removes
       * the listener when called.
       */
      onEvent(handler: (event: InstallerEvent) => void): () => void;
    };
  }
}

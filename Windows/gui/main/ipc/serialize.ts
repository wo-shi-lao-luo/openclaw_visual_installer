import type { InstallerMvpRunResult } from '../../../src/runtime/installer-mvp.js';
import type { SerializedRunResult } from '../../shared/ipc-contract.js';

/**
 * Converts an InstallerMvpRunResult to a plain, structuredClone-safe object
 * suitable for sending over IPC. Strips any non-serialisable values (functions,
 * class instances) by round-tripping through JSON.
 */
export function serializeRunResult(result: InstallerMvpRunResult): SerializedRunResult {
  // JSON round-trip strips functions and undefined values, making the object
  // safe for structuredClone and IPC serialisation.
  return JSON.parse(JSON.stringify(result)) as SerializedRunResult;
}

export interface PromptRegistry {
  register(id: string): Promise<boolean>;
  resolve(id: string, confirmed: boolean): void;
  rejectAll(reason: string): void;
}

type PendingEntry = {
  resolve: (confirmed: boolean) => void;
  reject: (err: Error) => void;
};

export function createPromptRegistry(): PromptRegistry {
  const pending = new Map<string, PendingEntry>();

  function register(id: string): Promise<boolean> {
    // If a prompt with this id already exists, reject the previous one.
    const existing = pending.get(id);
    if (existing) {
      existing.reject(new Error(`Prompt id "${id}" was superseded by a new prompt with the same id.`));
    }

    return new Promise<boolean>((res, rej) => {
      pending.set(id, { resolve: res, reject: rej });
    });
  }

  function resolve(id: string, confirmed: boolean): void {
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);
    entry.resolve(confirmed);
  }

  function rejectAll(reason: string): void {
    const err = new Error(reason);
    for (const [, entry] of pending) {
      entry.reject(err);
    }
    pending.clear();
  }

  return { register, resolve, rejectAll };
}

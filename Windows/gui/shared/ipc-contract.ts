import { z } from 'zod';

// ── Step IDs and statuses (mirror src/shared/types.ts) ───────────────────────

export const InstallerStepIdSchema = z.enum([
  'environment-check',
  'validate',
  'install',
  'verify',
  'finalize',
]);

export const InstallerMvpStepStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'skipped',
  'failed',
]);

// ── Commands (renderer → main) ────────────────────────────────────────────────

export const StartCommandSchema = z.object({
  type: z.literal('start'),
  mode: z.enum(['install', 'uninstall']),
});

export const ConfirmResponseSchema = z.object({
  type: z.literal('confirm-response'),
  id: z.string().min(1),
  confirmed: z.boolean(),
});

export const CancelCommandSchema = z.object({
  type: z.literal('cancel'),
});

export const InstallerCommandSchema = z.discriminatedUnion('type', [
  StartCommandSchema,
  ConfirmResponseSchema,
  CancelCommandSchema,
]);

export type StartCommand = z.infer<typeof StartCommandSchema>;
export type ConfirmResponse = z.infer<typeof ConfirmResponseSchema>;
export type CancelCommand = z.infer<typeof CancelCommandSchema>;
export type InstallerCommand = z.infer<typeof InstallerCommandSchema>;

// ── Events (main → renderer) ──────────────────────────────────────────────────

export const LogEventSchema = z.object({
  type: z.literal('log'),
  line: z.string(),
  stream: z.enum(['stdout', 'stderr', 'info']),
});

export const StepUpdateEventSchema = z.object({
  type: z.literal('step-update'),
  id: InstallerStepIdSchema,
  status: InstallerMvpStepStatusSchema,
  detail: z.string().optional(),
});

export const PromptEventSchema = z.object({
  type: z.literal('prompt'),
  id: z.string().min(1),
  question: z.string().min(1),
});

// Serialized InstallerMvpRunResult — plain data only (no functions, no class instances)
export const SerializedStepSchema = z.object({
  id: InstallerStepIdSchema,
  label: z.string(),
  status: InstallerMvpStepStatusSchema,
  detail: z.string().optional(),
});

export const RunCompleteResultSchema = z.object({
  success: z.boolean(),
  aborted: z.boolean(),
  abortedAt: z.string().optional(),
  steps: z.array(SerializedStepSchema),
  bootstrap: z.unknown(),
  openClawInstallResult: z
    .object({
      success: z.boolean(),
      exitCode: z.number(),
      stdout: z.string(),
      stderr: z.string(),
      message: z.string(),
    })
    .optional(),
  openClawVerifyResult: z
    .object({
      cliFound: z.boolean(),
      cliPath: z.string().optional(),
      gatewayReachable: z.boolean(),
      gatewayOutput: z.string().optional(),
      message: z.string(),
    })
    .optional(),
});

export const RunCompleteEventSchema = z.object({
  type: z.literal('run-complete'),
  result: RunCompleteResultSchema,
});

export const RunErrorEventSchema = z.object({
  type: z.literal('run-error'),
  message: z.string().min(1),
});

export const InstallerEventSchema = z.discriminatedUnion('type', [
  LogEventSchema,
  StepUpdateEventSchema,
  PromptEventSchema,
  RunCompleteEventSchema,
  RunErrorEventSchema,
]);

export type LogEvent = z.infer<typeof LogEventSchema>;
export type StepUpdateEvent = z.infer<typeof StepUpdateEventSchema>;
export type PromptEvent = z.infer<typeof PromptEventSchema>;
export type RunCompleteEvent = z.infer<typeof RunCompleteEventSchema>;
export type RunErrorEvent = z.infer<typeof RunErrorEventSchema>;
export type InstallerEvent = z.infer<typeof InstallerEventSchema>;
export type SerializedRunResult = z.infer<typeof RunCompleteResultSchema>;
export type SerializedStep = z.infer<typeof SerializedStepSchema>;

// ── IPC channel names ─────────────────────────────────────────────────────────

export const IPC_CHANNEL_COMMAND = 'installer:invoke' as const;
export const IPC_CHANNEL_EVENT = 'installer:event' as const;

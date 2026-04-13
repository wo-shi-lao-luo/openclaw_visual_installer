import type { DiagnosticsEvent, DiagnosticsReport, DiagnosticLevel, InstallerNote } from '../shared/types.js';

export function createDiagnosticsEvent(
  source: string,
  level: DiagnosticLevel,
  message: string,
  context?: Record<string, unknown>,
): DiagnosticsEvent {
  return {
    id: `${source}:${level}:${message}`,
    source,
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };
}

export function createDiagnosticsReport(
  source: string,
  events: DiagnosticsEvent[],
  notes: InstallerNote[] = [],
): DiagnosticsReport {
  return {
    source,
    summary: `${events.length} event${events.length === 1 ? '' : 's'} recorded`,
    notes,
    events,
  };
}

export function logDiagnosticsReport(report: DiagnosticsReport): DiagnosticsReport {
  if (typeof console !== 'undefined') {
    console.log(`[${report.source}] ${report.summary}`);
  }

  return report;
}

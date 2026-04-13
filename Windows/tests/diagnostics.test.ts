import { afterEach, describe, expect, test, vi } from 'vitest';

import { createDiagnosticsEvent, createDiagnosticsReport, logDiagnosticsReport } from '../src/index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('diagnostics helpers', () => {
  test('createDiagnosticsEvent emits a structured diagnostic payload', () => {
    const event = createDiagnosticsEvent('tests', 'warning', 'Diagnostics helper ready.', {
      feature: 'phase-one',
    });

    expect(event.id).toBe('tests:warning:Diagnostics helper ready.');
    expect(event.source).toBe('tests');
    expect(event.level).toBe('warning');
    expect(event.message).toBe('Diagnostics helper ready.');
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(event.context).toEqual({ feature: 'phase-one' });
  });

  test('createDiagnosticsReport and logDiagnosticsReport stay lightweight', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const event = createDiagnosticsEvent('tests', 'info', 'A single test event.');
    const report = createDiagnosticsReport('tests', [event], [
      {
        code: 'diagnostics-note',
        level: 'info',
        message: 'Diagnostics note attached.',
      },
    ]);

    const logged = logDiagnosticsReport(report);

    expect(logged).toBe(report);
    expect(report.summary).toBe('1 event recorded');
    expect(report.notes).toHaveLength(1);
    expect(consoleSpy).toHaveBeenCalledWith('[tests] 1 event recorded');
  });
});

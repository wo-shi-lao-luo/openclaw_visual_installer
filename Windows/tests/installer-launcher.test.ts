import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';

const require = createRequire(import.meta.url);
const launcher = require('../launcher/installer-launcher.cjs');

function createTempDir() {
  return mkdtempSync(join(tmpdir(), 'openclaw-launcher-test-'));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('installer launcher debug helpers', () => {
  test('treats common truthy values as enabled', () => {
    expect(launcher.isTruthyEnvFlag('1')).toBe(true);
    expect(launcher.isTruthyEnvFlag('true')).toBe(true);
    expect(launcher.isTruthyEnvFlag('YES')).toBe(true);
    expect(launcher.isTruthyEnvFlag('on')).toBe(true);
    expect(launcher.isTruthyEnvFlag('')).toBe(false);
    expect(launcher.isTruthyEnvFlag('0')).toBe(false);
    expect(launcher.isTruthyEnvFlag('false')).toBe(false);
    expect(launcher.isTruthyEnvFlag(undefined)).toBe(false);
  });

  test('uses the exe directory by default for the debug log path', () => {
    const tempDir = createTempDir();

    expect(launcher.createDebugLogPath(tempDir)).toBe(join(tempDir, 'OpenClawInstaller.log'));

    rmSync(tempDir, { recursive: true, force: true });
  });

  test('writes persistent milestone logs to the exe directory when enabled', () => {
    const tempDir = createTempDir();
    const logger = launcher.createDebugLogger({ enabled: true, baseDir: tempDir });
    const logPath = logger.logPath;

    logger.append('Resolved embedded source root: /embedded/src');
    logger.append('Copy complete.');

    expect(logPath).toBe(join(tempDir, 'OpenClawInstaller.log'));
    expect(existsSync(logPath)).toBe(true);

    const content = readFileSync(logPath, 'utf8');
    expect(content).toContain('Resolved embedded source root: /embedded/src');
    expect(content).toContain('Copy complete.');

    rmSync(tempDir, { recursive: true, force: true });
  });

  test('records full error details when enabled', () => {
    const tempDir = createTempDir();
    const logger = launcher.createDebugLogger({ enabled: true, baseDir: tempDir });
    const logPath = logger.logPath;
    const error = new Error('boom');

    logger.logError(error);

    const content = readFileSync(logPath, 'utf8');
    expect(content).toContain('ERROR:');
    expect(content).toContain('boom');

    rmSync(tempDir, { recursive: true, force: true });
  });

  test('does not create a log file when disabled', () => {
    const tempDir = createTempDir();
    const logger = launcher.createDebugLogger({ enabled: false, baseDir: tempDir });
    const logPath = logger.logPath;

    logger.append('Copy complete.');
    logger.logError(new Error('boom'));

    expect(logPath).toBe(join(tempDir, 'OpenClawInstaller.log'));
    expect(existsSync(logPath)).toBe(false);

    rmSync(tempDir, { recursive: true, force: true });
  });
});

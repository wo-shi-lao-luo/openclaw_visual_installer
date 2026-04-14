"use strict";

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const TRUTHY_ENV_VALUES = new Set(['1', 'true', 'yes', 'on']);
const DEBUG_LOG_FILENAME = 'OpenClawInstaller.log';

function isTruthyEnvFlag(value) {
  if (typeof value !== 'string') {
    return false;
  }

  return TRUTHY_ENV_VALUES.has(value.trim().toLowerCase());
}

function createDebugLogPath(baseDir = path.dirname(process.execPath)) {
  return path.join(baseDir, DEBUG_LOG_FILENAME);
}

function formatDebugEntry(message) {
  return `[${new Date().toISOString()}] ${message}\n`;
}

function serializeError(error) {
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  return String(error);
}

function resolveDebugLoggingEnabled(options = {}) {
  if (typeof options.enabled === 'boolean') {
    return options.enabled;
  }

  const envValue = process.env.OPENCLAW_INSTALLER_DEBUG;
  if (typeof envValue === 'string') {
    return isTruthyEnvFlag(envValue);
  }

  return Boolean(process.pkg);
}

function createDebugLogger(options = {}) {
  const enabled = resolveDebugLoggingEnabled(options);
  const logPath = options.logPath ?? createDebugLogPath(options.baseDir);

  function append(message) {
    if (!enabled) {
      return;
    }

    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(logPath, formatDebugEntry(message));
  }

  return {
    enabled,
    logPath,
    append,
    logError(error) {
      append(`ERROR: ${serializeError(error)}`);
    },
  };
}

function resolveCliEntryPoint() {
  return path.join(__dirname, '..', 'dist', 'src', 'runtime', 'cli.js');
}

function runInstallerLauncher() {
  const logger = createDebugLogger();
  const cliEntryPoint = resolveCliEntryPoint();

  logger.append(`Resolved CLI entry point: ${cliEntryPoint}`);

  try {
    require(cliEntryPoint);
    logger.append('CLI loaded successfully.');
  } catch (error) {
    logger.logError(error);
    throw error;
  }
}

if (require.main === module) {
  try {
    runInstallerLauncher();
  } catch (error) {
    const message = error instanceof Error ? error.stack || error.message : String(error);
    process.stderr.write(`OpenClawInstaller failed: ${message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  createDebugLogPath,
  createDebugLogger,
  formatDebugEntry,
  isTruthyEnvFlag,
  resolveCliEntryPoint,
  runInstallerLauncher,
  serializeError,
};

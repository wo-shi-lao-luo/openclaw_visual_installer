import { describe, it, expect, vi } from 'vitest';
import { checkWindowsMinimumBuild, WINDOWS_MIN_BUILD } from '../../gui/main/osCheck.js';

describe('checkWindowsMinimumBuild', () => {
  it('exports the expected minimum build number', () => {
    expect(WINDOWS_MIN_BUILD).toBe(17763);
  });

  it('returns supported=true for Windows 10 1809 (build 17763)', () => {
    const result = checkWindowsMinimumBuild('10.0.17763');
    expect(result.supported).toBe(true);
    expect(result.buildNumber).toBe(17763);
  });

  it('returns supported=true for a higher build', () => {
    const result = checkWindowsMinimumBuild('10.0.19041'); // 2004
    expect(result.supported).toBe(true);
  });

  it('returns supported=true for Windows 11 (build 22000+)', () => {
    const result = checkWindowsMinimumBuild('10.0.22000');
    expect(result.supported).toBe(true);
  });

  it('returns supported=false for Windows 10 1803 (build 17134)', () => {
    const result = checkWindowsMinimumBuild('10.0.17134');
    expect(result.supported).toBe(false);
    expect(result.buildNumber).toBe(17134);
    expect(result.reason).toContain('17134');
  });

  it('returns supported=false for Windows 8 style release string', () => {
    const result = checkWindowsMinimumBuild('6.2.9200');
    expect(result.supported).toBe(false);
  });

  it('returns supported=false and reason for unknown parse failure', () => {
    const result = checkWindowsMinimumBuild('not-a-release');
    expect(result.supported).toBe(false);
    expect(typeof result.reason).toBe('string');
  });
});

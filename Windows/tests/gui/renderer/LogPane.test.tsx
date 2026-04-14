import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LogPane } from '../../../gui/renderer/src/components/LogPane.js';
import type { LogLine } from '../../../gui/renderer/src/state/types.js';

describe('LogPane', () => {
  it('renders log lines', () => {
    const logs: LogLine[] = [
      { line: 'Installing Node.js...', stream: 'info' },
      { line: 'Error: something bad', stream: 'stderr' },
    ];
    render(<LogPane logs={logs} />);
    expect(screen.getByText('Installing Node.js...')).toBeInTheDocument();
    expect(screen.getByText('Error: something bad')).toBeInTheDocument();
  });

  it('applies correct class for stderr lines', () => {
    const logs: LogLine[] = [{ line: 'Error!', stream: 'stderr' }];
    render(<LogPane logs={logs} />);
    const line = screen.getByText('Error!');
    expect(line.className).toContain('stderr');
  });

  it('renders an empty pane without crashing', () => {
    render(<LogPane logs={[]} />);
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  it('has aria-live polite for screen reader support', () => {
    render(<LogPane logs={[]} />);
    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite');
  });
});

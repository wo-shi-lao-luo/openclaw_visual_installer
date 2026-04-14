import React, { useCallback, useReducer } from 'react';
import { createInitialState, installerReducer } from './state/installerStore.js';
import { useInstallerEvents } from './hooks/useInstallerEvents.js';
import { StartScreen } from './components/StartScreen.js';
import { HorizontalTimeline } from './components/HorizontalTimeline.js';
import { ProgressBar } from './components/ProgressBar.js';
import { StreamMessage } from './components/StreamMessage.js';
import { ConfirmModal } from './components/ConfirmModal.js';
import { ResultSection } from './components/ResultSection.js';
import type { InstallerEvent } from '../../shared/ipc-contract.js';

export function App(): React.ReactElement {
  const [state, dispatch] = useReducer(installerReducer, undefined, createInitialState);

  const handleEvent = useCallback((event: InstallerEvent) => {
    dispatch({ type: 'EVENT', event });
  }, []);

  useInstallerEvents(handleEvent);

  function handleStart() {
    dispatch({ type: 'START_RUN', mode: 'install' });
    window.installerApi.start({ mode: 'install' });
  }

  function handleConfirm() {
    if (!state.pendingPrompt) return;
    const { id } = state.pendingPrompt;
    dispatch({ type: 'PROMPT_RESPONDED', id, confirmed: true });
    window.installerApi.respondConfirm(id, true);
  }

  function handleCancel() {
    if (!state.pendingPrompt) return;
    const { id } = state.pendingPrompt;
    dispatch({ type: 'PROMPT_RESPONDED', id, confirmed: false });
    window.installerApi.respondConfirm(id, false);
  }

  function handleRestart() {
    dispatch({ type: 'START_RUN', mode: 'install' });
    window.installerApi.start({ mode: 'install' });
  }

  const isActive = state.phase === 'running' || state.phase === 'success' || state.phase === 'failed';

  return (
    <div className="app">
      {isActive && (
        <header className="app__header">
          <span className="app__header-lobster" aria-hidden="true">🦞</span>
          <span className="app__header-name">OpenClaw</span>
          <span className="app__header-version">v0.3.0</span>
        </header>
      )}

      <div className="app__body">
        {state.phase === 'idle' && <StartScreen onStart={handleStart} />}

        {isActive && (
          <div className="installer-view">
            <HorizontalTimeline steps={state.steps} />
            <ProgressBar steps={state.steps} phase={state.phase} />
            <StreamMessage logs={state.logs} steps={state.steps} />
            {(state.phase === 'success' || state.phase === 'failed') && (
              <ResultSection
                success={state.phase === 'success'}
                result={state.result}
                errorMessage={state.errorMessage}
                onRestart={handleRestart}
              />
            )}
          </div>
        )}
      </div>

      {state.pendingPrompt && (
        <ConfirmModal
          question={state.pendingPrompt.question}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

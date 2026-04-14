import React, { useCallback, useReducer } from 'react';
import {
  createInitialState,
  installerReducer,
} from './state/installerStore.js';
import { useInstallerEvents } from './hooks/useInstallerEvents.js';
import { StartScreen } from './components/StartScreen.js';
import { StepList } from './components/StepList.js';
import { LogPane } from './components/LogPane.js';
import { ConfirmModal } from './components/ConfirmModal.js';
import { ResultScreen } from './components/ResultScreen.js';
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
  }

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__brand">OpenClaw Installer</span>
      </header>

      <main className="app__main">
        {state.phase === 'idle' && <StartScreen onStart={handleStart} />}

        {(state.phase === 'running' || state.phase === 'success' || state.phase === 'failed') && (
          <>
            <StepList steps={state.steps} />
            <LogPane logs={state.logs} />
          </>
        )}

        {(state.phase === 'success' || state.phase === 'failed') && (
          <ResultScreen
            success={state.phase === 'success'}
            result={state.result}
            errorMessage={state.errorMessage}
            onRestart={handleRestart}
          />
        )}
      </main>

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

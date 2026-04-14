import React from 'react';

interface Props {
  question: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ question, onConfirm, onCancel }: Props): React.ReactElement {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-question">
      <div className="modal">
        <p id="confirm-question" className="modal__question">{question}</p>
        <div className="modal__actions">
          <button
            className="btn btn--primary"
            onClick={onConfirm}
            autoFocus
          >
            Yes, install
          </button>
          <button
            className="btn btn--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

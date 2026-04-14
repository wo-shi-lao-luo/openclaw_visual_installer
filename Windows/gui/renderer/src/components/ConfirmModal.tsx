import React from 'react';
import { useLocale } from '../i18n/LocaleContext.js';

interface Props {
  question: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ question, onConfirm, onCancel }: Props): React.ReactElement {
  const { t } = useLocale();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-question">
      <div className="modal">
        <div className="modal__lobster" aria-hidden="true">🦞</div>
        <p id="confirm-question" className="modal__question">{question}</p>
        <div className="modal__actions">
          <button className="btn btn--secondary" onClick={onCancel}>
            {t('modal_cancel')}
          </button>
          <button className="btn btn--primary" onClick={onConfirm} autoFocus>
            {t('modal_confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

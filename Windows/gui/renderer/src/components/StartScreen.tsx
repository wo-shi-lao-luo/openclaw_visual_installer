import React from 'react';
import { useLocale } from '../i18n/LocaleContext.js';
import type { Locale } from '../i18n/translations.js';

interface Props {
  onStart: () => void;
}

const LOCALES: { id: Locale; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'zh', label: '中文' },
];

export function StartScreen({ onStart }: Props): React.ReactElement {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="start-screen">
      <div className="lang-switcher" role="group" aria-label="Language">
        {LOCALES.map(({ id, label }) => (
          <button
            key={id}
            className={`lang-btn ${locale === id ? 'lang-btn--active' : ''}`}
            onClick={() => setLocale(id)}
            aria-pressed={locale === id}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="start-screen__lobster" aria-hidden="true">🦞</div>
      <h1 className="start-screen__title">OpenClaw</h1>
      <p className="start-screen__desc">
        {t('start_desc').split('\n').map((line, i) => (
          <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
        ))}
      </p>
      <button className="btn btn--primary btn--large" onClick={onStart}>
        {t('start_button')}
      </button>
    </div>
  );
}

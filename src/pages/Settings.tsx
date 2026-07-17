import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGE_LABELS } from '../lib/i18n';
import Topbar from '../components/Topbar';
import CurrencyModal from '../components/CurrencyModal';
import LanguageModal from '../components/LanguageModal';
import AboutModal from '../components/AboutModal';
import { Coins, ChevronRight, Radio, WifiOff, Languages, Info } from 'lucide-react';

export default function Settings() {
  const { currency, liveRates } = useFinance();
  const { language, t } = useLanguage();
  const [showCurrency, setShowCurrency] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Topbar title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="flex max-w-md flex-col gap-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-flat)]">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <Coins size={15} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t('settings.currency.title')}</h3>
          </div>
          <p className="mb-3 text-xs text-[var(--color-ink-soft)]">{t('settings.currency.desc')}</p>
          <div
            className={`mb-3 flex items-center gap-1.5 text-[11px] font-medium ${
              liveRates.isLive ? 'text-[var(--color-primary)]' : 'text-[var(--color-warn)]'
            }`}
          >
            {liveRates.isLive ? <Radio size={11} /> : <WifiOff size={11} />}
            {liveRates.isLive ? t('currency.liveOnShort') : t('currency.liveOffShort')}
          </div>
          <button
            onClick={() => setShowCurrency(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-left transition hover:border-[var(--color-primary)]/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-base font-semibold text-[var(--color-primary-strong)]">
              {currency.symbol}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--color-ink)]">{currency.code}</span>
              <span className="block truncate text-xs text-[var(--color-muted)]">{currency.label}</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-[var(--color-muted)]" />
          </button>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-flat)]">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Languages size={15} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t('settings.language.title')}</h3>
          </div>
          <p className="mb-3 text-xs text-[var(--color-ink-soft)]">{t('settings.language.desc')}</p>
          <button
            onClick={() => setShowLanguage(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-left transition hover:border-[var(--color-primary)]/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Languages size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--color-ink)]">{LANGUAGE_LABELS[language].native}</span>
              <span className="block truncate text-xs text-[var(--color-muted)]">{LANGUAGE_LABELS[language].label}</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-[var(--color-muted)]" />
          </button>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-flat)]">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-warn-soft)] text-[var(--color-warn)]">
              <Info size={15} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t('settings.about.title')}</h3>
          </div>
          <p className="mb-3 text-xs text-[var(--color-ink-soft)]">{t('settings.about.desc')}</p>
          <button
            onClick={() => setShowAbout(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-left transition hover:border-[var(--color-primary)]/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-warn-soft)] text-[var(--color-warn)]">
              <Info size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--color-ink)]">{t('about.appName')}</span>
              <span className="block truncate text-xs text-[var(--color-muted)]">{t('about.tagline')}</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-[var(--color-muted)]" />
          </button>
        </div>
      </div>

      <CurrencyModal open={showCurrency} onClose={() => setShowCurrency(false)} />
      <LanguageModal open={showLanguage} onClose={() => setShowLanguage(false)} />
      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}

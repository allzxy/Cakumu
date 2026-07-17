import Modal from './Modal';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGE_LABELS, type Language } from '../lib/i18n';
import { Check, Languages } from 'lucide-react';

const ORDER: Language[] = ['id', 'en'];

export default function LanguageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Modal open={open} onClose={onClose} title={t('language.modalTitle')}>
      <div className="flex flex-col gap-1">
        {ORDER.map((lang) => {
          const meta = LANGUAGE_LABELS[lang];
          const isSelected = language === lang;
          return (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                onClose();
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                isSelected
                  ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                  : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-alt)]'
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-alt)] text-[var(--color-ink-soft)]">
                <Languages size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{meta.native}</span>
                <span className="block truncate text-xs text-[var(--color-muted)]">{meta.label}</span>
              </span>
              {isSelected && <Check size={16} className="shrink-0 text-[var(--color-primary)]" />}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

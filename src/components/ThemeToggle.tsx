import { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: t('theme.light'), icon: Sun },
    { value: 'dark', label: t('theme.dark'), icon: Moon },
    { value: 'system', label: t('theme.system'), icon: Monitor },
  ];

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const ActiveIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('common.edit')}
        aria-expanded={open}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] transition hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]"
      >
        <ActiveIcon size={17} strokeWidth={2} />
      </button>

      {open && (
        <div className="animate-rise absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 shadow-[var(--shadow-flat)]">
          <p className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">{t('theme.appearance')}</p>
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition ${
                theme === opt.value
                  ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                  : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-alt)]'
              }`}
            >
              <opt.icon size={15} strokeWidth={2} className="shrink-0" />
              <span className="flex-1">{opt.label}</span>
              {theme === opt.value && <Check size={14} className="shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

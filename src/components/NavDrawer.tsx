import { NavLink } from 'react-router-dom';
import { LayoutGrid, Wallet, Tag, History, Settings, Leaf, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutGrid, end: true },
    { to: '/wallets', label: t('nav.wallets'), icon: Wallet, end: false },
    { to: '/categories', label: t('nav.categories'), icon: Tag, end: false },
    { to: '/history', label: t('nav.history'), icon: History, end: false },
    { to: '/settings', label: t('nav.settings'), icon: Settings, end: false },
  ];

  if (!open) return null;

  return (
    <div className="animate-fade fixed inset-0 z-[70] flex">
      <div className="absolute inset-0 bg-[#1e241f]/45" onClick={onClose} />
      <div className="animate-rise relative flex h-full w-72 max-w-[80vw] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6">
        <div className="mb-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] shadow-sm">
              <Leaf size={18} strokeWidth={2.2} />
            </div>
            <div>
              <p className="font-bold tracking-tight text-lg leading-none text-[var(--color-ink)]">Cakumu</p>
              <p className="text-[11px] tracking-wide text-[var(--color-muted)]">{t('nav.tagline')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-surface-alt)]"
            aria-label={t('nav.closeMenu')}
          >
            <X size={16} />
          </button>
        </div>

        <p className="mb-2 px-3.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">{t('nav.menu')}</p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-contrast)] shadow-[var(--shadow-flat)]'
                    : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-alt)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive ? 'bg-black/10 text-[var(--color-primary-contrast)]' : 'bg-[var(--color-surface-alt)] text-[var(--color-ink-soft)]'
                    }`}
                  >
                    <item.icon size={16} strokeWidth={2} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

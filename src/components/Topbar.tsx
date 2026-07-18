import { Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  title: string;
  subtitle: string;
  onAddTransaction?: () => void;
}

export default function Topbar({ title, subtitle, onAddTransaction }: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate font-bold tracking-tight text-xl text-[var(--color-ink)] sm:text-2xl lg:text-3xl">{title}</h1>
        <p className="mt-0.5 truncate text-xs text-[var(--color-muted)] sm:text-sm">{subtitle}</p>
      </div>

      {onAddTransaction && (
        <button
          onClick={onAddTransaction}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-[var(--color-primary-contrast)] shadow-[var(--shadow-flat)] transition hover:bg-[var(--color-primary-strong)]"
        >
          <Plus size={14} />
          {t('topbar.addTransaction')}
        </button>
      )}
    </div>
  );
}

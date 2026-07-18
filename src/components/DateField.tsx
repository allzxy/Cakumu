import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import DatePickerModal from './DatePickerModal';
import { useLanguage } from '../context/LanguageContext';

function formatDisplay(value: string, placeholder: string, locale: string) {
  if (!value) return placeholder;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return placeholder;
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString(locale, { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString(locale, { month: 'long' });
  const year = date.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

interface Props {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  nested?: boolean;
  allowClear?: boolean;
}

export default function DateField({ value, onChange, placeholder, nested = false, allowClear = false }: Props) {
  const [open, setOpen] = useState(false);
  const { t, locale } = useLanguage();
  const finalPlaceholder = placeholder || t('date.pick');

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-left text-sm text-[var(--color-ink)] outline-none transition hover:border-[var(--color-primary)]/40 focus:border-[var(--color-primary)]"
      >
        <CalendarDays size={15} className="shrink-0 text-[var(--color-primary)]" />
        <span className="min-w-0 flex-1 truncate">{formatDisplay(value, finalPlaceholder, locale)}</span>
      </button>

      <DatePickerModal
        open={open}
        onClose={() => setOpen(false)}
        value={value}
        onChange={onChange}
        nested={nested}
        allowClear={allowClear}
      />
    </>
  );
}
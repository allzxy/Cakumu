import { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import MonthCalendarModal from './MonthCalendarModal';
import { useLanguage } from '../context/LanguageContext';

function formatMonthLabel(key: string, locale: string) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

function formatDateLabel(dateKey: string, locale: string) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

interface Props {
  value: string;
  onChange: (month: string) => void;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export default function MonthFilter({ value, onChange, selectedDate, onSelectDate }: Props) {
  const [open, setOpen] = useState(false);
  const { locale } = useLanguage();

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex w-full items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 shadow-[var(--shadow-flat)] transition hover:border-[var(--color-primary)]/40 sm:w-auto">
        <CalendarDays size={14} className="shrink-0 text-[var(--color-primary)]" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--color-ink)] sm:flex-none">
          {selectedDate ? formatDateLabel(selectedDate, locale) : formatMonthLabel(value, locale)}
        </span>
        <ChevronDown size={14} className="shrink-0 text-[var(--color-muted)]" />
      </button>
      <MonthCalendarModal open={open} onClose={() => setOpen(false)} value={value} onChange={onChange} selectedDate={selectedDate} onSelectDate={onSelectDate} />
    </>
  );
}

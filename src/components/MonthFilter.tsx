import { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import MonthCalendarModal from './MonthCalendarModal';

const MONTH_LABELS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatMonthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_LABELS[m - 1]} ${y}`;
}

function formatDateLabel(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return `${d} ${MONTH_LABELS[m - 1]} ${y}`;
}

interface Props {
  value: string;
  onChange: (month: string) => void;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export default function MonthFilter({ value, onChange, selectedDate, onSelectDate }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 shadow-[var(--shadow-flat)] transition hover:border-[var(--color-primary)]/40 sm:w-auto"
      >
        <CalendarDays size={14} className="shrink-0 text-[var(--color-primary)]" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--color-ink)] sm:flex-none">
          {selectedDate ? formatDateLabel(selectedDate) : formatMonthLabel(value)}
        </span>
        <ChevronDown size={14} className="shrink-0 text-[var(--color-muted)]" />
      </button>

      <MonthCalendarModal
        open={open}
        onClose={() => setOpen(false)}
        value={value}
        onChange={onChange}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />
    </>
  );
}

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import DatePickerModal from './DatePickerModal';

function formatDisplay(value: string, placeholder: string) {
  if (!value) return placeholder;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return placeholder;
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('id-ID', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString('id-ID', { month: 'long' });
  const year = date.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

interface Props {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  /** Set true when this field lives inside another modal, so its picker stacks above it. */
  nested?: boolean;
  /** Show a "Semua Tanggal" option in the picker that clears the value. */
  allowClear?: boolean;
}

export default function DateField({ value, onChange, placeholder = 'Pilih tanggal', nested = false, allowClear = false }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-left text-sm text-[var(--color-ink)] outline-none transition hover:border-[var(--color-primary)]/40 focus:border-[var(--color-primary)]"
      >
        <CalendarDays size={15} className="shrink-0 text-[var(--color-primary)]" />
        <span className="min-w-0 flex-1 truncate">{formatDisplay(value, placeholder)}</span>
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

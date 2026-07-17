import { useEffect, useState } from 'react';
import Modal from './Modal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Selected month in YYYY-MM format. */
  value: string;
  onChange: (month: string) => void;
  /** Currently selected specific date (YYYY-MM-DD), or null for whole-month view. */
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  /** Set true when opened from within another modal so it stacks above it. */
  nested?: boolean;
}

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function parseValue(value: string): { year: number; month: number } {
  const [y, m] = value.split('-').map(Number);
  if (y && m) return { year: y, month: m - 1 };
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export default function MonthCalendarModal({ open, onClose, value, onChange, selectedDate, onSelectDate, nested = false }: Props) {
  const [viewYear, setViewYear] = useState(() => parseValue(value).year);
  const [viewMonth, setViewMonth] = useState(() => parseValue(value).month);

  useEffect(() => {
    if (open) {
      const v = parseValue(value);
      setViewYear(v.year);
      setViewMonth(v.month);
    }
  }, [open, value]);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel = firstOfMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const monthKey = `${viewYear}-${pad(viewMonth + 1)}`;

  const now = new Date();
  const isCurrentMonthView = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const todayDate = now.getDate();

  const isSelectedMonthView = monthKey === value;
  // Sel tanggal yang cocok dengan selectedDate aktif (hanya jika berada di bulan yang sedang dilihat).
  const selectedDay =
    selectedDate && selectedDate.slice(0, 7) === monthKey ? parseInt(selectedDate.slice(8, 10), 10) : null;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const shiftMonth = (dir: 1 | -1) => {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  // Memilih tanggal tertentu: pindah ke bulan tersebut dan sinkronkan tanggalnya ke ringkasan.
  const pickDay = (d: number) => {
    const dateKey = `${monthKey}-${pad(d)}`;
    onChange(monthKey);
    onSelectDate(selectedDate === dateKey ? null : dateKey);
    onClose();
  };

  // Mengonfirmasi seluruh bulan (tanpa tanggal spesifik).
  const confirmWholeMonth = (y: number, m: number) => {
    onChange(`${y}-${pad(m + 1)}`);
    onSelectDate(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Pilih Tanggal" nested={nested}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-soft)] transition hover:bg-[var(--color-surface-alt)]"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => confirmWholeMonth(viewYear, viewMonth)}
            className={`rounded-lg px-3 py-1 text-sm font-semibold capitalize transition hover:bg-[var(--color-surface-alt)] ${
              isSelectedMonthView && selectedDay === null ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink)]'
            }`}
          >
            {monthLabel}
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-soft)] transition hover:bg-[var(--color-surface-alt)]"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[var(--color-muted)]">
          {WEEKDAY_LABELS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <span key={`empty-${i}`} />;
            const isToday = isCurrentMonthView && d === todayDate;
            const isSelected = selectedDay === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => pickDay(d)}
                className={`aspect-square rounded-lg text-sm font-medium transition ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-contrast)]'
                    : isToday
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                    : 'text-[var(--color-ink)] hover:bg-[var(--color-surface-alt)]'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-[var(--color-muted)]">
          Ketuk tanggal untuk melihat data hari itu saja, atau nama bulan untuk melihat sebulan penuh
        </p>

        <button
          type="button"
          onClick={() => confirmWholeMonth(now.getFullYear(), now.getMonth())}
          className="mt-1 rounded-xl bg-[var(--color-surface-alt)] py-2.5 text-sm font-medium text-[var(--color-ink-soft)] transition hover:bg-[var(--color-border)]"
        >
          Bulan Ini
        </button>
      </div>
    </Modal>
  );
}

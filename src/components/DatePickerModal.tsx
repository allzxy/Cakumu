import { useEffect, useState } from 'react';
import Modal from './Modal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Selected date in YYYY-MM-DD format. */
  value: string;
  onChange: (date: string) => void;
  /** Set true when opened from within another modal so it stacks above it. */
  nested?: boolean;
  /** Show a "Semua Tanggal" option that clears the date (passes ''). Used for filters. */
  allowClear?: boolean;
}

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function parseValue(value: string): Date {
  if (value) {
    const [y, m, d] = value.split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
  }
  return new Date();
}

export default function DatePickerModal({ open, onClose, value, onChange, nested = false, allowClear = false }: Props) {
  const [viewYear, setViewYear] = useState(() => parseValue(value).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parseValue(value).getMonth());

  useEffect(() => {
    if (open) {
      const d = parseValue(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [open, value]);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel = firstOfMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const today = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

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

  const selectDay = (d: number) => {
    onChange(toDateKey(viewYear, viewMonth, d));
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
          <span className="text-sm font-semibold capitalize text-[var(--color-ink)]">{monthLabel}</span>
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
            const dateKey = toDateKey(viewYear, viewMonth, d);
            const isSelected = dateKey === value;
            const isToday = dateKey === todayKey;
            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => selectDay(d)}
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

        <div className="mt-1 flex gap-2">
          {allowClear && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                onClose();
              }}
              className="flex-1 rounded-xl bg-[var(--color-surface-alt)] py-2.5 text-sm font-medium text-[var(--color-ink-soft)] transition hover:bg-[var(--color-border)]"
            >
              Semua Tanggal
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onChange(todayKey);
              onClose();
            }}
            className={`rounded-xl py-2.5 text-sm font-medium transition ${
              allowClear
                ? 'flex-1 bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] hover:bg-[var(--color-primary)]/20'
                : 'flex-1 bg-[var(--color-surface-alt)] text-[var(--color-ink-soft)] hover:bg-[var(--color-border)]'
            }`}
          >
            Hari Ini
          </button>
        </div>
      </div>
    </Modal>
  );
}

import { useMemo } from 'react';
import Modal from './Modal';
import SelectField from './SelectField';
import DateField from './DateField';
import { useFinance } from '../context/FinanceContext';
import { CATEGORY_ICONS } from '../lib/icons';
import type { TransactionType } from '../lib/types';

export interface TransactionFilters {
  /** Exact date in YYYY-MM-DD format, or '' for all dates. */
  date: string;
  type: 'all' | TransactionType;
  categoryId: string; // 'all' or category id
}

interface Props {
  open: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export default function TransactionFilterModal({ open, onClose, filters, onChange }: Props) {
  const { categories } = useFinance();

  const relevantCategories = useMemo(
    () => categories.filter((c) => filters.type === 'all' || c.type === filters.type),
    [categories, filters.type]
  );

  const update = (patch: Partial<TransactionFilters>) => onChange({ ...filters, ...patch });

  const reset = () => onChange({ date: '', type: 'all', categoryId: 'all' });

  const isFiltered = filters.date !== '' || filters.type !== 'all' || filters.categoryId !== 'all';

  return (
    <Modal open={open} onClose={onClose} title="Filter Transaksi">
      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Tanggal</label>
          <DateField
            value={filters.date}
            onChange={(d) => update({ date: d })}
            placeholder="Semua Tanggal"
            allowClear
            nested
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">Jenis</label>
          <div className="flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1 text-xs font-medium">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update({ type: t, categoryId: 'all' })}
                className={`flex-1 rounded-full py-2 transition ${
                  filters.type === t
                    ? t === 'income'
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-contrast)] shadow-sm'
                      : t === 'expense'
                      ? 'bg-[var(--color-warn)] text-[var(--color-warn-contrast)] shadow-sm'
                      : 'bg-[var(--color-neutral)] text-[var(--color-neutral-contrast)] shadow-sm'
                    : 'text-[var(--color-ink-soft)]'
                }`}
              >
                {t === 'all' ? 'Semua' : t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </button>
            ))}
          </div>
        </div>

        <SelectField
          label="Kategori"
          modalTitle="Pilih Kategori"
          nested
          value={filters.categoryId}
          onChange={(v) => update({ categoryId: v })}
          options={[
            { value: 'all', label: 'Semua Kategori' },
            ...relevantCategories.map((c) => ({
              value: c.id,
              label: c.name,
              icon: CATEGORY_ICONS[c.icon],
              color: c.color,
            })),
          ]}
        />

        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={!isFiltered}
            className="flex-1 rounded-xl bg-[var(--color-surface-alt)] py-2.5 text-sm font-medium text-[var(--color-ink-soft)] transition hover:bg-[var(--color-border)] disabled:opacity-40"
          >
            Atur Ulang
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-[var(--color-primary-contrast)] shadow-[var(--shadow-flat)] transition hover:bg-[var(--color-primary-strong)]"
          >
            Terapkan
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function categoryIconFor(icon?: string) {
  return icon ? CATEGORY_ICONS[icon] : undefined;
}

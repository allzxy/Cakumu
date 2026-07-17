import { useEffect, useState } from 'react';
import Modal from './Modal';
import DateField from './DateField';
import SelectField from './SelectField';
import { useFinance } from '../context/FinanceContext';
import { CATEGORY_ICONS, WALLET_ICONS } from '../lib/icons';
import type { Transaction, TransactionType } from '../lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  /** When provided, the modal edits this existing transaction instead of creating a new one. */
  editing?: Transaction | null;
}

export default function AddTransactionModal({ open, onClose, editing }: Props) {
  const { categories, wallets, currency, addTransaction, updateTransaction, fromDisplay, toDisplay } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const filteredCategories = categories.filter((c) => c.type === type && (!c.system || c.id === editing?.categoryId));
  const isEditing = !!editing;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type);
      setDescription(editing.description);
      setAmount(String(Number(toDisplay(editing.amount).toFixed(2))));
      setCategoryId(editing.categoryId);
      setWalletId(editing.walletId);
      setDate(editing.date);
    } else {
      setType('expense');
      setDescription('');
      setAmount('');
      setCategoryId('');
      setWalletId(wallets[0]?.id ?? '');
      setDate(new Date().toISOString().slice(0, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const reset = () => {
    setDescription('');
    setAmount('');
    setCategoryId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || !parsedAmount || parsedAmount <= 0 || !walletId) return;
    const finalCategory = categoryId || filteredCategories[0]?.id || categories[0]?.id;

    if (isEditing && editing) {
      updateTransaction(editing.id, {
        date,
        description: description.trim(),
        categoryId: finalCategory,
        walletId,
        type,
        amount: fromDisplay(parsedAmount),
      });
    } else {
      addTransaction({
        date,
        description: description.trim(),
        categoryId: finalCategory,
        walletId,
        type,
        amount: fromDisplay(parsedAmount),
      });
    }
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Ubah Transaksi' : 'Tambah Transaksi'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1 text-sm font-medium">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategoryId('');
              }}
              className={`flex-1 rounded-full py-2 transition ${
                type === t
                  ? t === 'income'
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-contrast)] shadow-sm'
                    : 'bg-[var(--color-warn)] text-[var(--color-warn-contrast)] shadow-sm'
                  : 'text-[var(--color-ink-soft)]'
              }`}
            >
              {t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Deskripsi</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="cth. Belanja bulanan"
            required
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Jumlah ({currency.symbol})</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
          />
        </div>

        <DateField value={date} onChange={setDate} />

        <SelectField
          label="Kategori"
          modalTitle="Pilih Kategori"
          value={categoryId || filteredCategories[0]?.id || ''}
          onChange={setCategoryId}
          options={filteredCategories.map((c) => ({
            value: c.id,
            label: c.name,
            icon: CATEGORY_ICONS[c.icon],
            color: c.color,
          }))}
        />

        <SelectField
          label="Dompet"
          modalTitle="Pilih Dompet"
          value={walletId}
          onChange={setWalletId}
          options={wallets.map((w) => ({
            value: w.id,
            label: w.name,
            icon: WALLET_ICONS[w.type],
            color: w.color,
          }))}
        />

        <button
          type="submit"
          className="mt-2 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-[var(--color-primary-contrast)] shadow-[var(--shadow-flat)] transition hover:bg-[var(--color-primary-strong)]"
        >
          {isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi'}
        </button>
      </form>
    </Modal>
  );
}

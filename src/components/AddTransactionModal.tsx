import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Transaction } from '../lib/types';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Transaction | null;
}

export default function AddTransactionModal({ open, onClose, editing }: Props) {
  const { wallets, categories, addTransaction, updateTransaction } = useFinance();
  const { t } = useLanguage();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        setType(editing.type);
        setAmount(editing.amount.toString());
        setDescription(editing.description);
        setCategoryId(editing.categoryId);
        setWalletId(editing.walletId);
        setDate(editing.date);
      } else {
        setType('expense');
        setAmount('');
        setDescription('');
        setDate(() => {
          const d = new Date();
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        });

        // Set default kategori
        const expenseCats = categories.filter((c) => c.type === 'expense');
        if (expenseCats.length > 0) setCategoryId(expenseCats[0].id);
        else if (categories.length > 0) setCategoryId(categories[0].id);
        else setCategoryId('');

        // Set default dompet
        if (wallets.length > 0) setWalletId(wallets[0].id);
        else setWalletId('');
      }
    }
  }, [open, editing, categories, wallets]);

  // Ubah kategori default otomatis ketika tipe (pengeluaran/pemasukan) diubah
  useEffect(() => {
    if (open && !editing && categories.length > 0) {
      const typeCats = categories.filter((c) => c.type === type);
      if (typeCats.length > 0 && !typeCats.find((c) => c.id === categoryId)) {
        setCategoryId(typeCats[0].id);
      }
    }
  }, [type, open, editing, categories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !categoryId || !walletId) return;

    const payload = {
      type,
      amount: numAmount,
      description,
      categoryId,
      walletId,
      date,
    };

    if (editing) {
      updateTransaction(editing.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  const typeCategories = categories.filter((c) => c.type === type);

  // --- 1. LAYAR ARAHAN JIKA DATA KOSONG ---
  if (wallets.length === 0 || categories.length === 0) {
    return (
      <Modal open={open} onClose={onClose} title="Data Belum Lengkap">
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-warn-soft)] text-[var(--color-warn)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3 className="mb-2 text-lg font-bold text-[var(--color-ink)]">
            {wallets.length === 0 ? 'Dompet Belum Tersedia' : 'Kategori Belum Tersedia'}
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-[var(--color-muted)]">
            {wallets.length === 0 
              ? 'Anda harus membuat minimal 1 dompet (seperti Tunai atau Rekening) terlebih dahulu sebelum bisa mencatat transaksi.' 
              : 'Anda harus membuat minimal 1 kategori pengeluaran/pemasukan terlebih dahulu sebelum bisa mencatat transaksi.'}
          </p>
          <div className="flex w-full gap-3 sm:gap-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-[var(--color-surface-alt)] py-3 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]">
              Batal
            </button>
            {wallets.length === 0 ? (
              <Link to="/wallets" onClick={onClose} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-[var(--color-primary-contrast)] shadow-sm transition hover:opacity-90">
                Buat Dompet
              </Link>
            ) : (
              <Link to="/categories" onClick={onClose} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-[var(--color-primary-contrast)] shadow-sm transition hover:opacity-90">
                Buat Kategori
              </Link>
            )}
          </div>
        </div>
      </Modal>
    );
  }

  // --- 2. LAYAR FORMULIR NORMAL ---
  return (
    <Modal open={open} onClose={onClose} title={editing ? t('common.edit') : t('addTx.title')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Toggle Pengeluaran / Pemasukan */}
        <div className="flex rounded-xl bg-[var(--color-surface-alt)] p-1">
          <button type="button" onClick={() => setType('expense')} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${type === 'expense' ? 'bg-[var(--color-surface)] text-[var(--color-warn)] shadow-sm' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'}`}>
            {t('categories.expense')}
          </button>
          <button type="button" onClick={() => setType('income')} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${type === 'income' ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'}`}>
            {t('categories.income')}
          </button>
        </div>

        {/* Input Jumlah */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">{t('addTx.amount')}</label>
          <input type="number" step="any" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-lg font-bold text-[var(--color-ink)] transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="0" />
        </div>

        {/* Input Keterangan */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">{t('addTx.description')}</label>
          <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder={t('addTx.descPlaceholder') || 'Misal: Beli Kopi'} />
        </div>

        {/* Pilihan Kategori & Dompet */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">{t('addTx.category')}</label>
            <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20">
              {typeCategories.length === 0 && <option value="" disabled>Belum ada kategori</option>}
              {typeCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">{t('addTx.wallet')}</label>
            <select required value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20">
              {wallets.length === 0 && <option value="" disabled>Belum ada dompet</option>}
              {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        {/* Input Tanggal */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">{t('addTx.date')}</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" />
        </div>

        {/* Tombol Aksi Batal & Simpan */}
        <div className="mt-2 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-[var(--color-surface-alt)] py-3 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]">
            {t('common.cancel') || 'Batal'}
          </button>
          <button type="submit" className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-[var(--color-primary-contrast)] shadow-sm transition hover:opacity-90">
            {t('common.save') || 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
import { useEffect, useState } from 'react';
import Modal from './Modal';
import SelectField from './SelectField';
import { useFinance } from '../context/FinanceContext';
import { WALLET_ICONS } from '../lib/icons';
import type { Wallet, WalletType } from '../lib/types';
import { Wallet as WalletIcon, CreditCard, PiggyBank, Smartphone } from 'lucide-react';

const TYPE_OPTIONS: { value: WalletType; label: string; icon: typeof WalletIcon }[] = [
  { value: 'cash', label: 'Tunai', icon: WalletIcon },
  { value: 'bank', label: 'Rekening Bank', icon: CreditCard },
  { value: 'savings', label: 'Target Tabungan', icon: PiggyBank },
  { value: 'digital', label: 'Saldo Digital', icon: Smartphone },
];

const PALETTE = ['#1f7a5c', '#3c6ea5', '#c9a84c', '#8a5fc9', '#c1704a', '#4d8fa6', '#b5523e', '#6a7a4f'];

interface Props {
  open: boolean;
  onClose: () => void;
  /** Wallet being edited, or null when creating a new one. */
  editing?: Wallet | null;
}

export default function WalletFormModal({ open, onClose, editing }: Props) {
  const { wallets, currency, addWallet, updateWallet, toDisplay, fromDisplay } = useFinance();
  const isEditing = !!editing;

  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('cash');
  const [balance, setBalance] = useState('');
  const [goal, setGoal] = useState('');
  const [institution, setInstitution] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setType(editing.type);
      setBalance(String(Number(toDisplay(editing.balance).toFixed(2))));
      setGoal(editing.goalAmount ? String(Number(toDisplay(editing.goalAmount).toFixed(2))) : '');
      setInstitution(editing.institution ?? '');
    } else {
      setName('');
      setType('cash');
      setBalance('');
      setGoal('');
      setInstitution('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && editing) {
      updateWallet(editing.id, {
        name: name.trim(),
        type,
        goalAmount: type === 'savings' && goal ? fromDisplay(parseFloat(goal)) : undefined,
        institution: institution.trim() || undefined,
      });
    } else {
      addWallet({
        name: name.trim(),
        type,
        balance: fromDisplay(parseFloat(balance) || 0),
        color: PALETTE[wallets.length % PALETTE.length],
        goalAmount: type === 'savings' && goal ? fromDisplay(parseFloat(goal)) : undefined,
        institution: institution.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Ubah Dompet' : 'Dompet Baru'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Nama dompet</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="cth. Dana Liburan"
            required
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
          />
        </div>

        <SelectField
          label="Jenis"
          modalTitle="Pilih Jenis Dompet"
          nested
          value={type}
          onChange={(v) => setType(v as WalletType)}
          options={TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label, icon: WALLET_ICONS[opt.value] }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              {type === 'savings' ? 'Sudah terkumpul' : 'Saldo awal'} ({currency.symbol})
            </label>
            <input
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              disabled={isEditing || type === 'savings'}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] disabled:opacity-50"
            />
            {isEditing ? (
              <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                Gunakan "Isi Saldo" atau "Tambah Tabungan" untuk mengubah saldo.
              </p>
            ) : type === 'savings' ? (
              <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                Mulai dari 0 — tambahkan lewat "Tambah Tabungan" setelah dompet dibuat.
              </p>
            ) : null}
          </div>
          {type === 'savings' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
                Jumlah target ({currency.symbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>
          )}
          {type === 'bank' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Nama bank</label>
              <input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="cth. Bank Mandiri"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-[var(--color-primary-contrast)] shadow-[var(--shadow-flat)] transition hover:bg-[var(--color-primary-strong)]"
        >
          {isEditing ? 'Simpan Perubahan' : 'Buat Dompet'}
        </button>
      </form>
    </Modal>
  );
}

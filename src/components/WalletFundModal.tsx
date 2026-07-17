import { useEffect, useState } from 'react';
import Modal from './Modal';
import SelectField from './SelectField';
import DateField from './DateField';
import { useFinance } from '../context/FinanceContext';
import { WALLET_ICONS } from '../lib/icons';
import type { Wallet } from '../lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  wallet: Wallet | null;
}

/**
 * Modal untuk menambah dana.
 *
 * - Dompet nyata (cash/bank/digital): "Isi Saldo" — bisa dari Sumber Luar (gaji cair, setor
 *   tunai) yang menambah saldo tanpa mengurangi dompet lain, atau dari dompet nyata lain (transfer
 *   antar dompet nyata) yang benar-benar memindahkan saldo.
 * - Dompet Target Tabungan: "Tambah Tabungan" — uang tabungan di dunia nyata memang disimpan di
 *   salah satu dompet nyata (mis. e-wallet), jadi di sini kita HANYA memilih dompet nyata tempat
 *   uang itu disimpan. Saldo dompet nyata tersebut BERTAMBAH (bukan berkurang!) dan progres target
 *   tabungan ikut naik. Tidak ada dompet yang dikurangi.
 */
export default function WalletFundModal({ open, onClose, wallet }: Props) {
  const { wallets, currency, fromDisplay, topUpWallet, transferBetweenWallets, addToSavings } = useFinance();
  const isSavings = wallet?.type === 'savings';

  const realWallets = wallets.filter((w) => w.type !== 'savings' && w.id !== wallet?.id);
  const otherWallets = wallets.filter((w) => w.id !== wallet?.id);

  const [source, setSource] = useState<'external' | string>('external');
  const [targetWalletId, setTargetWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!open) return;
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().slice(0, 10));
    setSource('external');
    setTargetWalletId(wallet?.linkedWalletId ?? realWallets[0]?.id ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, wallet?.id]);

  if (!wallet) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    const baseAmount = fromDisplay(parsed);

    if (isSavings) {
      if (!targetWalletId) return;
      addToSavings(wallet.id, targetWalletId, baseAmount, date, note.trim() || undefined);
    } else if (source === 'external') {
      topUpWallet(wallet.id, baseAmount, date, note.trim() || undefined);
    } else {
      transferBetweenWallets(source, wallet.id, baseAmount, date, note.trim() || undefined);
    }
    onClose();
  };

  const sourceOptions = [
    { value: 'external', label: 'Sumber Luar (tunai/transfer masuk)', badge: '+' },
    ...otherWallets.map((w) => ({
      value: w.id,
      label: w.name,
      icon: WALLET_ICONS[w.type],
      color: w.color,
    })),
  ];

  const targetOptions = realWallets.map((w) => ({
    value: w.id,
    label: w.name,
    icon: WALLET_ICONS[w.type],
    color: w.color,
  }));

  return (
    <Modal open={open} onClose={onClose} title={isSavings ? 'Tambah Tabungan' : 'Isi Saldo'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isSavings ? (
          <>
            <div className="rounded-xl bg-[var(--color-surface-alt)] px-3.5 py-2.5 text-xs text-[var(--color-ink-soft)]">
              Uang tabungan <span className="font-semibold text-[var(--color-ink)]">{wallet.name}</span> disimpan di
              salah satu dompetmu. Pilih dompet tempat uang ini benar-benar kamu simpan (mis. e-wallet atau bank) —
              saldo dompet itu akan bertambah, dan progres target tabungan ikut naik.
            </div>

            {targetOptions.length === 0 ? (
              <p className="rounded-xl bg-[var(--color-warn-soft)] px-3.5 py-2.5 text-xs text-[var(--color-warn)]">
                Buat dulu dompet nyata (tunai, bank, atau digital) untuk menyimpan tabungan ini.
              </p>
            ) : (
              <SelectField
                label="Simpan di dompet"
                modalTitle="Pilih Dompet Penyimpan"
                nested
                value={targetWalletId}
                onChange={setTargetWalletId}
                options={targetOptions}
              />
            )}
          </>
        ) : (
          <>
            <div className="rounded-xl bg-[var(--color-surface-alt)] px-3.5 py-2.5 text-xs text-[var(--color-ink-soft)]">
              Menambah saldo <span className="font-semibold text-[var(--color-ink)]">{wallet.name}</span>. Jika dananya
              diambil dari dompet lain, saldo dompet itu akan ikut berkurang.
            </div>

            <SelectField
              label="Sumber dana"
              modalTitle="Pilih Sumber Dana"
              nested
              value={source}
              onChange={setSource}
              options={sourceOptions}
            />
          </>
        )}

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
            autoFocus
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
          />
        </div>

        <DateField value={date} onChange={setDate} nested />

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Catatan (opsional)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isSavings ? 'cth. Tabungan bulan ini' : 'cth. Setor tunai'}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
          />
        </div>

        {isSavings ? (
          targetWalletId && (
            <p className="text-[11px] text-[var(--color-muted)]">
              Saldo {wallets.find((w) => w.id === targetWalletId)?.name ?? 'dompet terpilih'} akan bertambah sebesar jumlah ini — uangnya memang disimpan di sana.
            </p>
          )
        ) : (
          source !== 'external' && (
            <p className="text-[11px] text-[var(--color-muted)]">
              Saldo {wallets.find((w) => w.id === source)?.name ?? 'dompet sumber'} akan berkurang sebesar jumlah ini dan tercatat di riwayat sebagai transfer.
            </p>
          )
        )}

        <button
          type="submit"
          disabled={isSavings && targetOptions.length === 0}
          className="mt-1 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-[var(--color-primary-contrast)] shadow-[var(--shadow-flat)] transition hover:bg-[var(--color-primary-strong)] disabled:opacity-50"
        >
          {isSavings ? 'Simpan Tabungan' : 'Isi Saldo'}
        </button>
      </form>
    </Modal>
  );
}

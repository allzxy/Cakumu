import { useEffect, useState } from 'react';
import Modal from './Modal';
import SelectField from './SelectField';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { WALLET_ICONS } from '../lib/icons';
import type { Wallet, WalletType } from '../lib/types';
import { Wallet as WalletIcon, CreditCard, PiggyBank, Smartphone } from 'lucide-react';

const PALETTE = ['#1f7a5c', '#3c6ea5', '#c9a84c', '#8a5fc9', '#c1704a', '#4d8fa6', '#b5523e', '#6a7a4f'];

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Wallet | null;
}

export default function WalletFormModal({ open, onClose, editing }: Props) {
  const { wallets, currency, addWallet, updateWallet, toDisplay, fromDisplay } = useFinance();
  const { t } = useLanguage();
  const isEditing = !!editing;

  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('cash');
  const [balance, setBalance] = useState('');
  const [goal, setGoal] = useState('');
  const [institution, setInstitution] = useState('');

  const typeOptions: { value: WalletType; label: string; icon: typeof WalletIcon }[] = [
    { value: 'cash', label: t('wallets.type.cash'), icon: WalletIcon },
    { value: 'bank', label: t('wallets.type.bank'), icon: CreditCard },
    { value: 'savings', label: t('wallets.type.savings'), icon: PiggyBank },
    { value: 'digital', label: t('wallets.type.digital'), icon: Smartphone },
  ];

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
    <Modal open={open} onClose={onClose} title={isEditing ? t('wallets.edit') : t('wallets.new')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">{t('wallets.name')}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('wallets.namePlaceholder')}
            required
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
          />
        </div>

        <SelectField
          label={t('wallets.type')}
          modalTitle={t('wallets.type')}
          nested
          value={type}
          onChange={(v) => setType(v as WalletType)}
          options={typeOptions.map((opt) => ({ value: opt.value, label: opt.label, icon: WALLET_ICONS[opt.value] }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              {type === 'savings' ? t('wallets.collected') : t('wallets.startingBalance')} ({currency.symbol})
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
              <p className="mt-1 text-[11px] text-[var(--color-muted)]">{t('wallets.editHint')}</p>
            ) : type === 'savings' ? (
              <p className="mt-1 text-[11px] text-[var(--color-muted)]">{t('wallets.savingsHint')}</p>
            ) : null}
          </div>
          {type === 'savings' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">{t('wallets.targetAmount')} ({currency.symbol})</label>
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
              <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">{t('wallets.bankName')}</label>
              <input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder={t('wallets.bankNamePlaceholder')}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-[var(--color-primary-contrast)] shadow-[var(--shadow-flat)] transition hover:bg-[var(--color-primary-strong)]"
        >
          {isEditing ? t('common.saveChanges') : t('wallets.create')}
        </button>
      </form>
    </Modal>
  );
}

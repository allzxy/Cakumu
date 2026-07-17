import { useMemo, useState } from 'react';
import Modal from './Modal';
import SelectField from './SelectField';
import { useFinance } from '../context/FinanceContext';
import { CURRENCIES, convertAmount, formatMoney, getRateLabel } from '../lib/currencies';
import { ArrowLeftRight, Check, RefreshCw, Radio, WifiOff } from 'lucide-react';

export default function CurrencyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currencyCode, setCurrencyCode, liveRates } = useFinance();

  const [fromCode, setFromCode] = useState('USD');
  const [toCode, setToCode] = useState('IDR');
  const [amount, setAmount] = useState('100');

  const toCurrency = CURRENCIES.find((c) => c.code === toCode) ?? CURRENCIES[0];

  const currencyOptions = useMemo(
    () => CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} — ${c.label}`, badge: c.symbol })),
    []
  );

  const result = useMemo(() => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed < 0) return 0;
    return convertAmount(parsed, fromCode, toCode, liveRates.rates);
  }, [amount, fromCode, toCode, liveRates.rates]);

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const fetchedTime = new Date(liveRates.fetchedAt).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal open={open} onClose={onClose} title="Mata Uang">
      <div className="flex flex-col gap-5">
        <div
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs ${
            liveRates.isLive
              ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
              : 'bg-[var(--color-warn-soft)] text-[var(--color-warn)]'
          }`}
        >
          {liveRates.status === 'loading' ? (
            <RefreshCw size={13} className="shrink-0 animate-spin" />
          ) : liveRates.isLive ? (
            <Radio size={13} className="shrink-0" />
          ) : (
            <WifiOff size={13} className="shrink-0" />
          )}
          <span className="min-w-0 flex-1 truncate">
            {liveRates.status === 'loading'
              ? 'Memuat kurs real-time…'
              : liveRates.isLive
              ? `Kurs real-time · diperbarui ${fetchedTime}`
              : 'Kurs referensi offline (belum tersambung internet)'}
          </span>
          <button
            type="button"
            onClick={() => liveRates.refresh()}
            disabled={liveRates.status === 'loading'}
            className="shrink-0 rounded-full p-1 transition hover:bg-black/5 disabled:opacity-50"
            aria-label="Segarkan kurs"
          >
            <RefreshCw size={13} className={liveRates.status === 'loading' ? 'animate-spin' : ''} />
          </button>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Mata uang tampilan</p>
          <div className="flex flex-col gap-1">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrencyCode(c.code)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  currencyCode === c.code
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                    : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-alt)]'
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-alt)] text-sm font-semibold">
                  {c.symbol}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{c.code}</span>
                  <span className="block truncate text-xs text-[var(--color-muted)]">{c.label}</span>
                </span>
                {currencyCode === c.code && <Check size={16} className="shrink-0 text-[var(--color-primary)]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted)]">
            <ArrowLeftRight size={12} /> Konversi cepat
          </p>

          <div className="flex flex-col gap-2.5">
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)]"
            />

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
              <SelectField
                nested
                compact
                modalTitle="Dari Mata Uang"
                value={fromCode}
                onChange={setFromCode}
                options={currencyOptions}
              />

              <button
                type="button"
                onClick={swap}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-ink-soft)] transition hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]"
                aria-label="Tukar mata uang"
              >
                <ArrowLeftRight size={14} />
              </button>

              <SelectField
                nested
                compact
                modalTitle="Ke Mata Uang"
                value={toCode}
                onChange={setToCode}
                options={currencyOptions}
              />
            </div>

            <div className="min-w-0 rounded-xl bg-[var(--color-primary-soft)] px-4 py-3">
              <p className="font-bold tracking-tight truncate text-xl text-[var(--color-primary-strong)]">
                {formatMoney(result, toCurrency)}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[var(--color-primary-strong)]/80">{getRateLabel(fromCode, toCode, liveRates.rates)}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

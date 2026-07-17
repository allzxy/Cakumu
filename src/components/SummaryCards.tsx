import { ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney } from '../lib/currencies';
import { useCountUp } from '../lib/useCountUp';

interface Props {
  income: number;
  spending: number;
  balance: number;
  incomeDelta: number | null;
  spendingDelta: number | null;
  /** Human-readable scope shown under the balance card, e.g. "bulan ini" or "tanggal 12". */
  scopeLabel?: string;
}

function DeltaTag({ value, invert = false, compareLabel }: { value: number | null; invert?: boolean; compareLabel: string }) {
  if (value === null || !isFinite(value)) return <span className="text-xs text-[var(--color-muted)]">belum ada data {compareLabel}</span>;
  const positive = invert ? value <= 0 : value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${positive ? 'text-[var(--color-primary)]' : 'text-[var(--color-warn)]'}`}>
      {value >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(value).toFixed(1)}% vs {compareLabel}
    </span>
  );
}

function AnimatedAmount({ value, currency }: { value: number; currency: Parameters<typeof formatMoney>[1] }) {
  const animated = useCountUp(value);
  return <>{formatMoney(animated, currency)}</>;
}

export default function SummaryCards({ income, spending, balance, incomeDelta, spendingDelta, scopeLabel = 'bulan ini' }: Props) {
  const { currency, toDisplay } = useFinance();
  const compareLabel = scopeLabel.startsWith('tanggal') ? `${scopeLabel} bulan lalu` : 'bulan lalu';

  const cards = [
    {
      label: 'Total Pemasukan',
      value: toDisplay(income),
      icon: ArrowUpRight,
      accent: 'var(--color-primary)',
      bg: 'var(--color-primary-soft)',
      delta: <DeltaTag value={incomeDelta} compareLabel={compareLabel} />,
    },
    {
      label: 'Total Pengeluaran',
      value: toDisplay(spending),
      icon: ArrowDownRight,
      accent: 'var(--color-warn)',
      bg: 'var(--color-warn-soft)',
      delta: <DeltaTag value={spendingDelta} invert compareLabel={compareLabel} />,
    },
    {
      label: 'Saldo Bersih',
      value: toDisplay(balance),
      icon: Scale,
      accent: 'var(--color-accent)',
      bg: 'var(--color-accent-soft)',
      delta: <span className="text-xs text-[var(--color-muted)]">total saldo dompet − pengeluaran {scopeLabel}</span>,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="animate-rise rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-flat)] sm:p-5"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">{card.label}</p>
              <p className="font-bold tracking-tight mt-1.5 truncate text-2xl text-[var(--color-ink)] sm:mt-2 sm:text-3xl">
                <AnimatedAmount value={card.value} currency={currency} />
              </p>
            </div>
            <div
              className="animate-pop flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10"
              style={{ backgroundColor: card.bg, color: card.accent, animationDelay: `${i * 80 + 120}ms` }}
            >
              <card.icon size={17} strokeWidth={2.2} />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">{card.delta}</div>
        </div>
      ))}
    </div>
  );
}

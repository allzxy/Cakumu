import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import SummaryCards from '../components/SummaryCards';
import DailyChart from '../components/DailyChart';
import CategoryBreakdown from '../components/CategoryBreakdown';
import TransactionList from '../components/TransactionList';
import MonthFilter from '../components/MonthFilter';
import Topbar from '../components/Topbar';
import AddTransactionModal from '../components/AddTransactionModal';

function prevMonthKey(month: string) {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(y, m - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function pctDelta(current: number, prior: number): number | null {
  if (prior === 0) return current === 0 ? 0 : null;
  return ((current - prior) / prior) * 100;
}

export default function Dashboard() {
  const { transactions, categories, wallets, selectedMonth, setSelectedMonth } = useFinance();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  // Tanggal spesifik (YYYY-MM-DD) yang disinkronkan dari grafik ke seluruh kartu ringkasan.
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.slice(0, 7) === selectedMonth),
    [transactions, selectedMonth]
  );

  // Data yang dipakai kartu ringkasan, kategori, & riwayat: mengikuti tanggal terpilih jika ada,
  // jika tidak, mengikuti seluruh bulan yang aktif.
  const scopedTx = useMemo(
    () => (selectedDate ? monthTx.filter((t) => t.date === selectedDate) : monthTx),
    [monthTx, selectedDate]
  );

  const priorScopeTx = useMemo(() => {
    if (selectedDate) {
      // Bandingkan dengan tanggal yang sama di bulan sebelumnya.
      const day = selectedDate.slice(8, 10);
      const priorDate = `${prevMonthKey(selectedMonth)}-${day}`;
      return transactions.filter((t) => t.date === priorDate);
    }
    return transactions.filter((t) => t.date.slice(0, 7) === prevMonthKey(selectedMonth));
  }, [transactions, selectedMonth, selectedDate]);

  const income = scopedTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const spending = scopedTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  // Total saldo seluruh dompet saat ini, lalu dikurangi pengeluaran pada rentang filter yang aktif
  // (per tanggal jika sebuah tanggal dipilih, atau sebulan penuh jika tidak).
  // Dompet 'savings' tidak dijumlahkan lagi karena uangnya sudah tercatat di dompet nyata yang menyimpannya.
  const totalWalletBalance = wallets.filter((w) => w.type !== 'savings').reduce((s, w) => s + w.balance, 0);
  const balance = totalWalletBalance - spending;

  const priorIncome = priorScopeTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const priorSpending = priorScopeTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setSelectedDate(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <Topbar
        title="Dasbor"
        subtitle="Ringkasan keuanganmu, cepat dan jelas."
        onAddTransaction={() => setShowAdd(true)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthFilter
          value={selectedMonth}
          onChange={handleMonthChange}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary-soft)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-primary-strong)] transition hover:bg-[var(--color-primary)]/20"
          >
            Tanggal {selectedDate.slice(8, 10)} · Lihat sebulan penuh
          </button>
        )}
      </div>

      <SummaryCards
        income={income}
        spending={spending}
        balance={balance}
        incomeDelta={pctDelta(income, priorIncome)}
        spendingDelta={pctDelta(spending, priorSpending)}
        scopeLabel={selectedDate ? `tanggal ${selectedDate.slice(8, 10)}` : 'bulan ini'}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <DailyChart
            transactions={monthTx}
            month={selectedMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
        <div className="xl:col-span-2">
          <CategoryBreakdown
            transactions={scopedTx}
            categories={categories}
            onManage={() => navigate('/categories')}
          />
        </div>
      </div>

      <TransactionList transactions={scopedTx} preview />

      <AddTransactionModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

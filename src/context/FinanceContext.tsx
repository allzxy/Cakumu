import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Category, Transaction, Wallet } from '../lib/types';
import { CURRENCIES, BASE_CURRENCY_CODE, convertAmount } from '../lib/currencies';
import { DEFAULT_CATEGORIES, DEFAULT_TRANSACTIONS, DEFAULT_WALLETS } from '../lib/seed';
import { useLiveRates, type LiveRatesState } from '../lib/useLiveRates';

interface FinanceState {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  currencyCode: string;
  selectedMonth: string; // YYYY-MM
}

interface FinanceContextValue extends FinanceState {
  currency: typeof CURRENCIES[number];
  /** Converts an amount stored internally (base currency) into the selected display currency. */
  toDisplay: (amount: number) => number;
  setCurrencyCode: (code: string) => void;
  setSelectedMonth: (month: string) => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, patch: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  addWallet: (w: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, patch: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  /** Adds funds to a wallet from an external source (e.g. cash top-up), recorded as an income transaction. */
  topUpWallet: (walletId: string, amount: number, date: string, note?: string) => void;
  /** Moves funds from one real wallet to another (mis. Cash ke Rekening), recorded as two linked transactions. */
  transferBetweenWallets: (fromWalletId: string, toWalletId: string, amount: number, date: string, note?: string) => void;
  /**
   * Menambah tabungan: uang disimpan di dompet nyata (cash/bank/digital) yang dipilih, jadi saldo
   * dompet nyata itu BERTAMBAH (uang memang masuk ke sana), dan progres target tabungan juga ikut
   * bertambah. Tidak ada dompet lain yang dikurangi — sesuai kondisi nyata bahwa uang tabungan
   * memang tersimpan di salah satu dompet nyata tersebut.
   */
  addToSavings: (savingsWalletId: string, targetWalletId: string, amount: number, date: string, note?: string) => void;
  addCategory: (c: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id' | 'type'>>) => void;
  deleteCategory: (id: string) => void;
  availableMonths: string[];
  /** Converts an amount typed in the current display currency back into the internal base currency. */
  fromDisplay: (amount: number) => number;
  /** Real-world exchange rate state (live, refreshed hourly, with offline fallback). */
  liveRates: LiveRatesState;
}

const STORAGE_KEY = 'wayfare-finance-state-v1';

function loadInitial(): FinanceState {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          wallets: parsed.wallets ?? DEFAULT_WALLETS,
          categories: parsed.categories ?? DEFAULT_CATEGORIES,
          transactions: parsed.transactions ?? DEFAULT_TRANSACTIONS,
          currencyCode: parsed.currencyCode ?? 'IDR',
          selectedMonth: parsed.selectedMonth ?? currentMonthKey(),
        };
      }
    } catch {
      // fall through to defaults
    }
  }
  return {
    wallets: DEFAULT_WALLETS,
    categories: DEFAULT_CATEGORIES,
    transactions: DEFAULT_TRANSACTIONS,
    currencyCode: 'IDR',
    selectedMonth: currentMonthKey(),
  };
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          wallets: state.wallets,
          categories: state.categories,
          transactions: state.transactions,
          currencyCode: state.currencyCode,
          selectedMonth: state.selectedMonth,
        })
      );
    } catch {
      // ignore quota errors
    }
  }, [state.wallets, state.categories, state.transactions, state.currencyCode, state.selectedMonth]);

  const liveRates = useLiveRates();

  const currency = useMemo(() => CURRENCIES.find((c) => c.code === state.currencyCode) ?? CURRENCIES[0], [state.currencyCode]);

  const toDisplay = useCallback(
    (amount: number) => convertAmount(amount, BASE_CURRENCY_CODE, state.currencyCode, liveRates.rates),
    [state.currencyCode, liveRates.rates]
  );

  const fromDisplay = useCallback(
    (amount: number) => convertAmount(amount, state.currencyCode, BASE_CURRENCY_CODE, liveRates.rates),
    [state.currencyCode, liveRates.rates]
  );

  const setCurrencyCode = useCallback((code: string) => {
    setState((s) => ({ ...s, currencyCode: code }));
  }, []);

  const setSelectedMonth = useCallback((month: string) => {
    setState((s) => ({ ...s, selectedMonth: month }));
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    setState((s) => {
      const tx: Transaction = { ...t, id: uid('t') };
      const wallets = s.wallets.map((w) =>
        w.id === tx.walletId
          ? { ...w, balance: w.balance + (tx.type === 'income' ? tx.amount : -tx.amount) }
          : w
      );
      return { ...s, transactions: [tx, ...s.transactions], wallets };
    });
  }, []);

  const updateTransaction = useCallback((id: string, patch: Omit<Transaction, 'id'>) => {
    setState((s) => {
      const old = s.transactions.find((t) => t.id === id);
      if (!old) return s;

      let wallets = s.wallets.map((w) =>
        w.id === old.walletId
          ? { ...w, balance: w.balance - (old.type === 'income' ? old.amount : -old.amount) }
          : w
      );
      wallets = wallets.map((w) =>
        w.id === patch.walletId
          ? { ...w, balance: w.balance + (patch.type === 'income' ? patch.amount : -patch.amount) }
          : w
      );

      const transactions = s.transactions.map((t) => (t.id === id ? { ...patch, id } : t));
      return { ...s, transactions, wallets };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState((s) => {
      const tx = s.transactions.find((t) => t.id === id);
      if (!tx) return s;
      const wallets = s.wallets.map((w) =>
        w.id === tx.walletId
          ? { ...w, balance: w.balance - (tx.type === 'income' ? tx.amount : -tx.amount) }
          : w
      );
      return { ...s, transactions: s.transactions.filter((t) => t.id !== id), wallets };
    });
  }, []);

  const clearAllTransactions = useCallback(() => {
    setState((s) => {
      const wallets = s.wallets.map((w) => {
        const delta = s.transactions
          .filter((t) => t.walletId === w.id)
          .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        return { ...w, balance: w.balance - delta };
      });
      return { ...s, transactions: [], wallets };
    });
  }, []);

  const addWallet = useCallback((w: Omit<Wallet, 'id'>) => {
    setState((s) => ({ ...s, wallets: [...s.wallets, { ...w, id: uid('w') }] }));
  }, []);

  const updateWallet = useCallback((id: string, patch: Partial<Wallet>) => {
    setState((s) => ({ ...s, wallets: s.wallets.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));
  }, []);

  const deleteWallet = useCallback((id: string) => {
    setState((s) => ({ ...s, wallets: s.wallets.filter((w) => w.id !== id) }));
  }, []);

  const topUpWallet = useCallback((walletId: string, amount: number, date: string, note?: string) => {
    if (amount <= 0) return;
    setState((s) => {
      const topupCategory = s.categories.find((c) => c.id === 'c-topup-in')?.id ?? s.categories.find((c) => c.type === 'income')?.id ?? '';
      const tx: Transaction = {
        id: uid('t'),
        date,
        description: note?.trim() || 'Isi saldo',
        categoryId: topupCategory,
        walletId,
        type: 'income',
        amount,
      };
      const wallets = s.wallets.map((w) => (w.id === walletId ? { ...w, balance: w.balance + amount } : w));
      return { ...s, transactions: [tx, ...s.transactions], wallets };
    });
  }, []);

  const transferBetweenWallets = useCallback(
    (fromWalletId: string, toWalletId: string, amount: number, date: string, note?: string) => {
      if (amount <= 0 || fromWalletId === toWalletId) return;
      setState((s) => {
        const fromWallet = s.wallets.find((w) => w.id === fromWalletId);
        const toWallet = s.wallets.find((w) => w.id === toWalletId);
        if (!fromWallet || !toWallet) return s;

        const outCategory = s.categories.find((c) => c.id === 'c-topup-out')?.id ?? s.categories.find((c) => c.type === 'expense')?.id ?? '';
        const inCategory = s.categories.find((c) => c.id === 'c-topup-in')?.id ?? s.categories.find((c) => c.type === 'income')?.id ?? '';
        const label = note?.trim() || `Transfer ke ${toWallet.name}`;
        const labelIn = note?.trim() || `Transfer dari ${fromWallet.name}`;

        const outTx: Transaction = {
          id: uid('t'),
          date,
          description: label,
          categoryId: outCategory,
          walletId: fromWalletId,
          type: 'expense',
          amount,
        };
        const inTx: Transaction = {
          id: uid('t'),
          date,
          description: labelIn,
          categoryId: inCategory,
          walletId: toWalletId,
          type: 'income',
          amount,
        };

        const wallets = s.wallets.map((w) => {
          if (w.id === fromWalletId) return { ...w, balance: w.balance - amount };
          if (w.id === toWalletId) return { ...w, balance: w.balance + amount };
          return w;
        });

        return { ...s, transactions: [inTx, outTx, ...s.transactions], wallets };
      });
    },
    []
  );

  const addToSavings = useCallback(
    (savingsWalletId: string, targetWalletId: string, amount: number, date: string, note?: string) => {
      if (amount <= 0 || !targetWalletId) return;
      setState((s) => {
        const savingsWallet = s.wallets.find((w) => w.id === savingsWalletId);
        const targetWallet = s.wallets.find((w) => w.id === targetWalletId);
        if (!savingsWallet || !targetWallet) return s;

        const category = s.categories.find((c) => c.id === 'c-topup-in')?.id ?? s.categories.find((c) => c.type === 'income')?.id ?? '';
        const tx: Transaction = {
          id: uid('t'),
          date,
          description: note?.trim() || `Nabung untuk ${savingsWallet.name} (disimpan di ${targetWallet.name})`,
          categoryId: category,
          walletId: targetWalletId,
          type: 'income',
          amount,
        };

        // Uangnya benar-benar disimpan di dompet nyata yang dipilih, jadi HANYA saldo dompet nyata
        // itu yang bertambah. Progres tabungan (balance milik dompet 'savings') ikut naik supaya
        // terlihat mendekati target, tapi jumlah ini TIDAK dihitung lagi di "Total semua dompet"
        // karena uangnya sudah tercatat di dompet nyata tersebut (lihat perhitungan total saldo).
        const wallets = s.wallets.map((w) => {
          if (w.id === savingsWalletId) return { ...w, balance: w.balance + amount, linkedWalletId: targetWalletId };
          if (w.id === targetWalletId) return { ...w, balance: w.balance + amount };
          return w;
        });

        return { ...s, transactions: [tx, ...s.transactions], wallets };
      });
    },
    []
  );

  const addCategory = useCallback((c: Omit<Category, 'id'>) => {
    setState((s) => ({ ...s, categories: [...s.categories, { ...c, id: uid('c') }] }));
  }, []);

  const updateCategory = useCallback((id: string, patch: Partial<Omit<Category, 'id' | 'type'>>) => {
    setState((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState((s) => {
      const fallback = s.categories.find((c) => c.id !== id);
      if (!fallback) return s;
      return {
        ...s,
        categories: s.categories.filter((c) => c.id !== id),
        transactions: s.transactions.map((t) =>
          t.categoryId === id ? { ...t, categoryId: fallback.id } : t
        ),
      };
    });
  }, []);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    state.transactions.forEach((t) => set.add(t.date.slice(0, 7)));
    set.add(currentMonthKey());
    return Array.from(set).sort().reverse();
  }, [state.transactions]);

  const value: FinanceContextValue = {
    ...state,
    currency,
    toDisplay,
    fromDisplay,
    setCurrencyCode,
    setSelectedMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions,
    addWallet,
    updateWallet,
    deleteWallet,
    topUpWallet,
    transferBetweenWallets,
    addToSavings,
    addCategory,
    updateCategory,
    deleteCategory,
    availableMonths,
    liveRates,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}

export type WalletType = 'cash' | 'bank' | 'savings' | 'digital';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string;
  goalAmount?: number;
  institution?: string;
  /**
   * Untuk dompet bertipe 'savings': id dompet nyata (cash/bank/digital) tempat uang tabungan ini
   * benar-benar disimpan di dunia nyata (mis. e-wallet). Menambah tabungan hanya menambah progres
   * target ini dan TIDAK mengurangi saldo dompet yang ditaut, karena uangnya memang sudah ada di sana.
   */
  linkedWalletId?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  /** Optional monthly spending limit for expense categories, stored in the base currency. */
  monthlyLimit?: number;
  /** System categories are created automatically (e.g. top-up/transfer) and hidden from category management. */
  system?: boolean;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  categoryId: string;
  walletId: string;
  type: TransactionType;
  amount: number;
}

export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
  locale: string;
}

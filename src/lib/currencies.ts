import type { CurrencyOption } from './types';

export const CURRENCIES: CurrencyOption[] = [
  { code: 'IDR', label: 'Rupiah Indonesia', symbol: 'Rp', locale: 'id-ID' },
  { code: 'USD', label: 'Dolar AS', symbol: '$', locale: 'en-US' },
  { code: 'EUR', label: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', label: 'Poundsterling Inggris', symbol: '£', locale: 'en-GB' },
  { code: 'JPY', label: 'Yen Jepang', symbol: '¥', locale: 'ja-JP' },
  { code: 'INR', label: 'Rupee India', symbol: '₹', locale: 'en-IN' },
  { code: 'CAD', label: 'Dolar Kanada', symbol: 'CA$', locale: 'en-CA' },
  { code: 'AUD', label: 'Dolar Australia', symbol: 'A$', locale: 'en-AU' },
  { code: 'SGD', label: 'Dolar Singapura', symbol: 'S$', locale: 'en-SG' },
  { code: 'MYR', label: 'Ringgit Malaysia', symbol: 'RM', locale: 'ms-MY' },
  { code: 'CHF', label: 'Franc Swiss', symbol: 'CHF', locale: 'de-CH' },
  { code: 'BRL', label: 'Real Brasil', symbol: 'R$', locale: 'pt-BR' },
];

// Base currency used internally to store all wallet/transaction amounts.
export const BASE_CURRENCY_CODE = 'USD';

// Diperbarui: Nilai tengah pasar (Mid-Market) rata-rata saat ini untuk fallback offline
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 153.5,
  INR: 83.5,
  CAD: 1.37,
  AUD: 1.51,
  SGD: 1.35,
  MYR: 4.70,
  CHF: 0.90,
  BRL: 5.15,
  IDR: 16250, // Diperbarui agar lebih relevan dengan kurs pasar Google saat offline
};

const ZERO_DECIMAL_CURRENCIES = new Set(['IDR', 'JPY']);

/**
 * Convert an amount from one currency to another.
 * Pass a live `rates` map (units of currency per 1 BASE_CURRENCY_CODE) to use
 * real-world exchange rates; falls back to the static reference table when omitted.
 */
export function convertAmount(
  amount: number,
  fromCode: string,
  toCode: string,
  rates: Record<string, number> = EXCHANGE_RATES
): number {
  if (fromCode === toCode) return amount;
  const fromRate = rates[fromCode] ?? EXCHANGE_RATES[fromCode] ?? 1;
  const toRate = rates[toCode] ?? EXCHANGE_RATES[toCode] ?? 1;
  const inBase = amount / fromRate;
  return inBase * toRate;
}

// Diperbarui: Menerima parameter locale opsional agar menyesuaikan bahasa pengguna
export function getRateLabel(
  fromCode: string,
  toCode: string,
  rates: Record<string, number> = EXCHANGE_RATES,
  locale: string = 'id-ID' 
): string {
  const rate = convertAmount(1, fromCode, toCode, rates);
  const digits = ZERO_DECIMAL_CURRENCIES.has(toCode) ? 0 : 2;
  return `1 ${fromCode} ≈ ${rate.toLocaleString(locale, { maximumFractionDigits: digits })} ${toCode}`;
}

export function formatMoney(amount: number, currency: CurrencyOption, opts?: { compact?: boolean }) {
  const zeroDecimal = ZERO_DECIMAL_CURRENCIES.has(currency.code);
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: opts?.compact ? undefined : zeroDecimal ? 0 : 2,
      maximumFractionDigits: opts?.compact ? 1 : zeroDecimal ? 0 : 2,
      notation: opts?.compact ? 'compact' : 'standard',
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toFixed(zeroDecimal ? 0 : 2)}`;
  }
}
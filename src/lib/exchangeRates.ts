// Fetches real-world exchange rates from the free, keyless Frankfurter API
// (backed by the European Central Bank reference rates, updated on banking days).
// Falls back to static reference rates if the network request fails, so the
// app keeps working offline.

import { EXCHANGE_RATES, BASE_CURRENCY_CODE } from './currencies';

const CACHE_KEY = 'wayfare-exchange-rates-v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface RatesSnapshot {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string; // ISO timestamp of when we fetched it
  sourceDate: string | null; // date the rates were published (from API)
  isLive: boolean;
}

function staticSnapshot(): RatesSnapshot {
  return {
    base: BASE_CURRENCY_CODE,
    rates: { ...EXCHANGE_RATES },
    fetchedAt: new Date().toISOString(),
    sourceDate: null,
    isLive: false,
  };
}

function loadCached(): RatesSnapshot | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RatesSnapshot;
    if (!parsed.rates || !parsed.fetchedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(snapshot: RatesSnapshot) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore quota errors
  }
}

export function isCacheFresh(snapshot: RatesSnapshot | null): boolean {
  if (!snapshot) return false;
  const age = Date.now() - new Date(snapshot.fetchedAt).getTime();
  return age < CACHE_TTL_MS;
}

/** Returns cached rates immediately (static fallback if nothing cached yet). */
export function getInitialRates(): RatesSnapshot {
  return loadCached() ?? staticSnapshot();
}

/** Fetches fresh live rates from the network. Throws on failure. */
export async function fetchLiveRates(): Promise<RatesSnapshot> {
  const symbols = Object.keys(EXCHANGE_RATES).filter((c) => c !== BASE_CURRENCY_CODE);
  const url = `https://api.frankfurter.dev/v1/latest?from=${BASE_CURRENCY_CODE}&to=${symbols.join(',')}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal memuat kurs (status ${res.status})`);
  const data = await res.json();
  if (!data?.rates) throw new Error('Format data kurs tidak dikenali.');

  const rates: Record<string, number> = { [BASE_CURRENCY_CODE]: 1, ...data.rates };
  const snapshot: RatesSnapshot = {
    base: BASE_CURRENCY_CODE,
    rates,
    fetchedAt: new Date().toISOString(),
    sourceDate: data.date ?? null,
    isLive: true,
  };
  saveCache(snapshot);
  return snapshot;
}

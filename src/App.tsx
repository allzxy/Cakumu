import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom'; 
import { Menu, Leaf } from 'lucide-react';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import NavDrawer from './components/NavDrawer';
import ThemeToggle from './components/ThemeToggle';

// 1. PASTIKAN SEMUA HALAMAN DIIMPOR DI SINI (Termasuk Savings)
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Savings from './pages/Savings'; 
import Categories from './pages/Categories';
import History from './pages/History';
import Settings from './pages/Settings';

function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:px-6 lg:px-10">
        <button
          onClick={() => setNavOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-ink-soft)] transition hover:bg-[var(--color-surface-alt)]"
          aria-label={t('nav.openMenu')}
        >
          <Menu size={20} />
        </button>
        <div className="flex flex-1 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)]">
            <Leaf size={14} strokeWidth={2.4} />
          </div>
          <span className="font-bold tracking-tight text-sm text-[var(--color-ink)]">Cakumu</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
        {/* 2. DAFTARKAN RUTE (JALUR) HALAMAN DI SINI */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/savings" element={<Savings />} /> {/* INI YANG MEMBUAT HALAMANNYA MUNCUL */}
          <Route path="/categories" element={<Categories />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FinanceProvider>
          <HashRouter> 
            <AppShell />
          </HashRouter>
        </FinanceProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
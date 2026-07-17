import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import Topbar from '../components/Topbar';
import TransactionList from '../components/TransactionList';
import AddTransactionModal from '../components/AddTransactionModal';

export default function History() {
  const { transactions } = useFinance();
  const { t } = useLanguage();
  const [showAddTx, setShowAddTx] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Topbar
        title={t('history.title')}
        subtitle={t('history.subtitle')}
        onAddTransaction={() => setShowAddTx(true)}
      />

      <TransactionList transactions={transactions} />

      <AddTransactionModal open={showAddTx} onClose={() => setShowAddTx(false)} />
    </div>
  );
}

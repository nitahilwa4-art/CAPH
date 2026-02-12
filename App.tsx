
import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Maintenance from './components/Maintenance';
import OfflineIndicator from './components/OfflineIndicator';
import AppRouter from './components/AppRouter';
import { AppView, SummaryStats, BudgetCycle, Transaction } from './types';
import { Toaster } from 'react-hot-toast';

// Custom Hooks
import { useAuthSession } from './hooks/useAuthSession';
import { useTheme } from './hooks/useTheme';
import { useDataManager } from './hooks/useDataManager';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [budgetCycle, setBudgetCycle] = useState<BudgetCycle>({ type: 'MONTHLY' });

  // 1. Auth Hook
  const { user, login, logout, updateUser } = useAuthSession();

  // 2. Theme Hook
  useTheme(user);

  // 3. Data Logic Hook
  const dataManager = useDataManager(user);

  // --- DERIVED STATE (Kept here for now or could move to hook) ---
  
  // Calculate active date range based on budget cycle
  const activeDateRange = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    const formatLocalDate = (date: Date) => {
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      return localDate.toISOString().split('T')[0];
    };

    if (budgetCycle.type === 'MONTHLY') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (budgetCycle.type === 'WEEKLY') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
      start = new Date(now.setDate(diff));
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } 
    
    return { start: formatLocalDate(start), end: formatLocalDate(end) };
  }, [budgetCycle]);

  // Summary Stats
  const stats: SummaryStats = {
    totalIncome: dataManager.transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0),
    totalExpense: dataManager.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0),
    get balance() { return dataManager.wallets.reduce((acc, w) => acc + w.balance, 0); }
  };

  const handleAddSingleTransaction = (t: Omit<Transaction, 'userId'>) => {
    dataManager.handleAddTransactions([t]);
  };

  if (isMaintenanceMode) {
    return <Maintenance onGoBack={() => setIsMaintenanceMode(false)} />;
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: "'Plus Jakarta Sans', sans-serif", borderRadius: '12px' } }} />
      <OfflineIndicator />
      
      {!user ? (
        <Auth onLogin={login} />
      ) : (
        <Layout currentView={currentView} setCurrentView={setCurrentView} user={user} onLogout={logout}>
          <AppRouter 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
            user={user}
            data={{
              transactions: dataManager.transactions,
              wallets: dataManager.wallets,
              categories: dataManager.categories,
              budgets: dataManager.budgets,
              debts: dataManager.debts,
              assets: dataManager.assets,
              allTransactions: dataManager.allTransactions
            }}
            actions={{
              handleAddTransaction: handleAddSingleTransaction,
              handleAddTransactions: dataManager.handleAddTransactions,
              handleEditTransaction: dataManager.handleEditTransaction,
              deleteTransaction: dataManager.deleteTransaction,
              updateUser: updateUser,
              wallet: dataManager.walletActions,
              category: dataManager.categoryActions,
              budget: dataManager.budgetActions,
              debt: dataManager.debtActions,
              asset: dataManager.assetActions
            }}
            activeDateRange={activeDateRange}
            stats={stats}
          />
        </Layout>
      )}
    </>
  );
};

export default App;

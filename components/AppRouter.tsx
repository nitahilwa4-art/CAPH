
import React from 'react';
import { AppView, User, Transaction, Wallet, Category, Budget, Debt, Asset, SummaryStats } from '../types';
import Dashboard from './Dashboard';
import TransactionList from './TransactionList';
import SmartEntry from './SmartEntry';
import FinancialInsights from './FinancialInsights';
import AdminDashboard from './AdminDashboard';
import WalletManager from './WalletManager';
import BudgetManager from './BudgetManager';
import DebtManager from './DebtManager';
import AssetManager from './AssetManager';
import CategoryManager from './CategoryManager';
import Profile from './Profile';
import Settings from './Settings';
import ExportPage from './ExportPage';
import ErrorPage from './ErrorPage';
import NotificationCenter from './NotificationCenter';
import HelpCenter from './HelpCenter';

interface AppRouterProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  user: User;
  data: {
    transactions: Transaction[];
    wallets: Wallet[];
    categories: Category[];
    budgets: Budget[];
    debts: Debt[];
    assets: Asset[];
    allTransactions: Transaction[]; // For admin
  };
  actions: {
    handleAddTransaction: (t: Omit<Transaction, 'userId'>) => void;
    handleAddTransactions: (ts: Omit<Transaction, 'userId'>[]) => void;
    handleEditTransaction: (t: Transaction) => void;
    deleteTransaction: (id: string) => void;
    updateUser: (u: User) => void;
    wallet: any;
    category: any;
    budget: any;
    debt: any;
    asset: any;
  };
  activeDateRange: { start: string, end: string };
  stats: SummaryStats;
}

const AppRouter: React.FC<AppRouterProps> = ({ 
  currentView, 
  setCurrentView, 
  user, 
  data, 
  actions,
  activeDateRange,
  stats
}) => {
  switch (currentView) {
    case AppView.DASHBOARD:
      return (
        <Dashboard 
          transactions={data.transactions} 
          stats={stats} 
          wallets={data.wallets} 
          budgets={data.budgets} 
          debts={data.debts}
          categories={data.categories}
          onAddTransaction={actions.handleAddTransaction}
          onNavigateToSmartEntry={() => setCurrentView(AppView.SMART_ENTRY)}
          activeDateRange={activeDateRange}
        />
      );
    case AppView.TRANSACTIONS:
      return (
        <TransactionList 
          transactions={data.transactions} 
          wallets={data.wallets} 
          categories={data.categories}
          onDelete={actions.deleteTransaction} 
          onEdit={actions.handleEditTransaction}
        />
      );
    case AppView.WALLETS:
      return (
        <WalletManager 
          wallets={data.wallets} 
          onAdd={actions.wallet.add} 
          onDelete={actions.wallet.remove}
          onEdit={actions.wallet.update}
        />
      );
    case AppView.CATEGORIES:
      return (
        <CategoryManager 
           categories={data.categories}
           onAdd={actions.category.add}
           onDelete={actions.category.remove}
           onEdit={actions.category.update}
        />
      );
    case AppView.BUDGETS:
      return (
        <BudgetManager 
          budgets={data.budgets} 
          categories={data.categories}
          onAdd={actions.budget.add} 
          onDelete={actions.budget.remove}
          onEdit={actions.budget.update}
        />
      );
    case AppView.DEBTS:
      return (
        <DebtManager 
          debts={data.debts} 
          onAdd={actions.debt.add} 
          onDelete={actions.debt.remove} 
          onTogglePaid={actions.debt.togglePaid}
          onEdit={actions.debt.update}
        />
      );
    case AppView.ASSETS:
      return (
        <AssetManager 
          assets={data.assets} 
          onAdd={actions.asset.add} 
          onDelete={actions.asset.remove}
          onEdit={actions.asset.update}
        />
      );
    case AppView.SMART_ENTRY:
      return <SmartEntry onAddTransactions={actions.handleAddTransactions} onDone={() => setCurrentView(AppView.TRANSACTIONS)} />;
    case AppView.INSIGHTS:
      return <FinancialInsights transactions={data.transactions} user={user} />;
    case AppView.PROFILE:
      return <Profile user={user} onUpdateUser={actions.updateUser} />;
    case AppView.SETTINGS:
      return <Settings user={user} onUpdateUser={actions.updateUser} />;
    case AppView.EXPORT:
      return <ExportPage transactions={data.transactions} wallets={data.wallets} />;
    case AppView.NOTIFICATIONS:
      return <NotificationCenter />;
    case AppView.HELP:
      return <HelpCenter />;
    case AppView.ADMIN_DASHBOARD:
      return user.role === 'ADMIN' 
        ? <AdminDashboard allTransactions={data.allTransactions} onRefresh={() => {}} /> 
        : <ErrorPage code="403" onHome={() => setCurrentView(AppView.DASHBOARD)} />;
    default:
      return <ErrorPage code="404" onHome={() => setCurrentView(AppView.DASHBOARD)} />;
  }
};

export default AppRouter;

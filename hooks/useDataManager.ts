
import { useState, useEffect } from 'react';
import { Transaction, Wallet, Budget, Debt, Asset, Category, INITIAL_CATEGORIES, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useDataManager = (user: User | null) => {
  // --- STATE INITIALIZATION ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('wallets');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    if (saved) return JSON.parse(saved);
    return INITIAL_CATEGORIES.map(c => ({ ...c, id: uuidv4(), userId: 'system' }));
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('debts');
    return saved ? JSON.parse(saved) : [];
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('assets');
    return saved ? JSON.parse(saved) : [];
  });

  // --- PERSISTENCE ---
  useEffect(() => {
    if (user) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
      localStorage.setItem('wallets', JSON.stringify(wallets));
      localStorage.setItem('categories', JSON.stringify(categories));
      localStorage.setItem('budgets', JSON.stringify(budgets));
      localStorage.setItem('debts', JSON.stringify(debts));
      localStorage.setItem('assets', JSON.stringify(assets));
    }
  }, [transactions, wallets, categories, budgets, debts, assets, user]);

  // --- INITIAL SETUP FOR NEW USER ---
  useEffect(() => {
    if (user && wallets.filter(w => w.userId === user.id).length === 0) {
      const defaultWallets: Wallet[] = [
        { id: uuidv4(), userId: user.id, name: 'Tunai', type: 'CASH', balance: 0 },
        { id: uuidv4(), userId: user.id, name: 'Bank BCA', type: 'BANK', balance: 0 }
      ];
      setWallets(prev => [...prev, ...defaultWallets]);
    }
  }, [user]);

  // --- FILTERED DATA ---
  const userTransactions = user ? transactions.filter(t => t.userId === user.id) : [];
  const userWallets = user ? wallets.filter(w => w.userId === user.id) : [];
  const userBudgets = user ? budgets.filter(b => b.userId === user.id) : [];
  const userDebts = user ? debts.filter(d => d.userId === user.id) : [];
  const userAssets = user ? assets.filter(a => a.userId === user.id) : [];
  const userCategories = user ? categories.filter(c => c.isDefault || c.userId === user.id) : [];

  // --- BUSINESS LOGIC ---

  const handleAddTransactions = (newTransactions: Omit<Transaction, 'userId'>[]) => {
    if (!user) return;
    const transactionsWithUser = newTransactions.map(t => ({ ...t, userId: user.id })) as Transaction[];
    
    const updatedWallets = [...wallets];
    transactionsWithUser.forEach(t => {
      const sourceIdx = updatedWallets.findIndex(w => w.id === t.walletId);
      if (sourceIdx !== -1) {
        if (t.type === 'INCOME') updatedWallets[sourceIdx].balance += t.amount;
        else updatedWallets[sourceIdx].balance -= t.amount;
      }
      if (t.type === 'TRANSFER' && t.toWalletId) {
        const destIdx = updatedWallets.findIndex(w => w.id === t.toWalletId);
        if (destIdx !== -1) updatedWallets[destIdx].balance += t.amount;
      }
    });
    
    setWallets(updatedWallets);
    setTransactions(prev => [...transactionsWithUser, ...prev]);
  };

  const handleEditTransaction = (updatedT: Transaction) => {
    const oldT = transactions.find(t => t.id === updatedT.id);
    if (!oldT) return;

    const updatedWallets = [...wallets];
    
    // 1. Revert Old Transaction
    const oldSourceIdx = updatedWallets.findIndex(w => w.id === oldT.walletId);
    if (oldSourceIdx !== -1) {
      if (oldT.type === 'INCOME') updatedWallets[oldSourceIdx].balance -= oldT.amount;
      else updatedWallets[oldSourceIdx].balance += oldT.amount;
    }
    if (oldT.type === 'TRANSFER' && oldT.toWalletId) {
      const oldDestIdx = updatedWallets.findIndex(w => w.id === oldT.toWalletId);
      if (oldDestIdx !== -1) updatedWallets[oldDestIdx].balance -= oldT.amount;
    }

    // 2. Apply New Transaction
    const newSourceIdx = updatedWallets.findIndex(w => w.id === updatedT.walletId);
    if (newSourceIdx !== -1) {
      if (updatedT.type === 'INCOME') updatedWallets[newSourceIdx].balance += updatedT.amount;
      else updatedWallets[newSourceIdx].balance -= updatedT.amount;
    }
    if (updatedT.type === 'TRANSFER' && updatedT.toWalletId) {
      const newDestIdx = updatedWallets.findIndex(w => w.id === updatedT.toWalletId);
      if (newDestIdx !== -1) updatedWallets[newDestIdx].balance += updatedT.amount;
    }

    setWallets(updatedWallets);
    setTransactions(prev => prev.map(t => t.id === updatedT.id ? updatedT : t));
  };

  const deleteTransaction = (id: string) => {
    const t = transactions.find(tx => tx.id === id);
    if (t) {
      const updatedWallets = [...wallets];
      const sourceIdx = updatedWallets.findIndex(w => w.id === t.walletId);
      if (sourceIdx !== -1) {
        if (t.type === 'INCOME') updatedWallets[sourceIdx].balance -= t.amount;
        else updatedWallets[sourceIdx].balance += t.amount;
      }
      if (t.type === 'TRANSFER' && t.toWalletId) {
        const destIdx = updatedWallets.findIndex(w => w.id === t.toWalletId);
        if (destIdx !== -1) updatedWallets[destIdx].balance -= t.amount;
      }
      setWallets(updatedWallets);
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Generic setters for simple CRUD
  const addWallet = (w: Wallet) => setWallets(prev => [...prev, { ...w, userId: user!.id }]);
  const updateWallet = (updatedW: Wallet) => setWallets(prev => prev.map(w => w.id === updatedW.id ? updatedW : w));
  const deleteWallet = (id: string) => setWallets(prev => prev.filter(w => w.id !== id));

  const addCategory = (c: Category) => setCategories(prev => [...prev, { ...c, userId: user!.id }]);
  const updateCategory = (updatedC: Category) => setCategories(prev => prev.map(c => c.id === updatedC.id ? updatedC : c));
  const deleteCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));

  const addBudget = (b: Budget) => setBudgets(prev => [...prev, { ...b, userId: user!.id }]);
  const updateBudget = (updatedB: Budget) => setBudgets(prev => prev.map(b => b.id === updatedB.id ? updatedB : b));
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));

  const addDebt = (d: Debt) => setDebts(prev => [...prev, { ...d, userId: user!.id }]);
  const updateDebt = (updatedD: Debt) => setDebts(prev => prev.map(d => d.id === updatedD.id ? updatedD : d));
  const toggleDebtPaid = (id: string) => setDebts(prev => prev.map(d => d.id === id ? { ...d, isPaid: !d.isPaid } : d));
  const deleteDebt = (id: string) => setDebts(prev => prev.filter(d => d.id !== id));

  const addAsset = (a: Asset) => setAssets(prev => [...prev, { ...a, userId: user!.id }]);
  const updateAsset = (updatedA: Asset) => setAssets(prev => prev.map(a => a.id === updatedA.id ? updatedA : a));
  const deleteAsset = (id: string) => setAssets(prev => prev.filter(a => a.id !== id));

  return {
    // Data
    allTransactions: transactions, // Needed for admin
    transactions: userTransactions,
    wallets: userWallets,
    categories: userCategories,
    budgets: userBudgets,
    debts: userDebts,
    assets: userAssets,
    // Actions
    handleAddTransactions,
    handleEditTransaction,
    deleteTransaction,
    walletActions: { add: addWallet, update: updateWallet, remove: deleteWallet },
    categoryActions: { add: addCategory, update: updateCategory, remove: deleteCategory },
    budgetActions: { add: addBudget, update: updateBudget, remove: deleteBudget },
    debtActions: { add: addDebt, update: updateDebt, togglePaid: toggleDebtPaid, remove: deleteDebt },
    assetActions: { add: addAsset, update: updateAsset, remove: deleteAsset },
  };
};
